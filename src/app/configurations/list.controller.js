import { ConfigurationFormController } from './form.controller';
export class ConfigurationListController {

  constructor (configurations, spServices, $mdToast, $mdDialog, $document) {
    'ngInject';

    this.configurations = configurations;
    this.spServices = spServices;
    this.$mdToast = $mdToast;
    this.$mdDialog = $mdDialog;
    this.$document = $document;
  }

  removeConfig(config) {
    config.remove().then(() => {
      this.$mdToast.showSimple('Service configuration removed');
      this.reloadConfigs(config.service);
    });
  }

  showFormDialog($event, configuration = null) {
    // resolve seems not to work..
    this.spServices.all().then((services) => {
      this.$mdDialog.show({
        locals: {
          configuration: configuration,
          services: services
        },
        controller: ConfigurationFormController,
        controllerAs: "ctrl",
        templateUrl: 'app/configurations/form.html',
        parent: this.$document.body,
        targetEvent: $event,
        clickOutsideToClose:false
      }).then((config) => {
        this.reloadConfigs(config.service);
      });
    });
  }

  reloadConfigs(serviceName) {
    return this.spServices.configurationList(serviceName).then((configs) => {
      this.configurations[serviceName] = configs;
    });
  }
}
