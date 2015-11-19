(function() {

    'use strict';

    mbApp.services.factory('CreditorService', ['MicroBank', 'Web3Service', '$q', CreditorService]);

    function CreditorService(mb, web3, $q) {

        return {
            withdraw: withdraw,
            withdrawAll: withdrawAll,
            deposit: deposit,
            getCreditor: getCreditor,
            getCreditors: getCreditors,
            updateUsername: updateNickname,
            updateInfo: updateInfo
        };

        function updateNickname(nickname) {
            return mb.withCtx().creditorUpdateNick(nickname);
        }

        function updateInfo(field, value) {
            return mb.withCtx().creditorUpdateInfo(field, value);
        }

        function withdraw(amount) {
            return mb.withCtx().creditorWithdraw(amount);
        }

        function withdrawAll() {
            return mb.withCtx().creditorWithdrawAll();
        }

        function deposit(value) {
            var ctx = mb.defaultCtx();
            ctx.tx.value = value;
            
            return mb.withCtx(ctx).creditorDeposit();
        }

        function getCreditor(address) {
            var dfd = $q.defer();

            mb.withCtx()
                .batchInvokation()
                .getCreditorNick(address)
                .getCreditorInfo(address, 'firstName')
                .getCreditorInfo(address, 'lastName')
                .getCreditorInfo(address, 'desc')
                .getCreditorBalance(address)
                .invoke()
                .then(function(data) {
                    dfd.resolve({
                        address: address,
                        nickname: web3.toAscii(data[0]),
                        firstName: data[1],
                        lastName: data[2],
                        desc: data[3],
                        balance: data[4].toNumber()
                    });
                });

            return dfd.promise;
        }

        function getCreditors() {
            var result = $q.defer();

            var self = this;
            mb.withCtx().getCreditors().then(function(addresses) {
                var dfds = _.map(addresses, function(address) {
                    return self.getCreditor(address);
                });

                $q.all(dfds).then(function(creditors) {
                    result.resolve(creditors);
                });
            });

            return result.promise;
        }
    }

})();