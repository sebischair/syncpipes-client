import { Diagram } from './diagram'
export function JsonSchemaVisualizerDirective() {
  'ngInject';

  let directive = {
    restrict: 'E',
    templateUrl: 'app/components/jsonSchemaVisualizer/visualizer.html',
    replace: true,
    scope: {
      schemaUrl: '=',
      id: '=',
      selectedPath: '=?'
    },
    link: function (scope, element) {
      'use strict';

      let id = scope.id || Date.now();

      let view = new Diagram(
        id,
        scope.schemaUrl,
        element,
        element.innerWidth(),
        element.innerHeight()
      );

      view.onNodeSelect((node, path) => {
        if (path) {
          scope.$apply(() => {
            scope.selectedPath = path;
          });
        }
      });

      scope.reset = () => {
        view.resetViewer();
      };

      scope.zoom = ($event, direction) => {
        view.zoomClick($event, direction);
      };

      scope.$watch('schemaUrl', (newValue, oldValue) => {
        if (newValue != oldValue) {
          view.id = scope.id || Date.now();
          view.schemaUrl = scope.schemaUrl;
          view.createDiagram();
        }
      });

    }
  };

  return directive;
}
