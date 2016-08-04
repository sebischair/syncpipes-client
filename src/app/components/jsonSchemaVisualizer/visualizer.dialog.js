export class JsonSchemaVisualizerDialogController {
  constructor($mdDialog, service, Restangular) {
    'ngInject';
    this.$mdDialog = $mdDialog;
    this.service = service;
    this.url = Restangular.one('services', service.name).getRestangularUrl() + '/schema.json'
  }
  cancel() {
    this.$mdDialog.cancel();
  }
  hide() {
    this.$mdDialog.hide();
  }
}
