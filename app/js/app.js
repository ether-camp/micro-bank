'use strict';

var mbApp = angular.module('mbApp', [
    'ngRoute',
    'ngCookies',

    'mbApp.services',
    'mbApp.controllers',
    'mbApp.filters',
    'mbApp.directives',
    'mbApp.constants'
]);

_.extend(mbApp, {
    constants: angular.module('mbApp.constants', []),
    services: angular.module('mbApp.services', [
        'mbApp.constants'
    ]),
    controllers: angular.module('mbApp.controllers', [
        'ui.bootstrap'
    ]),
    filters: angular.module('mbApp.filters', []),
    directives: angular.module('mbApp.directives', [
        'ui.bootstrap'
    ])
});

(function() {

    var EthUtils = require('eth-utils');

    mbApp.utils = {
        
        ctrl: {
            
            field: function(value, pattern) {
                return {
                    value: value,
                    pattern: pattern
                };
            },

            emptyField: function(pattern) {
                return this.field('', pattern);
            }
        },
        
        eth: _.extend(EthUtils, {
            
            seedToAuth: function(seed) {
                var seedHash = EthUtils.signToPKey(seed);
                return {
                    seedHash: seedHash,
                    address: EthUtils.toAddress(seedHash)
                };
            }
        })
    };

})();