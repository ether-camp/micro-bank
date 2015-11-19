(function() {

    'use strict';

    mbApp.services.factory('DebtorService', ['$q', 'MicroBank', 'Web3Service', DebtorService]);

    function DebtorService($q, mb, web3) {

        return {
            confirmPublicProfile: confirmPublicProfile,
            removePublicProfile: removePublicProfile,
            updateInfo: updateInfo,
            getActiveDebtorsCount: getActiveDebtorsCount,
            getDebtor: getDebtor,
            getActiveDebtors: getActiveDebtors,
            getDebtors: getDebtors
        };

        function confirmPublicProfile(address, profileName, url) {
            return mb.withCtx().debtorConfirmPublicProfile(address, profileName, url);
        }

        function removePublicProfile(profileName) {
            return mb.withCtx().debtorRemovePublicProfile(profileName);
        }

        function updateInfo(infoField, info) {
            return mb.withCtx().debtorUpdateInfo(infoField, info);
        }

        function getActiveDebtorsCount() {
            return mb.withCtx().getActiveDebtorsCount();
        }

        function getDebtor(address) {
            var dfd = $q.defer();

            mb.withCtx().batchInvokation()
                .getDebtorNick(address)
                .getDebtorInfo(address, 'firstName')
                .getDebtorInfo(address, 'lastName')
                .getDebtorInfo(address, 'facebook')
                .getDebtorInfo(address, 'email')
                .getDebtorAsksCount(address)
                .getDebtorActiveAsksCount(address)
                // .getDebtorPublicProfile(address,)
                .invoke()
                .then(function(data) {
                    dfd.resolve({
                        address: address,
                        nickname: web3.toAscii(data[0]),
                        firstName: data[1],
                        lastName: data[2],
                        facebook: data[3],
                        email: data[4],
                        askCount: data[5].toNumber(),
                        activeAskCount: data[6].toNumber()
                    });
                });

            return dfd.promise;
        }

        function getActiveDebtors(page, size) {
            page || (page = 0);
            size || (size = 10);
            var offset = page * size;

            var result = $q.defer();
            var self = this;
            this.getActiveDebtorsCount().then(function(count) {
                if (count && (offset < count)) {

                    var batch = self.batchInvokation();
                    _.times(Math.min(count - offset, size), function(i) {
                        return batch.getActiveDebtor(i + offset);
                    });

                    batch.invoke().then(function(addresses) {
                        var dfds = _.map(addresses, function(address) {
                            return self.getDebtor(address);
                        });


                        $q.all(dfds).then(function(debtors) {
                            result.resolve(debtors);
                        });
                    });
                }
                else {
                    result.resolve([]);
                }
            });

            return result.promise;
        }

        function getDebtors(page, size) {
            page || (page = 0);
            size || (size = 10);
            var offset = page * size;

            var result = $q.defer();
            var self = this;
            mb.withCtx().getDebtors().then(function(addresses) {
                var dfds = _.map(addresses, function(address) {
                    return self.getDebtor(address);
                });

                $q.all(dfds).then(function(debtors) {
                    result.resolve(debtors);
                });
            });

            return result.promise;
        }
    }

})();