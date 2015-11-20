(function() {

    'use strict';

    mbApp.controllers.controller('RegistrationController', ['$scope', '$routeParams', '$location', 'AuthService', 'RegistrationService', RegistrationController]);

    var ctrl = mbApp.utils.ctrl;
    var eth = mbApp.utils.eth;

    const TEST_DATA = {

        creditor: {
            nickname: 'DucksInc',
            firstName: 'Donald',
            lastName: 'Duck',
            desc: 'The richest Duck of the world !'
        },

        debtor: {
            nickname: 'WilyWerewolf',
            firstName: 'John',
            lastName: 'Doe',
            facebook: 'https://www.facebook.com/john.doe',
            email: 'john.doe@mail.com'
        }
    };

    function RegistrationController($scope, $routeParams, $location, authService, regService) {

        var accountType = $routeParams.accountType;
        var auth = null;
        var registration = false;
        $scope.alert = { show:false, text:"" }; // set alert

        _.extend($scope, {
            accountType: accountType,
            creditorRegistration: _.isEqual(accountType, 'creditor'),
            debtorRegistration: _.isEqual(accountType, 'debtor'),

            address: '0x',
            seed: {
                type: 'password',
                value: ''
            },

            // common fields            
            nickname: ctrl.emptyField(/^.{3,20}$/),
            firstName: ctrl.emptyField(/^[A-Z,a-z]{2,10}$/),
            lastName: ctrl.emptyField(/^[A-Z,a-z]{2,10}$/),
            // debtor fields
            facebook: ctrl.emptyField(/(?:(?:http|https):\/\/)?(?:www.)?facebook.com\/?/),
            email: ctrl.emptyField(/^[\w\.]+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/),
            // creditor fields            
            desc: ctrl.emptyField(/.{0,100}/),

            initTestData: initTestData,
            unavailiable: unavailiable,
            register: register,
            toggleSeedType: toggleSeedType
        });

        $scope.$watch('seed.value', function(seed) {
            if (_.isEmpty(seed)) {
                auth = null;
                $scope.address = '0x';
            }
            else {
                auth = eth.seedToAuth(seed);
                $scope.address = auth.address.toUpperCase().replace('X', 'x');
            }
        });

        function toggleSeedType() {
            var switcher = {
                password: 'text',
                text: 'password'
            };

            $scope.seed.type = switcher[$scope.seed.type];
        }

        function get() {
            var fields = {};
            _.each(_.toArray(arguments), function(fieldName) {
                fields[fieldName] = $scope[fieldName].value;    
            })
            
            return fields;
        }

        function register() {
            var accountData = get('nickname', 'firstName', 'lastName');
            switch (accountType) {
                case 'creditor':
                    _.extend(accountData, get('desc'));
                    break;
                case 'debtor':
                    _.extend(accountData, get('facebook', 'email'));
                    break;
            }

            $scope.alert.show = false; // hide alert
            registration = true;
            regService.register(accountType, auth, accountData)
                .then(function() {
                    $location.url('/' + accountType + 's/' + auth.address);
                }, function(error) {
                    console.log(error);
                    // show alert
                    $scope.alert.show = true;
                    $scope.alert.text = (error && error.message) ? error.message : "Unknown";
                })
                .finally(function() {
                    registration = false;
                });
        }

        function unavailiable() {
            return registration || $scope.microbank.$invalid || $scope[accountType].$invalid || ($scope.debtorRegistration && $scope.social.$invalid);
        }

        function initTestData() {
            _.each(TEST_DATA[accountType], function(value, fieldName) {
                $scope[fieldName].value = value;
            });
        }
    }

})();