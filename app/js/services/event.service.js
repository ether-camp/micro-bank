(function() {

    'use strict';

    mbApp.services.factory('EventService', ['$rootScope', 'ContractService', EventService]);

    var events = {
        AskEvent: {
            namespace: 'ask',
            codes: {
                "1": 'added',
                "2": 'cancelled'
            }
        },
        
        BidEvent: {
            namespace: 'bid',
            codes: {
                "1": 'added',
                "2": 'cancelled',
                "3": 'accepted'
            }
        }
    }


    function EventService($rootScope, contracts) {
        var mb = contracts.microBank();
        _.each(events, function(metadata, type) {
            mb.on(type, function(err, resp) {
                var args = resp.args;
                var name = metadata.namespace + ':' + metadata.codes[args.code];

                console.log(name);

                $rootScope.$broadcast(name, args);
            });
        });


        return {};
    }

})();