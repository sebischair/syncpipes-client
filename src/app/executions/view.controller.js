export class PipelineExecutionViewController {
  constructor (execution) {
    'ngInject';
    this.execution = execution;
    // create filter
    this.filterValue = [0, 1, 2, 3, 4];
    this.filters = [];
    this.filters[0] = 'Debug';
    this.filters[1] = 'Info';
    this.filters[2] = 'Warning';
    this.filters[3] = 'Error';
    this.filters[4] = 'Fatal';

  }

  getLevel(level, lowercase = false) {
    return lowercase ? this.filters[level].toLowerCase() : this.filters[level];
  }

}
