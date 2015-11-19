(function() {

    'use strict';

    var ctrl = mbApp.utils.ctrl;

    mbApp.controllers
        .controller('DebtorController', ['$rootScope', '$scope', '$routeParams', '$uibModal', 'AuthService', 'DebtorService', 'TradeService', 'EventService', DebtorController])
        .controller('AskDialogController', ['$scope', '$uibModalInstance', AskDialogController]);

    function DebtorController($rootScope, $scope, $routeParams, $uibModal, authService, debtorService, tradeService, eventService) {
        var address = $routeParams.address;

        $scope.address = address;
        $scope.isOwner = authService.isOwner(address);
        $scope.asks = [];
        $scope.addAsk = addAsk;
        $scope.cancelAsk = cancelAsk;

        tradeService.getAsks(address).then(function(asks) {
            $scope.asks = _.sortBy(asks, function(ask) {
                return -ask.creationTime.valueOf();
            });
        });

        debtorService.getDebtor(address).then(function(debtor) {
            $scope.debtor = debtor;
        });

        function addAsk() {
            var dlg = $uibModal.open({
                animation: true,
                templateUrl: '../template/debtors/ask-dialog.html',
                controller: 'AskDialogController'
            });

            dlg.result.then(function(ask) {
                tradeService.addAsk(ask.amount, ask.duration, ask.comment);
            });
        }

        function cancelAsk(ask) {
            tradeService.cancelAsk(ask.id);
        }


        var listeners = [];
        function listen(eventName, handler) {
            var self = this;
            var listener = $scope.$on(eventName, function(event, args) {
                if (args.debtor === address)
                    handler.apply(self, arguments);
            });

            listeners.push(listener);
        }

        $scope.$on('$destroy', function() {
            _.each(listeners, function(listener) {
                listener();
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

        listen('bid:added', function(e, args) {
            var ask = _.find($scope.asks, function(ask) {
                return ask.id === args.askId.toNumber();
            });

            ask && ask.bidsCount++;
        });


        listen('bid:cancelled', function(e, args) {
            var ask = _.find($scope.asks, function(ask) {
                return ask.id === args.askId.toNumber();
            });

            ask && ask.bidsCount--;
        });
    }

    function AskDialogController($scope, $uibModalInstance) {
        $scope.amount = ctrl.emptyField(/^\d{2,20}$/);
        $scope.duration = ctrl.emptyField(/^\d{2,20}$/);
        $scope.comment = ctrl.emptyField(/^.{2,100}$/);

        $scope.ok = function() {
            $uibModalInstance.close({
                amount: $scope.amount.value,
                duration: $scope.duration.value,
                comment: $scope.comment.value
            });
        };

        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };
    }

})();