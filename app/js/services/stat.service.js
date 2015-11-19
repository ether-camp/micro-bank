(function() {

    'use strict';

    mbApp.services.factory('StatService', ['$q', 'MicroBank', 'TradeService', StatService]);

    function StatService($q, mb, tradeService) {

        return {
            getBankStat: getBankStat
        };

        function getBankStat() {
            var dfd = $q.defer();

            mb.withCtx().batchInvokation()
                .getDebtors()
                .getCreditors()
                .invoke()
                .then(function(data) {
                    var debtors = data[0];
                    var creditors = data[1];
                    var bankStat = {
                        debtorsCount: _.size(debtors),
                        creditorsCount: _.size(creditors)
                    }

                    var promises = []
                    promises.push(getAskStat(debtors).then(function(asksStat) {
                        _.extend(bankStat, asksStat);
                    }));
                    // TODO: add bids stat collecting

                    $q.all(promises).then(function() {
                        dfd.resolve(bankStat);
                    });
                });

            return dfd.promise;
        }

        function getAskStat(debtors) {
            var dfd = $q.defer();

            var promises = [];
            _.each(debtors, function(debtor) {
                promises.push(tradeService.getAsks(debtor));
            });

            $q.all(promises).then(function(asks) {
                asks = _.flatten(asks);

                var amount = 0;
                _.each(asks, function(ask) {
                    amount += ask.amount;
                });

                dfd.resolve({
                    asksCount: _.size(asks),
                    asksAmount: amount
                });
            });

            return dfd.promise;
        }
    }

})();