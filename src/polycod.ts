/// <reference path = "polycod/ng1/component.ts" />

module Polycod {
  var strategy = Ng1.Component;

  export function Component(klass) {
    return new strategy(klass);
  }

  export function component(annotations) {
    var klass = annotations['class'];
    delete annotations['class'];

    klass.annotations = annotations;
    return new strategy(klass);
  }
}
