(function() {

    'use strict';

    mbApp.controllers.controller('MainController', ['$scope', '$location', 'AuthService', 'DebtorService', 'Web3Config', MainController]);

    function MainController($scope, $location, authService, DebtorService, Web3Config) {

        $scope.http_provider = Web3Config.PROVIDER;
        
        if (!authService.isAnonymous()) {
            $location.url('/dashboard');
        } 
    }

})();