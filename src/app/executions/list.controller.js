export class PipelineExecutionListController {
  constructor (Restangular, $mdToast, $mdDialog, $document) {
    'ngInject';

    this.Restangular = Restangular;
    this.$mdToast = $mdToast;
    this.$mdDialog = $mdDialog;
    this.$document = $document;

    this.executions = [];
    this.query = {
      limit: 25,
      page: 1,
      order: '-started'
    };
    // initial load
    this.getExecutions();
    // es6 scope fix
    this.onReorder = () => this.getExecutions();
    this.onPaginate = () => this.getExecutions();
  }

  /**
   * Get the pipelines
   */
  getExecutions() {
    this.promise = this.Restangular.all('pipeline-executions').getList(this.query).then((executions) => {
      this.executions = executions;
    });
  }

  getDuration(execution) {
    if (!execution.finished) {
      return 'N/A';
    }
    let started = moment(execution.started);
    let finished = moment(execution.finished);

    return moment.duration(finished.diff(started)).format('h [hrs], m [min], s [sec]');
  }
}
