import { JsonSchemaDialogController } from './jsonschema.dialog'
import { JsonSchemaVisualizerDialogController } from '../components/jsonSchemaVisualizer/visualizer.dialog'

export class MainController {
  constructor ($mdDialog, $document, services, executions) {
    'ngInject';

    this.$mdDialog = $mdDialog;
    this.$document = $document;
    this.services = services;
    this.executions = executions;

  }

  showSchemaCodeDialog($event, service) {
    this.$mdDialog.show({
      locals: {
        service: service
      },
      controller: JsonSchemaDialogController,
      controllerAs: "ctrl",
      templateUrl: 'app/main/jsonschema.dialog.html',
      parent: this.$document.body,
      targetEvent: $event,
      clickOutsideToClose:false
    });
  }

  showSchemaVisualizerDialog($event, service) {
    this.$mdDialog.show({
      locals: {
        service: service
      },
      controller: JsonSchemaVisualizerDialogController,
      controllerAs: "ctrl",
      templateUrl: 'app/components/jsonSchemaVisualizer/visualizer.dialog.html',
      parent: this.$document.body,
      targetEvent: $event,
      clickOutsideToClose:false,
      fullscreen: true
    });
  }

}
