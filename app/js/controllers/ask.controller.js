(function() {

    'use strict';

    var ctrl = mbApp.utils.ctrl;

    mbApp.controllers
        .controller('AskController', ['$scope', '$routeParams', 'TradeService', 'EventService', AskController]);

    function AskController($scope, $routeParams, tradeService, eventService) {
        var address = $routeParams.address;
        var askId = $routeParams.askId;

        _.extend($scope, {
            address: address,
            bids: [],
            asks: [],
            creditor: {},
            addBid: addBid,
            cancelBid: cancelBid,
            deposit: deposit
        });

    }

})();