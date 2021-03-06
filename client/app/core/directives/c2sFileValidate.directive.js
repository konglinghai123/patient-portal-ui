(function () {
    'use strict';

    angular
        .module('app.core')
        .directive("c2sFileValidate", c2sFileValidate);

    /* @ngInject */
    function c2sFileValidate() {
        var directive = {
            restrict: 'A',
            require: 'ngModel',
            link: linkFunc
        };

        return directive;

        /* @ngInject */
        function linkFunc(scope, el, attrs, ngModel) {
            ngModel.$render = function () {
                ngModel.$setViewValue(el.val());
            };

            el.bind('change', function () {
                scope.$apply(function () {
                    ngModel.$render();
                });
            });

            el.bind('change', function () {
                var LIMITEDSIZE = 10485760;
                var fileSize = this.files[0].size;

                if (fileSize > LIMITEDSIZE) {
                    ngModel.$setValidity("sizeLimit", false);
                } else {
                    ngModel.$setValidity("sizeLimit", true);
                }
            });
        }
    }
})();