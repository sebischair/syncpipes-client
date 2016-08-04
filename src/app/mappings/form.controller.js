export class MappingFormController {
  constructor ($log, $mdToast, Restangular, $state, services, mapping, configurations) {
    'ngInject';
    // di
    this.$mdToast = $mdToast;
    this.Restangular = Restangular;
    this.$state = $state;
    this.services = services;
    this.mapping = mapping;
    this.configurations = configurations;
    if (!this.mapping.hasOwnProperty('groups')) {
      this.mapping.groups = [];
    }
    // edit mode
    this.editMode = angular.isString(this.mapping._id);
  }

  getSchemaUrl(serviceName, configName) {
    return `${this.Restangular.configuration.baseUrl}/services/${serviceName}/${configName}/schema.json`;
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

}
