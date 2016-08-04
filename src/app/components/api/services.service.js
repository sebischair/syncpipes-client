export class ServicesService {
  constructor (Restangular) {
    'ngInject';
    this.Restangular = Restangular;
  }

  all() {
    return this.Restangular.all('services').getList();
  }

  configurationCreate(serviceName) {
    return this.Restangular.one('services', serviceName).one('configs');
  }

  configurationList(serviceName = null) {

    if (serviceName != null) {
      return this.Restangular.one('services', serviceName).all('configs').getList();
    }
    // get all configs
    let configs = {};
    let promises = [];
    this.all().then((services) => {
      for (let service of services) {
        promises.push(this.configurationList(service.name).then((sConfigs) => { configs[service.name] = sConfigs;}));
      }
    });
    return Promise.all(promises).then(() => {
      return configs;
    });
  }

  configurationDelete(serviceName, id) {
    return this.Restangular.one('services', serviceName).one('configs', id).remove();
  }

}
