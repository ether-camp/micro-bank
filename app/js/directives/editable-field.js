(function() {

    'use strict';

    mbApp.directives.directive('editableField', [function() {

        return {
            restrict: 'E',
            replace: true,
            scope: {
                efName: '=',
                efModel: '=',
                efLabel: '=',
                efHolder: '='
            },
            templateUrl: 'templates/directives/editable-field.html',
            link: function(scope, element, attrs) {

            }
        };
    }]);

})();