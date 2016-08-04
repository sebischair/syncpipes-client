import { PipelineFormController } from './form.controller';
import { UploadDialogController } from './upload.dialog';
export class PipelineListController {
  constructor (Restangular, $mdToast, $mdDialog, $document, $state) {
    'ngInject';

    this.Restangular = Restangular;
    this.$mdToast = $mdToast;
    this.$mdDialog = $mdDialog;
    this.$document = $document;
    this.$state = $state;

    this.pipelines = [];
    this.order = 'name';
    this.getPipelines();
  }

  /**
   * Get the pipelines
   */
  getPipelines() {
    this.promise = this.Restangular.all('pipelines').getList().then((pipelines) => {
      this.pipelines = pipelines;
    });
  }

  showFormDialog($event, pipeline = null) {
    if (pipeline === null) {
      pipeline = this.Restangular.one('pipelines');
    }
    this.Restangular.all('mappings').getList().then((mappings) => {
      this.$mdDialog.show({
        locals: {
          pipeline: pipeline,
          mappings: mappings
        },
        controller: PipelineFormController,
        controllerAs: "ctrl",
        templateUrl: 'app/pipelines/form.html',
        parent: this.$document.body,
        targetEvent: $event,
        clickOutsideToClose:false
      }).then((pipeline) => {
        this.getPipelines();
        this.$mdToast.showSimple(`Saved pipeline ${pipeline.name}`);
      });
    });
  }

  /**
   * Remove a pipeline from the table
   *
   * @param pipeline
   */
  remove(pipeline) {
    pipeline.remove().then(() => {
      // reload table
      this.getPipelines();
      // notify
      this.$mdToast.showSimple(`Deleted pipeline ${pipeline.name}`);
    });
  }

  execute($event, pipeline) {
    let p = null;
    if (pipeline.passive) {
      p = this.$mdDialog.show({
        locals: {
          pipeline: pipeline
        },
        controller: UploadDialogController,
        controllerAs: "ctrl",
        templateUrl: 'app/pipelines/upload.dialog.html',
        parent: this.$document.body,
        targetEvent: $event,
        clickOutsideToClose:false
      });
    } else {
      p = pipeline.post('actions/execute', {})
    }
    // view notification
    p.then((execution) => {
      // Toast
      let toast = this.$mdToast.simple()
        .textContent(`Queued pipeline ${pipeline.name} for execution`)
        .highlightAction(true)
        .hideDelay(5000)
        .action('Details');

      this.$mdToast.show(toast).then((response) => {
        if (response == 'ok') {
          this.$state.go('executions.view', {id: execution._id});
        }
      });
    });
  }
}
