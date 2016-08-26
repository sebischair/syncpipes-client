export class MappingFormController {
  constructor ($log, $mdToast, $mdDialog, Upload, $document, Restangular, $state, services, mapping, configurations) {
    'ngInject';
    // di
    this.$log = $log;
    this.$mdToast = $mdToast;
    this.$mdDialog = $mdDialog;
    this.Upload = Upload;
    this.$document = $document;
    this.Restangular = Restangular;
    this.$state = $state;
    this.services = services;
    this.mapping = mapping;
    this.configurations = configurations;
    this.extractorServiceType = null;
    if (!this.mapping.hasOwnProperty('groups')) {
      this.mapping.groups = [];
    }
    // edit mode
    this.editMode = angular.isString(this.mapping._id);
    this.files = [];
    this.loadFiles = true;
  }

  getSchemaUrl(serviceName, configName) {
      return `${this.Restangular.configuration.baseUrl}/services/${serviceName}/${configName}/schema.json`;
  }

  uploadFiles($event) {
    if (this.mapping.extractorServiceType === 1) {
      this.loadFiles = true;
      this.uploadUrl = `${this.Restangular.configuration.baseUrl}/services/${this.mapping.extractorService}/updateSchema`;
      this.$mdDialog.show({
        controller: () => this,
        controllerAs: 'ctrl',
        templateUrl: 'app/mappings/upload.dialog.html',
        parent: this.$document.body,
        targetEvent: $event,
        clickOutsideToClose:false
      });
    } else {
      this.loadFiles = false;
    }
  }

  getExtractorServiceType() {
    this.Restangular.one('services', this.mapping.extractorService).one('type').get().then((response) => {
      this.mapping.extractorServiceType = response.type;
    });
  }

  getConfigs(serviceName) {
    return this.configurations[serviceName];
  }

  /**
   * Add a new mapping group
   */
  addGroup() {
    this.mapping.groups.push({
      toPrefix: this.loaderPath ? this.loaderPath : null,
      properties: []
    });
  }

  /**
   * Add a new property mapping to the given group
   *
   * @param group
   */
  addProperty(group) {
    group.properties.push({
      fromPath: this.extractorPath ? this.extractorPath : null,
      toPath: this.loaderPath ? this.loaderPath : null
    });
  }

  /**
   * Delete a group
   *
   * @param index
   */
  deleteGroup(index) {
    this.mapping.groups.splice(index, 1);
  }

  /**
   * Delete a property from the given group
   * @param group
   * @param propertyIndex
   */
  deleteProperty(group, propertyIndex) {
    group.properties.splice(propertyIndex, 1);
  }

  /**
   * Save the mapping and redirect to overview
   */
  save() {
    this.mapping.save().then((mapping) => {
      this.$state.go('mappings.list').then(() => {
        this.$mdToast.showSimple(`Saved mapping ${mapping.name}`);
      })
    });
  }

  /**
   * Delete the mapping
   */
  remove() {
    this.mapping.remove().then(() => {
      return this.$state.go('mappings.list');
    }).then(() => {
      this.$mdToast.showSimple(`Removed mapping ${this.mapping.name}`);
    });
  }

  /**
   * Functions related to file upload
   */
  cancel() {
    this.$mdDialog.cancel();
  }

  upload() {
    this.uploading = true;
    this.Upload.upload({
        url: this.uploadUrl,
        arrayKey: '',
        data: {
          data: this.files
        }
      })
      .then(
        (response) => {
          this.$mdDialog.hide(response.data);
          this.loadFiles = false;
        },
        (error) => {
          // TODO: Handle error
          // console.error(error);
        },
        (evt) => {
          this.progress = parseInt(100.0 * evt.loaded / evt.total);
        }
      );
  }

  removeFile(index) {
    this.files.splice(index, 1);
  }
}
