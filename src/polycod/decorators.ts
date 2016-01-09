module Polycod {
  export namespace Decorators {
    var addAnnotations = function(target, annotations) {
      if (!target.annotations) target.annotations = {};

      for (var key in annotations) {
        target.annotations[key] = annotations[key];
      }
      return target;
    };

    var validateAnnotations = function(annotations, annotationName, allowed) {
      for (var key in annotations) {
        if (allowed.indexOf(key) === -1) {
          throw new Error(`'${key}' option is not allowed for ${annotationName}`);
        }
      }
    }

    export function Component (annotations) {
      return function (target) {
        validateAnnotations(annotations, 'Component', [
          'selector', 'events'
        ]);
        return addAnnotations(target, annotations);
      }
    }
    export function View (annotations) {
      return function (target) {
        validateAnnotations(annotations, 'Component', [
          'template', 'templateUrl'
        ]);
        return addAnnotations(target, annotations);
      }
    }
    export function Ng1 (annotations) {
      return function (target) {
        validateAnnotations(annotations, 'Component', [
          'inject', 'transclude', 'module'
        ]);
        return addAnnotations(target, annotations);
      }
    }
  }
}
