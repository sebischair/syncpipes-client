/* global d3:false, tv4: false, moment:false */

import { config } from './index.config';
import { routerConfig } from './index.route';
import { runBlock } from './index.run';
// Controller
import { MainController } from './main/main.controller';
import { PipelineListController } from './pipelines/list.controller';
import { PipelineFormController } from './pipelines/form.controller';
import { ConfigurationListController } from './configurations/list.controller';
import { MappingFormController } from './mappings/form.controller';
import { MappingListController } from './mappings/list.controller';
import { PipelineExecutionListController } from './executions/list.controller';
import { PipelineExecutionViewController } from './executions/view.controller';
// Api related
import { ServicesService } from '../app/components/api/services.service';
import { PipelineService } from '../app/components/api/pipeline.service';
// Directives
import { JsonSchemaVisualizerDirective } from '../app/components/jsonSchemaVisualizer/visualizer.directive';
import { NavbarDirective } from '../app/components/navbar/navbar.directive';

angular
  .module('client', [
    'ngAnimate',
    'ngCookies',
    'ngSanitize',
    'ngMessages',
    'ngAria',
    'restangular',
    'ui.router',
    'ngMaterial',
    'mohsen1.json-schema-view',
    'schemaForm',
    'angular-loading-bar',
    'md.data.table',
    'angularMoment',
    'ngFileUpload'
  ])
  .constant('moment', moment)
  .config(config)
  .config(routerConfig)
  .run(runBlock)
  // Source: http://stackoverflow.com/questions/15454900/is-it-possible-to-filter-angular-js-by-containment-in-another-array/21171880#21171880
  .filter('inArray', function($filter){
      return function(list, arrayFilter, element){
       if(arrayFilter){
         return $filter("filter")(list, function(listItem){
           return arrayFilter.indexOf(listItem[element]) != -1;
         });
       }
      };
   })
  .filter('filesize', () => {
    return (input) => {
      return filesize(input);
    };
  })
  .service('spServices', ServicesService)
  .service('spPipelines', PipelineService)
  .controller('MainController', MainController)
  .controller('PipelineListController', PipelineListController)
  .controller('PipelineFormController', PipelineFormController)
  .controller('ConfigurationListController', ConfigurationListController)
  .controller('MappingFormController', MappingFormController)
  .controller('MappingListController', MappingListController)
  .controller('PipelineExecutionListController', PipelineExecutionListController)
  .controller('PipelineExecutionViewController', PipelineExecutionViewController)
  .directive('spJsonSchemaVisualizer', JsonSchemaVisualizerDirective)
  .directive('spNavbar', () => new NavbarDirective());
