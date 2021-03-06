(function () {
    'use strict';

    angular
        .module('app.consent')
        .directive('c2sConsentCreate', c2sConsentCreate);

    /* @ngInject */
    function c2sConsentCreate() {

        var directive = {
            restrict: 'E',
            templateUrl: 'app/consent/directives/consentCreateEdit.html',
            scope: {},
            bindToController: {
                providers: "=",
                purposeofuse: "=",
                sensitivitypolicies: "=",
                consent: "="
            },
            controller: ConsentCreateController,
            controllerAs: 'consentCreateVm'
        };
        return directive;
    }

    /* @ngInject */
    function ConsentCreateController($state, $modal, $stateParams, notificationService, consentService, utilityService, profileService) {
        var vm = this;
        vm.username = profileService.getName();
        vm.authorize = "Authorize";
        vm.disclosure = "Disclosure";
        vm.dateRange = {consentStart: "", consentEnd: ""};
        vm.medicalInformation = {doNotShareSensitivityPolicyCodes: []};
        vm.createConsent = createConsent;
        vm.updateConsent = updateConsent;
        vm.cancelConsent = cancelConsent;
        vm.canSave = canSave;

        activate();

        function activate() {
            if (angular.isDefined($stateParams.consentId) && $stateParams.consentId.length > 0) {

                vm.isEditMode = angular.isDefined($stateParams.consentId.length);

                vm.disclosureProvider = (utilityService.getProviderByNpis(vm.providers, vm.consent.providersDisclosureIsMadeToNpi, vm.consent.organizationalProvidersDisclosureIsMadeToNpi))[0];
                vm.authorizeProvider = (utilityService.getProviderByNpis(vm.providers, vm.consent.providersPermittedToDiscloseNpi, vm.consent.organizationalProvidersPermittedToDiscloseNpi))[0];
                // set providers to disable on UI that are currently selected in this consent
                consentService.setDiscloseNpi(vm.disclosureProvider.npi);
                consentService.setAuthorizeNpi(vm.authorizeProvider.npi);
                vm.medicalInformation.doNotShareSensitivityPolicyCodes = vm.consent.doNotShareSensitivityPolicyCodes;
                vm.shareForPurposeOfUseCodes = vm.consent.shareForPurposeOfUseCodes;
                vm.dateRange = {
                    consentStart: vm.consent.consentStart,
                    consentEnd: vm.consent.consentEnd
                };

            } else {
                vm.authorizeProvider = {};
                vm.disclosureProvider = {};
                vm.shareForPurposeOfUseCodes = consentService.getCodes(consentService.getDefaultPurposeOfUse(vm.purposeofuse, []));

                var today = new Date();
                var initStartDate = utilityService.formatDate(today);
                var initEndDate = utilityService.formatDate(today.setDate(today.getDate() + 365));
                vm.dateRange = {consentStart: initStartDate, consentEnd: initEndDate};
            }
        }

        function prepareConsent() {
            var providersDisclosureIsMadeToNpi = utilityService.getIndividualProvidersNpi([vm.disclosureProvider]);
            var providersPermittedToDiscloseNpi = utilityService.getIndividualProvidersNpi([vm.authorizeProvider]);
            var organizationalProvidersPermittedToDiscloseNpi = utilityService.getOrganizationalProvidersNpi([vm.authorizeProvider]);
            var organizationalProvidersDisclosureIsMadeToNpi = utilityService.getOrganizationalProvidersNpi([vm.disclosureProvider]);

            var consent = {
                providersPermittedToDiscloseNpi: providersPermittedToDiscloseNpi,
                providersDisclosureIsMadeToNpi: providersDisclosureIsMadeToNpi,
                organizationalProvidersDisclosureIsMadeToNpi: organizationalProvidersDisclosureIsMadeToNpi,
                organizationalProvidersPermittedToDiscloseNpi: organizationalProvidersPermittedToDiscloseNpi,
                doNotShareSensitivityPolicyCodes: vm.medicalInformation.doNotShareSensitivityPolicyCodes,
                shareForPurposeOfUseCodes: vm.shareForPurposeOfUseCodes,
                consentStart: vm.dateRange.consentStart,
                consentEnd: vm.dateRange.consentEnd
            };

            return consent;
        }

        function createConsent() {
            var consent = prepareConsent();
            //On Success clear the references of the selected providers
            consentService.resetSelectedNpi();

            consentService.createConsent(consent,
                function (response) {
                    if (isEnglish()) {
                        notificationService.success("Success in creating consent.");
                    } else {
                        notificationService.success("El consentimiento ha sido creado.");
                    }

                    $state.go('fe.consent.list');
                },
                function (error) {
                    if (error.status === 409) {
                        if (isEnglish()) {
                            notificationService.warn("Error you cannot create duplicate consent.");
                        } else {
                            notificationService.warn("No es posible crear consentimientos duplicados.");
                        }

                    } else {
                        if (isEnglish()) {
                            notificationService.error("Error in creating consent");
                        } else {
                            notificationService.error("El consentimiento no pudo ser creado");
                        }

                    }
                }
            );
        }

        function updateConsent() {
            var consent = prepareConsent();
            consent.id = $stateParams.consentId;

            consentService.updateConsent(
                consent,
                function (response) {
                    if (isEnglish()) {
                        notificationService.success("Success in updating consent.");
                    } else {
                        notificationService.success("El consentimiento ha sido modificado.");
                    }

                    $state.go('fe.consent.list');
                },
                function (error) {
                    if (error.status === 409) {
                        if (isEnglish()) {
                            notificationService.warn("Error you cannot create duplicate consent.");
                        } else {
                            notificationService.warn("No es posible crear consentimientos duplicados.");
                        }

                    } else {
                        if (isEnglish()) {
                            notificationService.error("Error in updating consent.");
                        } else {
                            notificationService.error("El consentimiento no pudo ser modificado.");
                        }

                    }

                }
            );
        }

        function isEnglish() {
            var language = window.localStorage.lang || 'en';
            if (language.substring(0, 2) === 'en') {
                return true;
            }
            return false;
        }

        function cancelConsent() {

            $modal.open({
                templateUrl: 'app/consent/directives/consentCreateEditCancelModal.html',
                controller: ['$modalInstance', '$state', CancelCreateEditConsentModalController],
                controllerAs: 'CancelCreateEditConsentModalVm'
            });

            function CancelCreateEditConsentModalController($modalInstance, $state) {
                var CancelCreateEditConsentModalVm = this;
                CancelCreateEditConsentModalVm.cancel = cancel;
                CancelCreateEditConsentModalVm.discard = discard;

                function cancel() {
                    $modalInstance.dismiss('cancel');
                }

                function discard() {
                    cancel();
                    $state.go('fe.consent.list');
                }
            }
        }

        function canSave() {
            var authorizeDisclosure = angular.isDefined(vm.authorizeProvider.npi) && angular.isDefined(vm.disclosureProvider.npi);
            var medicalInformation = angular.isDefined(vm.medicalInformation) && (angular.isDefined(vm.medicalInformation.doNotShareSensitivityPolicyCodes) || angular.isDefined(vm.medicalInformation.doNotShareSensitivityPolicyCodes));
            return (authorizeDisclosure && medicalInformation && angular.isDefined(vm.shareForPurposeOfUseCodes));
        }
    }
})();