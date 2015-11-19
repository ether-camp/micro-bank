(function() {
    
    'use strict';
    
    mbApp.services.factory('AdminService', ['AppConfig', 'ContractService', 'AuthService', AdminService]);
    
    function AdminService(AppConfig, contractService, authService) {
        
        var mb = contractService.microBank();
        
        return {
            addAdmin: addAdmin,
            removeAdmin: removeAdmin
        };
        
        function addAdmin(address) {
            
        }
        
        function removeAdmin(address) {
            
        }
    }
    
})();