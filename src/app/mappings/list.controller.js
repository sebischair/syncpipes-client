export class MappingListController {

  constructor (Restangular, $mdToast) {
    'ngInject';

    this.Restangular = Restangular;
    this.$mdToast = $mdToast;

    this.mappings = [];
    this.order = 'name';
    this.getMappings();
  }

  /**
   * Get the mappings
   */
  getMappings() {
    this.promise = this.Restangular.all('mappings').getList().then((mappings) => {
      this.mappings = mappings;
    });
  }

  /**
   * Remove a mapping from the table
   *
   * @param mapping
   */
  remove(mapping) {
    mapping.remove().then(() => {
      // reload table
      this.getMappings();
      // notify
      this.$mdToast.showSimple(`Deleted mapping ${mapping.name}`);
    });
  }

}
