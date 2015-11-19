(function() {

    'use strict';

    var ctrl = mbApp.utils.ctrl;

    mbApp.controllers
        .controller('CreditorController', ['$scope', '$routeParams', '$uibModal', 'CreditorService', 'TradeService', 'EventService', CreditorController])
        .controller('BidDialogController', ['$scope', '$uibModalInstance', 'askId', BidDialogController]);

    function CreditorController($scope, $routeParams, $uibModal, creditorService, tradeService, eventService) {
        var address = $routeParams.address;

        _.extend($scope, {
            address: address,
            bids: [],
            asks: [],
            creditor: {},
            addBid: addBid,
            cancelBid: cancelBid,
            deposit: deposit
        });

        creditorService.getCreditor(address).then(function(creditor) {
            $scope.creditor = creditor;
        });

        tradeService.getBids(address, false).then(function(bids) {
            $scope.bids = bids;
        });

        tradeService.getAllAsksIds().then(function(ids) {
            _.each(ids, function(id) {
                tradeService.getAsk(id).then(function(ask) {
                    $scope.asks.unshift(ask);
                });
            });
        });

        function deposit(value) {
            creditorService.deposit(value);
        };


        function addBid(ask) {
            var dlg = $uibModal.open({
                animation: true,
                templateUrl: '../template/creditors/bid-dialog.html',
                controller: 'BidDialogController',
                resolve: {
                    askId: function() {
                        return ask.id;
                    }
                }
            });

            dlg.result.then(function(bid) {
                tradeService.addBid(bid.askId, bid.amount, bid.percents);
            });
        }

        function cancelBid(bidId) {
            tradeService.cancelBid(bidId);
        }


        var listeners = [];

        function listen(eventName, handler) {
            var listener = $scope.$on(eventName, handler);
            listeners.push(listener);
        }

        $scope.$on('$destroy', function() {
            _.each(listeners, function(listener) {
                listener();
            });
        });


        listen('bid:added', function(e, args) {
            if (args.creditor !== address) return;
            
            var idx = _.findIndex($scope.asks, function(ask) {
                return ask.id === args.askId.toNumber();
            });

            $scope.asks.splice(idx, 1);

            tradeService.getBid(args.bidId.toNumber()).then(function(bid) {
                $scope.bids.unshift(bid);
            });
        });


        listen('bid:cancelled', function(e, args) {
            if (args.creditor !== address) return;
            
            var idx = _.findIndex($scope.bids, function(bid) {
                return bid.id === args.bidId.toNumber();
            });

            $scope.bids.splice(idx, 1);

            tradeService.getAsk(args.askId.toNumber()).then(function(ask) {
                $scope.asks.push(ask);
            });
        });
        
        listen('ask:added', function(e, args) {
            tradeService.getAsk(args.askId.toNumber()).then(function(ask) {
                $scope.asks.unshift(ask);
            });
        });


        listen('ask:cancelled', function(e, args) {
            var idx = _.findIndex($scope.asks, function(ask) {
                return ask.id === args.askId.toNumber();
            });

            $scope.asks.splice(idx, 1);
        });
    }


    function BidDialogController($scope, $uibModalInstance, askId) {
        $scope.askId = askId;
        $scope.amount = ctrl.emptyField(/^\d{2,20}$/);
        $scope.percents = ctrl.emptyField(/^\d{2,20}$/);

        $scope.ok = function() {
            $uibModalInstance.close({
                askId: $scope.askId,
                amount: $scope.amount.value,
                percents: $scope.percents.value
            });
        };

        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };
    }


})();