/// <reference path = "polycod/ng1/component.ts" />
/// <reference path = "polycod/decorators.ts" />

module Polycod {
  var strategy = Ng1.Component;

  export function bootstrap(klass) {
    return new strategy(klass);
  }

  export function component(annotations) {
    var klass = annotations['class'];
    delete annotations['class'];

    klass.annotations = annotations;
    return new strategy(klass);
  }
}
