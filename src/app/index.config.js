export function config($logProvider, RestangularProvider) {
  'ngInject';
  // Enable log
  $logProvider.debugEnabled(true);

  RestangularProvider
    .setRestangularFields({
      id: "_id"
    })
    .setResponseExtractor(function (srvResponse, operation) {
      if (operation === 'getList') {
        if (srvResponse === null) {
          return [];
        }
        if (srvResponse.hasOwnProperty('list')) {
          let tmp = srvResponse.list;
          tmp.meta = srvResponse.meta;
          return tmp;
        }
      }
      return srvResponse;
    });
}
