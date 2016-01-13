/// <reference path = "../util.ts" />

declare var angular;

module Polycod {
  export module Ng1 {
    export class Component {
      name: string;   // directive name
      klass: any;
      $injector: any;

      constructor(klass) {
        this.klass = klass;
        if (klass.annotations.providers) this.klass['$inject'] = klass.annotations.providers;

        this.name = util.dash2Camel(util.deBracket(klass.annotations.selector));

        this.build();
      }

      private build() {
        angular.module(this.klass.annotations.module).directive(this.name, ['$injector', ($injector) => {
          this.$injector  = $injector;

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
        }]);
      }

      private compile(element, attrs) {
        element[0].innerHTML = this.convertTemplate(element[0].innerHTML);

        return {
          pre: this.prelink.bind(this),
          post: this.postlink.bind(this)
        }
      }

      private prelink(scope, element, attrs, ctrl) {
        var self      = this;
        var events    = {};

        // make $injector available
        ctrl.$injector = this.$injector;
        // $run enforces a digest run
        ctrl.$apply = (fn) => {
          this.$injector.get('$timeout').call(this, fn.bind(this));
        }

        var changeNotification = (key, value) => {
          if (!ctrl.hasOwnProperty('ngOnChanges')) return;

          var changes = {}
          changes[key] = { currentValue: value };
          ctrl.ngOnChanges({ changes: changes });
        };

        for (var key in attrs) {
          var value = attrs[key];

          if (util.isNgEvent(key)) {
            var name = key.replace(/^bind-/, '');
            name = util.deAll(name);
            events[name] = value;
          }
          // setup watchers for properties
          else if (util.isNgProperty(key)) {
            var isTwoWay = util.isNgTwoWayBinding(key);
            var name     = key.replace(/^bind-/, '');
            name         = util.deAll(name);
            ctrl[name]   = undefined;

            (function (_name, _value) {
              scope.$parent.$watch(_value, (v) => {
                ctrl[_name] = v;
              });
              scope.$watch(_name, (v) => {
                // for two way bindings we have to write back the value onto the parent scope
                if (isTwoWay) scope.$parent[_value] = v;
                changeNotification(_name, v);
              });
            })(name, value);
          }

          // copy static attributes on to controller
          else {
            ctrl[key] = value;
          }
        }

        // implements functions to emit events
        if (self.klass.annotations.events) {
          for (var index in self.klass.annotations.events) {
            var ev = self.klass.annotations.events[index];
            if (ctrl[ev]) continue;

            (function (_event) {
              ctrl[_event] = function() {
                if (!events.hasOwnProperty(_event)) {
                  self.$injector.get('$log').info(`${self.name}: no callback set for ${_event}`);
                  return
                }

                var fn = self.$injector.get('$parse')(events[_event]);
                var args = [].slice.call(arguments);
                var data = args.length <= 1 ? args[0] : args;
                var event = { data: data };
                fn(scope.$parent, { $event: event });
              }
            })(ev);
          }
        }

        // proxy from scope to controller
        var syncScopeCtrl = function() {
          for (key in ctrl) {
            if (key.indexOf('$') === 0) continue;
            if (scope.hasOwnProperty(key)) continue;

            (function (_key) {
              Object.defineProperty(scope, _key, {
                get: () => {
                  return ctrl[_key];
                },
                set: (v) => {
                  return ctrl[_key] = v;
                }
              });
            })(key);
          }
        };
        syncScopeCtrl();
        scope.$watch(syncScopeCtrl);
      }

      private postlink(scope, element, attrs, ctrl, transclude) {
        var self = this;

        // call activate ('linked' function)
        (typeof ctrl.activate === 'function') && ctrl.activate();

        // custom transclusion. from here https://www.airpair.com/angularjs/posts/creating-container-components-part-2-angular-1-directives
        if (self.klass.annotations.transclude) {
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

        // implements host listeners
        if (self.klass.annotations.host) {
          for (var key in self.klass.annotations.host) {
            var cb = util.deParen(self.klass.annotations.host[key]);
            if (!ctrl[cb]) {
              self.$injector.get('$log').info(`${self.name}: host callback ${key} does not exist`);
              continue;
            }

            (function (_key, _cb) {
              element.on(_key, function() {
                scope.$apply(function () {
                  ctrl[_cb].apply(ctrl, arguments);
                });
              });
            })(key, cb);
          }
        }
      }

      private convertTemplate(html) {
        if (!html || !html.length) return;

        html = html.replace(/((\*ng-for="#)([a-zA-Z0-9-_]+)( of )([a-zA-Z0-9-_]+))/g, 'ng-repeat="$3 in $5 track by $index');
        html = html.replace(/\[hidden\]/g, 'ng-hide');
        html = html.replace(/\[ng-model\]/g, 'ng-model');
        html = html.replace(/\(click\)/g, 'ng-click');
        html = html.replace(/\(dbl-click\)/g, 'ng-dbl-click');
        html = html.replace(/\(mousedown\)/g, 'ng-mousedown');
        html = html.replace(/\(mouseup\)/g, 'ng-mouseup');
        html = html.replace(/\(mouseenter\)/g, 'ng-mouseenter');
        html = html.replace(/\(mouseleave\)/g, 'ng-mouseleave');
        html = html.replace(/\(mouseover\)/g, 'ng-mouseover');
        html = html.replace(/\(keydown\)/g, 'ng-keydown');
        html = html.replace(/\(keyup\)/g, 'ng-keyup');
        html = html.replace(/\(keypress\)/g, 'ng-keypress');
        html = html.replace(/\(change\)/g, 'ng-change');
        return html;
      }
    }
  }
}
