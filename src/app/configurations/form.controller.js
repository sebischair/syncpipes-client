export class ConfigurationFormController {
  constructor ($mdDialog, spServices, configuration, services, $scope, $mdToast) {
    'ngInject';
    // di
    this.$mdDialog = $mdDialog;
    this.spServices = spServices;
    this.services = services;
    this.$scope = $scope;
    this.$mdToast = $mdToast;
    // check if in edit mode
    this.editMode = false;
    if (configuration !== null) {
      this.editMode = true;
      this.configuration = configuration;
      // set service
      for (let service of this.services) {
        if (service.name == configuration.service) {
          this.service = service;
          break;
        }
      }
    }
  }

  cancel() {
    this.$mdDialog.cancel();
  }
  hide() {
    this.$mdDialog.hide();
  }

  onServiceChange() {
    this.configuration = this.spServices.configurationCreate(this.service.name);
    this.configuration.config = {};
  }

  save() {
    this.configuration.save().then((config) => {
      return this.$mdDialog.hide(config);
    }).then(() => {
      this.$mdToast.showSimple('Service configuration created');
    });
  }
}
