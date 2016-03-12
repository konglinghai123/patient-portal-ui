(function () {
    'use strict';

    angular
        .module('app.security')
        .directive('ppOauthLogout', ppOauthLogout);

    function ppOauthLogout() {

        var directive = {
            restrict: 'E',
            replace: true,
            templateUrl: 'app/security/directives/oauthLogout.html',
            scope: {},
            bindToController: {},
            controller: OauthLogoutController,
            controllerAs: 'oauthLogoutVm'
        };

        return directive;

        /* @ngInject */
        function OauthLogoutController(authInterceptorService) {
            var vm = this;
            vm.logout = logout;

            function logout() {
                authInterceptorService.logout();
            }
        }
    }
})();