(function() {

    'use strict';

    mbApp.controllers.controller('CreditorsListController', ['$scope', 'CreditorService', CreditorsListController]);

    function CreditorsListController($scope, creditorService) {

        creditorService.getCreditors()
            .then(function(creditors) {
                $scope.creditors = creditors;
            });
    }

})();