(function() {

    'use strict';

    mbApp.services.factory('MicroBank', ['AppConfig', 'ContractService', 'AuthService', MicroBank]);

    function MicroBank(AppConfig, contractService, authService) {

        var mb = contractService.microBank();
        
        return {
            withCtx: withContext,
            defaultCtx: defaultContext
        };

        function withContext(context) {
            var ctx = (_.isFunction(context) && context()) || context || defaultContext();

            return mb.with(ctx);
        }
        
        function defaultContext() {
            return {
                client: authService.getClientInfo(),
                tx: {
                    from: authService.getAddress() || AppConfig.SU_ADDRESS
                }
            };
        }
    }

})();