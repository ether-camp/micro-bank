(function() {

    'use strict';

    mbApp.controllers.controller('DebtorsListCotroller', ['$scope', 'DebtorService', DebtorsListCotroller]);

    function DebtorsListCotroller($scope, debtorService) {

        debtorService.getDebtors()
            .then(function(debtors) {
                $scope.debtors = debtors;
            }).catch(function(err) {
                console.error(err)
            });

        debtorService.getActiveDebtorsCount()
            .then(function(count) {
                $scope.activeDebtorsCount = count;
            }).catch(function(err) {
                console.error(err);
            });
    }

})();