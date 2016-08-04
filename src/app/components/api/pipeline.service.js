export class PipelineService {
  constructor (Restangular) {
    'ngInject';
    this.Restangular = Restangular;
  }

  getList() {
    return this.Restangular.all('pipelines').getList();
  }

  create() {
    return this.Restangular.one('pipelines');
  }

}
