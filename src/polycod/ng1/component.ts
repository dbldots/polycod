/// <reference path = "../util.ts" />

declare var angular;

module Polycod {
  export module Ng1 {
    export class Component {
      klass: any;
      name: string;   // directive name

      constructor(klass) {
        this.klass = klass;
        if (klass.annotations.inject) this.klass['$inject'] = klass.annotations.inject;

        this.name = util.dash2Camel(util.deBracket(klass.annotations.selector));

        this.build();
      }

      private build() {
        angular.module(this.klass.annotations.module).directive(this.name, () => {
          return {
            controller:   this.klass,
            controllerAs: this.name,
            // bindToController does not work with attributes in parenthesis or brackets
            // instead we use our own proxying (see below)
            bindToController: false,
            scope:        true,
            compile:      this.compile.bind(this),
            templateUrl:  this.klass.annotations.templateUrl,
            template:     this.klass.annotations.template
          }
        });
      }

      private compile(element, attrs) {
        return {
          pre: this.prelink.bind(this),
          post: this.postlink.bind(this)
        }
      }

      private prelink(scope, element, attrs, ctrl) {
        var events    = {};
        var injector  = element.injector();

        for (var key in attrs) {
          var value = attrs[key];

          if (util.isNgEvent(key)) {
            var name = key.replace(/^bind-/, '');
            name = util.deAll(name);
            events[name] = value;
          }
          // setup watchers for properties
          else if (util.isNgProperty(key)) {
            var name = key.replace(/^bind-/, '');
            name = util.deAll(name);
            ctrl[name] = undefined;

            (function (_name) {
              scope.$watch(value, (v) => {
                ctrl[_name] = v;
              });
            })(name);
          }

          // copy static attributes on to controller
          else {
            ctrl[key] = value;
          }
        }

        // implements functions to emit events
        if (this.klass.annotations.events) {
          for (var index in this.klass.annotations.events) {
            var ev = this.klass.annotations.events[index];
            if (ctrl[ev]) continue;

            (function (_event) {
              ctrl[_event] = function() {
                var $parse = injector.get('$parse');

                if (!events.hasOwnProperty(_event)) {
                  var $log = injector.get('$log');
                  $log.info(`${this.name}: no callback set for ${_event}`);
                  return
                }

                var fn = $parse(events[_event]);
                var args = [].slice.call(arguments);
                var data = args.length <= 1 ? args[0] : args;
                var event = { data: data };
                fn(scope, { $event: event });
              }
            })(ev);
          }
        }

        // proxy from scope to controller
        for (key in ctrl) {
          if (key.indexOf('$') === 0) continue;

          (function (_key) {
            Object.defineProperty(scope, _key, {
              get: () => {
                return ctrl[_key];
              }
            });
          })(key);
        }
      }

      private postlink(scope, element, attrs, ctrl) {
        (typeof ctrl.activate === 'function') && ctrl.activate();
      }
    }
  }
}
