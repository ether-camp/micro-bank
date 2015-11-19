(function() {

    'use strict';

    mbApp.controllers.controller('DashboardController', ['$rootScope', '$q', 'AuthService', '$scope', 'CreditorService', 'DebtorService', 'ContractService', 'StatService', DashboardController]);

    var EthUtils = require('eth-utils');

    function DashboardController($rootScope, $q, authService, $scope, creditorService, debtorService, contractService, statService) {

        _.extend($scope, {
            debtorsCount: 0,
            creditorsCount: 0,
            asksCount: 0,
            asksAmount: 0
        });

        _.extend($scope, {
            isAnonymous: authService.isAnonymous()
        });

        statService.getBankStat().then(function(stat) {
            _.extend($scope, stat);
        });
    }

})();