(function() {

    'use strict';

    mbApp.services.factory('ContractService', ['Web3Service', 'ContractConfig', '$q', ContractService]);

    var EthUtils = require('eth-utils');
    var Web3 = require('web3');


    function ContractService(web3, ContractConfig, $q) {


        const DEFAULT_GAS_PRICE = 70000000000;
        const DEFAULT_GAS_LIMIT = 1000000;

        var Contract = function(web3, name, contract) {
            _.extend(this, {
                original: contract,
                name: name || '',
                web3: contract._web3,
                with: function(ctx) {
                    this.ctx = ctx;
                    return this;
                },

                batchInvokation: function() {
                    this.promises = [];
                    this.batch = this.web3.createBatch();
                    return this;
                },

                invoke: function() {
                    this.batch.execute();
                    this.batch = null;

                    return $q.all(this.promises);
                },

                on: function() {
                    var args = _.toArray(arguments);
                    var eventName = args.shift();
                    var callback = args.pop();
                    
                    var event = this.original[eventName].apply(this.original, args);
                    event && addEvent(event.watch(callback));

                    return this;
                },

                off: function() {
                    var args = _.toArray(arguments);
                    var eventName = args.shift();
                    
                    var event = removeEvent(eventName);
                    event && event.stopWatching();

                    return this;
                }
            });


            var self = this;

            function addEvent(name, event) {
                self.events || (self.events = {});
                self.events[name] = event;
            };

            function removeEvent(name) {
                var event = null;
                if (_.has(self.events, name)) {
                    var event = self.events[name];
                    self.events = _.omit(self.events, name);
                }

                return event;
            };

            function addToBatch(request, dfd) {
                // fix params
                request.params.push('latest');
                _.each(request.params, function(param, i) {
                    request.params[i] = _.clone(param);
                });

                self.batch.add(request);
                self.promises.push(dfd.promise);

                return self;
            };

            function solFunc(abi, args) {
                self.fns || (self.fns = {});

                var fn = self.fns[abi.name];
                if (!fn) {
                    fn = new SolidityFunction(self.web3, abi, self.original.address);
                    // fn = new SolidityFunction(this.web3, abi, '');
                    self.fns[abi.name] = fn;
                }

                return fn;
            };



            var abi = _.groupBy(contract.abi, 'type');
            
            _.each(abi.function, function(methodAbi) {

                self[methodAbi.name] = function() {
                    var args = _.toArray(arguments);
                    var dfd = $q.defer();
                    var ctx = self.ctx;

                    if (methodAbi.constant) {
                        ctx.tx && args.push(ctx.tx);
                        args.push(function(err, result) {
                            if (err) {
                                dfd.reject(err);
                                console.log(self.name + '.' + methodAbi.name + '(...) execution error: ' + err);
                            }
                            else {
                                dfd.resolve(result);
                            }
                        });

                        var method = self.original[methodAbi.name];
                        if (self.batch) {
                            // originl contract batch method invocation
                            addToBatch(method.request.apply(method, args), dfd);
                            return self;
                        }
                        else {
                            // originl contract method invocation
                            method.apply(self.original, args);
                            return dfd.promise;
                        }

                    }
                    else {
                        self.web3.eth.getTransactionCount(ctx.tx.from, 'pending', function(err, nonce) {
                            if (err) {
                                dfd.reject(err);
                                return;
                            }

                            var txRlp = EthUtils.createTx({
                                nonce: nonce,
                                value: ctx.tx.value || 0,
                                data: solFunc(methodAbi).toPayload(args).data,
                                gasLimit: DEFAULT_GAS_LIMIT,
                                gasPrice: DEFAULT_GAS_PRICE,
                                pkey: ctx.client.seedHash,
                                to: contract.address
                            });

                            self.web3.eth.sendRawTransaction(txRlp, function(err, txHash) {

                                if (err) {
                                    dfd.reject(err);
                                    return;
                                }

                                var blockCounter = 10;
                                var filter = self.web3.eth.filter('latest');
                                filter.watch(function(err, blockHash) {

                                    --blockCounter;

                                    var block = self.web3.eth.getBlock(blockHash, true);
                                    if (_.contains(block.transactions, txHash)) {
                                        filter.stopWatching();
                                        dfd.resolve(txHash);
                                    }
                                    else if (blockCounter) {
                                        dfd.notify(blockCounter);
                                    }
                                    else {
                                        filter.stopWatching();
                                        dfd.reject(txHash);
                                    }
                                });

                                self.web3.eth.getTransaction(txHash, function(err, tx) {
                                    if (!err && tx && tx.blockHash) {
                                        filter.stopWatching();
                                        dfd.resolve(txHash);
                                    }
                                });
                            });
                        });

                        return dfd.promise;
                    }
                }
            });
        }


        var loaded = [];
        var service = {

            load: function(abi, address, force) {
                var contract = loaded[address];
                if (!contract || force) {
                    contract = web3.eth.contract(abi).at(address);
                    loaded[address] = contract;
                }
                return contract;
            },

        };

        _.each(ContractConfig, function(cfg, name) {
            service[name] = function() {
                var contract = service.load(cfg.abi, cfg.address)
                return new Contract(web3, name, contract);
            };
        });

        return service;
    }

})();