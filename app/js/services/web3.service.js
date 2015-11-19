(function() {

    'use strict';

    mbApp.services.factory('Web3Service', ['Web3Config', Web3Service]);

    var Web3 = require('web3');

    function Web3Service(Web3Config) {
        
        var web3 = new Web3(new Web3.providers.HttpProvider(Web3Config.PROVIDER));

        return _.extend(web3, { });
    }

})();