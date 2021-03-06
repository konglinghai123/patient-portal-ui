(function () {
    'use strict';

    angular
        .module('app.consent')
        .directive('c2sConsentRevoke', c2sConsentRevoke);

    function c2sConsentRevoke() {
        var directive = {
            restrict: 'E',
            templateUrl: 'app/consent/directives/consentRevokeConfirmation.html',
            scope: {},
            controller: ConsentRevokeController,
            controllerAs: 'consentRevokeVm'
        };
        return directive;
    }

    /* @ngInject */
    function ConsentRevokeController($stateParams, $state, $modal, consentService, notificationService, utilityService) {
        var vm = this;
        vm.cancel = cancel;
        vm.params = $stateParams;
        vm.consentId = vm.params.consent.id;
        vm.revokeAttestation = vm.params.revokeAttestation;
        vm.revokeAttestation.acceptTerms = false;
        vm.revokeAttestation.patient = {};
        vm.revokeAttestation.patient.firstName = vm.params.revokeAttestation.patientFirstName;
        vm.revokeAttestation.patient.lastName = vm.params.revokeAttestation.patientLastName;
        vm.onchecked = onchecked;
        vm.openAuthenticateModal = openAuthenticateModal;
        vm.sign = sign;
        vm.openAttestedConsentRevocationPreviewModal = openAttestedConsentRevocationPreviewModal;

        activate();

        function activate() {
            if (angular.isUndefined(vm.params) || angular.equals(vm.params.consent, {}) || angular.equals(vm.params.revokeAttestation, {})) {
                cancel();
            }
        }

        function cancel() {
            $state.go('fe.consent.list');
        }

        function sign() {
            var success = function (response) {
                //notificationService.success("Consent is revoked successfully!");
                vm.openAttestedConsentRevocationPreviewModal();
            };

            var error = function (response) {
                notificationService.error("Error in revoking consent!");
            };

            consentService.createAttestedConsentRevocation(parseInt(vm.consentId), vm.revokeAttestation.acceptTerms, success, error);
        }

        function openAttestedConsentRevocationPreviewModal() {
            var modalInstance = $modal.open({
                templateUrl: 'app/consent/directives/consentRevocationPreviewAttestationModal.html',
                controller: PreviewAttestedConsentRevocationController,
                controllerAs: 'attestedConsentRevocationModalVm',
                backdrop: 'static',
                keyboard: false
            });
        }

        /* @ngInject */
        function PreviewAttestedConsentRevocationController($modalInstance, notificationService, profileService) {
            var attestedConsentRevocationModalVm = this;
            attestedConsentRevocationModalVm.closeAndRedirectAndToConsentList = closeAndRedirectAndToConsentList;
            attestedConsentRevocationModalVm.downloadAttestedConsentRevocationAndRedirectToConsentList = downloadAttestedConsentRevocationAndRedirectToConsentList;


            function closeAndRedirectAndToConsentList() {
                $modalInstance.dismiss('cancel');
            }


            function downloadAttestedConsentRevocationAndRedirectToConsentList() {
                var fileName = profileService.getName() + " revocation Consent" + vm.consentId;
                var success = function (data) {
                    utilityService.downloadFile(data, fileName, 'application/pdf');
                };
                var error = function (respone) {
                    notificationService.error("Error in downloading signed consent revocation pdf.");
                };
                consentService.downloadAttestedConsentRevocationPdf(vm.consentId, success, error);
            }
        }
        function onchecked() {
            if (vm.revokeAttestation.acceptTerms) {
                vm.openAuthenticateModal();
            } else {
                vm.isAuthenticated = false;
            }
        }

        function openAuthenticateModal() {
            var modalInstance = $modal.open({
                templateUrl: 'app/consent/directives/consentESignatureAuthenticateModal.html',
                controller: AuthenticateController,
                controllerAs: 'authenticateVm',
                backdrop: 'static',
                keyboard: false
            });
        }

        /* @ngInject */
        function AuthenticateController($modalInstance, notificationService, authenticationService, profileService) {
            var authenticateVm = this;
            authenticateVm.cancel = cancel;
            authenticateVm.ok = ok;
            authenticateVm.errorMessage = "";

            function cancel() {
                vm.revokeAttestation.acceptTerms = false;
                $modalInstance.dismiss('cancel');
            }

            function ok() {
                authenticate();
            }

            function authenticate() {
                var loginInfo = {
                    grant_type: 'password',
                    response_type: 'token',
                    username: profileService.getUserName(),
                    password: authenticateVm.password
                };
                var success = function (response) {
                    authenticateVm.errorMessage = "";
                    vm.isAuthenticated = true;
                    $modalInstance.close();
                };
                var error = function (error) {
                    vm.isAuthenticated = false;
                    authenticateVm.errorMessage = "Invalid password.";
                };

                authenticationService.login(loginInfo, success, error);
            }
        }
    }
})();