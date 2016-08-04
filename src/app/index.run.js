export function runBlock (Restangular) {
  'ngInject';
  // get base url from local storage
  let baseUrl = localStorage.getItem('syncpipes_api_url') || 'http://localhost:3010/api/v1';
  Restangular.setBaseUrl(baseUrl);
}
