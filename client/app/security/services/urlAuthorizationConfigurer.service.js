/**
 * Created by Jiahao.Li on 3/21/2016.
 */
(function () {
    'use strict';

    angular
        .module('app.security')
        .factory('urlAuthorizationConfigurerService', urlAuthorizationConfigurerService);

    /* @ngInject */
    function urlAuthorizationConfigurerService(accountConfig) {
        var requestMatcherRegistry = [
            "/fe/index",
            accountConfig.activationErrorPath,
            accountConfig.verificationPath,
            accountConfig.createPasswordPath,
            accountConfig.activationSuccessPath,
            accountConfig.forgotPasswordPath,
            accountConfig.resetPasswordSuccessPath
        ];
        var service = {};

        service.isAllowAccess = isAllowAccess;

        return service;

        function isAllowAccess(currentPath) {
            return requestMatcherRegistry.indexOf(currentPath) !== -1;
        }
    }
})();