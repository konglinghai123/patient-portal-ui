/**
 * Created by Jiahao.Li on 3/18/2016.
 */

(function () {
    'use strict';

    angular
        .module('app.account')
        .directive('mhcAccountVerification', mhcAccountVerification);

    function mhcAccountVerification() {

        var directive = {
            restrict: 'E',
            replace: true,
            templateUrl: 'app/account/directives/verification.html',
            scope: {},
            bindToController: {},
            controller: VerificationController,
            controllerAs: 'verificationVm'
        };

        return directive;
    }

    /* @ngInject */
    function VerificationController($state, utilityService, notificationService, accountService, emailTokenService, accountConfig) {
        var vm = this;
        var verificationFormMaster = {month: "", day: "", year: "", verificationCode: ""};

        vm.clearField = clearField;
        vm.verify = verify;

        function prepareVerification() {
            var birthDate = vm.verifyInfo.year + '-' + vm.verifyInfo.month + '-' + vm.verifyInfo.day;
            return {
                emailToken: emailTokenService.getEmailToken(),
                verificationCode: vm.verifyInfo.verificationCode,
                birthDate: birthDate
            };
        }

        function verifySuccess(response) {
            notificationService.success("Success in verifying.");
            var verifyInfo = prepareVerification();
            accountService.setVerifyInfo(verifyInfo);
            accountService.setUserName(response.username);
            utilityService.redirectTo(accountConfig.createPasswordPath);
        }

        function verifyError(response) {
            notificationService.error("Error in verifying.");
            $state.go($state.current, {}, {reload: true});
        }

        function verify() {
            var verifyInfo = prepareVerification();
            accountService.verifyPatient(verifyInfo, verifySuccess, verifyError);
        }

        function clearField(verificationForm) {
            if (verificationForm) {
                verificationForm.$setPristine();
                verificationForm.$setUntouched();
                vm.verifyInfo = angular.copy(verificationFormMaster);
            }
        }
    }
})();