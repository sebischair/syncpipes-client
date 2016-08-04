export class NavbarDirective {
  constructor () {
    'ngInject';

    let directive = {
      restrict: 'E',
      templateUrl: 'app/components/navbar/navbar.html',
      controller: NavbarController,
      controllerAs: 'ctrl',
      bindToController: true
    };

    return directive;
  }
}
class NavbarController {
  constructor (Restangular, $mdDialog) {
    'ngInject';
    // Services
    this.Restangular = Restangular;
    this.$mdDialog = $mdDialog;
  }

  showUrlDialog($event) {
    let confirm = this.$mdDialog.prompt()
     .title('SyncPipes API Url')
     .textContent('Set the url of the SyncPipes API Url')
     .placeholder('http://localhost:3010/api/v1')
     .initialValue(this.Restangular.configuration.baseUrl)
     .targetEvent($event)
     .ok('Save URL')
     .cancel('Cancel');
    this.$mdDialog.show(confirm).then((url) => {
      localStorage.setItem('syncpipes_api_url', url);
      this.Restangular.setBaseUrl(url);
    });
  }
}
