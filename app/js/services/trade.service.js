(function() {

    'use strict';

    mbApp.services.factory('TradeService', ['$q', 'MicroBank', TradeService]);

    function TradeService($q, mb) {

        return {
            getBid: getBid,
            getBids: getBids,
            addBid: addBid,
            acceptBid: acceptBid,
            cancelBid: cancelBid,
            getAsk: getAsk,
            getAsks: getAsks,
            addAsk: addAsk,
            cancelAsk: cancelAsk,
            getDebtorAsk: getDebtorAsk,
            getAllAsksIds: getAllAsksIds,
            getCreditorBid: getCreditorBid
        };


        function getByIds(idsDfd, getEntity) {
            var dfd = $q.defer();

            idsDfd.then(function(ids) {
                if (_.isEmpty(ids)) {
                    dfd.resolve([]);
                    return;
                }

                var dfds = [];
                _.each(ids, function(id) {
                    dfds.push(getEntity(id));
                });

                $q.all(dfds).then(function(entities) {
                    dfd.resolve(entities);
                });
            });

            return dfd.promise;
        }



        function getAsk(askId) {
            var dfd = $q.defer();

            mb.withCtx().batchInvokation()
                .getAskDebtor(askId)
                .getAskTime(askId)
                .getAskAmount(askId)
                .getAskRemainingAmount(askId)
                .getAskCreditDays(askId)
                .getAskComment(askId)
                .getAskBidsCount(askId)
                .invoke()
                .then(function(data) {
                    dfd.resolve({
                        id: askId,
                        debtor: data[0],
                        creationTime: moment(data[1].toNumber() * 1000),
                        amount: data[2].toNumber(),
                        remainingAmount: data[3].toNumber(),
                        creditDays: data[4].toNumber(),
                        comment: data[5],
                        bidsCount: data[6].toNumber()
                    });
                });

            return dfd.promise;
        }

        function getDebtorAsk(address, idx) {
            return mb.withCtx().getDebtorAsk(address, idx).then(function(askId) {
                return getAsk(askId);
            });
        }

        function getAsks(address, active) {
            var getIds = active ? 'getDebtorActiveAsks' : 'getDebtorAsks';
            var idsDfd = mb.withCtx()[getIds](address);
            
            return getByIds(idsDfd, getAsk);
        }

        function getAllAsksIds(active) {
            var dfd = $q.defer();
            mb.withCtx().getDebtors().then(function(addresses) {
                if (_.isEmpty(addresses)) {
                    dfd.resolve([]);
                    return;
                }
                
                var batch = mb.withCtx().batchInvokation();    
                _.each(addresses, function(address) {
                    batch[active ? 'getDebtorActiveAsks' : 'getDebtorAsks'](address);
                })
                
                batch.invoke().then(function(ids) {
                    ids = _.flatten(ids);
                    dfd.resolve(_.map(ids, function(id) {
                        return id.toNumber()
                    }));
                });
            });
            
            return dfd.promise;
        }

        function addAsk(amount, creditDays, comment) {
            return mb.withCtx().debtorAddAsk(amount, creditDays, comment);
        }

        function cancelAsk(askId) {
            return mb.withCtx().debtorCancelAsk(askId);
        }

        function getBid(bidId) {
            var dfd = $q.defer();

            mb.withCtx()
                .batchInvokation()
                .getBidCreditor(bidId)
                .getBidTime(bidId)
                .getBidAmount(bidId)
                .getBidPercents(bidId)
                .getBidDeal(bidId)
                .getBidRemainingAmount(bidId)
                .invoke()
                .then(function(data) {
                    dfd.resolve({
                        id: bidId,
                        creditorAddress: data[0],
                        time: data[1],
                        amount: data[2],
                        percents: data[3],
                        dealId: data[4],
                        remainingAmount: data[5]
                    });

                });

            return dfd.promise;
        }

        function getBids(address, active) {
            var getIdsName= active ? 'getCreditorActiveBidIds' : 'getCreditorBidIds';
            var idsDfd = mb.withCtx()[getIdsName](address);
            
            return getByIds(idsDfd, getBid);
        }

        function addBid(askId, amount, percentsPerDay) {
            return mb.withCtx().creditorAddBid(askId, amount, percentsPerDay);
        }

        function acceptBid(bidId, amount) {
            return mb.withCtx().debtorAcceptBid(bidId, amount);
        }


        function cancelBid(bidId) {
            return mb.withCtx().creditorCancelBid(bidId);
        }
        
        function getCreditorBid(address, idx) {
            return mb.withCtx().getCreditorBidId(address, idx).then(function(id) {
                return getBid(id);                
            });    
        }
    }

})();