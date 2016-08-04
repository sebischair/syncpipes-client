export function routerConfig($stateProvider, $urlRouterProvider) {
  'ngInject';
  $stateProvider
    .state('home', {
      url: '/',
      templateUrl: 'app/main/main.html',
      controller: 'MainController',
      controllerAs: 'ctrl',
      resolve: {
        services: (spServices) => spServices.all(),
        executions: (Restangular) => Restangular.all('pipeline-executions').getList({limit: 5, order: '-started'})
      }
    })
    .state('pipelines', {
      url: '/pipelines',
      abstract: true,
      template: '<ui-view/>'
    })
    .state('pipelines.list', {
      url: '/',
      templateUrl: 'app/pipelines/list.html',
      controller: 'PipelineListController',
      controllerAs: 'ctrl',
      resolve: {
        pipelines: (spPipelines) => spPipelines.getList()
      }
    })
    .state('pipelines.create', {
      url: '/new',
      templateUrl: 'app/pipelines/form.html',
      controller: 'PipelineFormController',
      controllerAs: 'ctrl',
      resolve: {
        pipeline: (spPipelines) => spPipelines.create()
      }
    })
    .state('configurations', {
      url: '/configurations',
      abstract: true,
      template: '<ui-view flex/>'
    })
    .state('configurations.list', {
      url: '/',
      templateUrl: 'app/configurations/list.html',
      controller: 'ConfigurationListController',
      controllerAs: 'ctrl',
      resolve: {
        configurations: (spServices) => spServices.configurationList()
      }
    })
    .state('mappings', {
      url: '/mappings',
      abstract: true,
      template: '<ui-view flex/>'
    })
    .state('mappings.list', {
      url: '/',
      templateUrl: 'app/mappings/list.html',
      controller: 'MappingListController',
      controllerAs: 'ctrl'
    })
    .state('mappings.create', {
      url: '/create',
      templateUrl: 'app/mappings/form.html',
      controller: 'MappingFormController',
      controllerAs: 'ctrl',
      resolve: {
        services: (spServices) => spServices.all(),
        mapping: (Restangular) => Restangular.one('mappings'),
        configurations: (spServices) => spServices.configurationList()
      }
    })
    .state('mappings.edit', {
      url: '/:id/edit',
      templateUrl: 'app/mappings/form.html',
      controller: 'MappingFormController',
      controllerAs: 'ctrl',
      resolve: {
        services: (spServices) => spServices.all(),
        mapping: (Restangular, $stateParams) => Restangular.one('mappings', $stateParams.id).get(),
        configurations: (spServices) => spServices.configurationList()
      }
    })
    .state('executions', {
      url: '/pipeline-executions',
      abstract: true,
      template: '<ui-view flex/>'
    })
    .state('executions.list', {
      url: '/',
      templateUrl: 'app/executions/list.html',
      controller: 'PipelineExecutionListController',
      controllerAs: 'ctrl'
    })
    .state('executions.view', {
      url: '/:id',
      templateUrl: 'app/executions/view.html',
      controller: 'PipelineExecutionViewController',
      controllerAs: 'ctrl',
      resolve: {
        execution: (Restangular, $stateParams) => Restangular.one('pipeline-executions', $stateParams.id).get()
      }
    });



  $urlRouterProvider.otherwise('/');
}
