/// <reference path = "../util.ts" />

declare var angular;

module Polycod {
  export module Ng1 {
    export class Component {
      klass: any;
      name: string;   // directive name

      constructor(klass) {
        this.klass = klass;
        if (klass.annotations.providers) this.klass['$inject'] = klass.annotations.providers;

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
            scope:        {},
            compile:      this.compile.bind(this),
            templateUrl:  this.klass.annotations.templateUrl,
            template:     this.klass.annotations.template,
            transclude:   this.klass.annotations.transclude,
          }
        });
      }

      private compile(element, attrs) {
        element[0].innerHTML = this.convertTemplate(element[0].innerHTML);

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
          // setup two way bindings
          else if (util.isNgTwoWayBinding(key)) {
            name = util.deAll(key);
            ctrl[name] = undefined;

            (function (_name, _value) {
              scope.$parent.$watch(_value, (v) => {
                ctrl[_name] = v;
              });
              scope.$watch(_name, (v) => {
                scope.$parent[_value] = v;
              });
            })(name, value);
          }
          // setup watchers for properties
          else if (util.isNgProperty(key)) {
            var name = key.replace(/^bind-/, '');
            name = util.deAll(name);
            ctrl[name] = undefined;

            (function (_name) {
              scope.$parent.$watch(value, (v) => {
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
                fn(scope.$parent, { $event: event });
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

      private postlink(scope, element, attrs, ctrl, transclude) {
        (typeof ctrl.activate === 'function') && ctrl.activate();

        if (!this.klass.annotations.transclude) return;

        // custom transclusion. from here https://www.airpair.com/angularjs/posts/creating-container-components-part-2-angular-1-directives
        transclude(function(clone) {
          angular.forEach(clone, function(cloneEl) {
            if (!cloneEl.attributes) return;
            var select = cloneEl.nodeName.toLowerCase();
            var destination = element.find('content[select="'+ select +'"]');
            if (destination.length) {
              destination.append(cloneEl);
            } else { 
              cloneEl.remove();
            }
          });
        });
      }

      private convertTemplate(html) {
        if (!html || !html.length) return;

        html = html.replace(/((\*ng-for="#)([a-zA-Z0-9-_]+)( of )([a-zA-Z0-9-_]+))/g, 'ng-repeat="$3 in $5');
        html = html.replace(/\(click\)/g, 'ng-click');
        return html;
      }
    }
  }
}
