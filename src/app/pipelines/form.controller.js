export class PipelineFormController {
  constructor ($mdDialog, $mdToast, Restangular, pipeline, mappings) {
    'ngInject';
    this.$mdDialog = $mdDialog;
    this.$mdToast = $mdToast;
    this.Restangular = Restangular;
    this.pipeline = pipeline;
    this.mappings = mappings;

    this.extractorConfigs = [];
    this.loaderConfigs = [];

    this.editMode = false;
    if (angular.isString(pipeline._id)) {
      this.editMode = true;
      this.pipeline.loaderConfig = this.pipeline.loaderConfig._id;
      this.pipeline.extractorConfig = this.pipeline.extractorConfig._id;
      for (let mapping of this.mappings) {
        if (mapping._id == pipeline.mapping._id) {
          this.mapping = mapping;
          this.loadConfigs();
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

  loadConfigs() {
    return Promise.all([
      this.Restangular.one('services', this.mapping.extractorService).all('configs').getList(),
      this.Restangular.one('services', this.mapping.loaderService).all('configs').getList()
    ]).then((configs) => {
      this.extractorConfigs = configs[0];
      this.loaderConfigs = configs[1];
    });
  }

  onMappingChange() {
    // set mapping
    this.pipeline.mapping = this.mapping._id;
    // fetch configs for extractor and loader service
    this.loadConfigs();
  }

  save() {
    this.pipeline.save().then((config) => {
      return this.$mdDialog.hide(config);
    }).then(() => {
      this.$mdToast.showSimple(`Pipeline ${this.pipeline.name} saved`);
    });
  }

}
