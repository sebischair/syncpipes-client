export class JsonSchemaDialogController {
  constructor($mdDialog, service) {
    'ngInject';
    this.$mdDialog = $mdDialog;
    this.service = service;
  }
  cancel() {
    this.$mdDialog.cancel();
  }
  hide() {
    this.$mdDialog.hide();
  }
}
