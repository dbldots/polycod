var Polycod;
(function (Polycod) {
    var util;
    (function (util) {
        function noop() { }
        util.noop = noop;
        ;
        function deBracket(s) {
            return s.replace(/[\[\]]/g, '');
        }
        util.deBracket = deBracket;
        ;
        function deParen(s) {
            return s.replace(/[\(\)]/g, '');
        }
        util.deParen = deParen;
        ;
        function deAll(s) {
            return s.replace(/[\(\)\[\]]/g, '');
        }
        util.deAll = deAll;
        function dash2Camel(s) {
            return s.replace(/-([a-z])/g, function (g) {
                return g[1].toUpperCase();
            });
        }
        util.dash2Camel = dash2Camel;
        ;
        function isNgEvent(s) {
            return /(^\((.+)\)$)/.test(s) || s.indexOf('on-') === 0;
        }
        util.isNgEvent = isNgEvent;
        ;
        function isNgProperty(s) {
            return /(^\[(.+)\]$)/.test(s) || s.indexOf('bind-') === 0;
        }
        util.isNgProperty = isNgProperty;
        ;
        function isNgAttribute(s) {
            return !isNgEvent(s) && !isNgProperty(s);
        }
        util.isNgAttribute = isNgAttribute;
        ;
    })(util = Polycod.util || (Polycod.util = {}));
})(Polycod || (Polycod = {}));
/// <reference path = "../util.ts" />
var Polycod;
(function (Polycod) {
    var Ng1;
    (function (Ng1) {
        var Component = (function () {
            function Component(klass) {
                this.klass = klass;
                this.name = Polycod.util.dash2Camel(Polycod.util.deBracket(klass.annotations.selector));
                this.build();
            }
            Component.prototype.build = function () {
                var _this = this;
                angular.module(this.klass.annotations.module).directive(this.name, function () {
                    return {
                        controller: _this.klass,
                        controllerAs: _this.name,
                        bindToController: true,
                        scope: true,
                        compile: _this.compile.bind(_this),
                        templateUrl: _this.klass.annotations.templateUrl,
                        template: _this.klass.annotations.template
                    };
                });
            };
            Component.prototype.compile = function (element, attrs) {
                console.log(element[0].attributes);
                return {
                    pre: this.prelink.bind(this),
                    post: this.postlink.bind(this)
                };
            };
            Component.prototype.prelink = function (scope, element, attrs, ctrl) {
                var _this = this;
                var injector = element.injector();
                var events = {};
                var key;
                for (key in attrs) {
                    var value = attrs[key];
                    if (Polycod.util.isNgEvent(key)) {
                        var name = key.replace(/^bind-/, '');
                        name = Polycod.util.deAll(name);
                        events[name] = value;
                    }
                    // setup watchers for properties
                    if (Polycod.util.isNgProperty(key)) {
                        var name = key.replace(/^bind-/, '');
                        name = Polycod.util.deAll(name);
                        ctrl[name] = undefined;
                        scope.$watch(value, function (v) {
                            ctrl[key] = v;
                        });
                    }
                    else {
                        ctrl[key] = value;
                    }
                }
                // implements functions to emit events
                if (this.klass.annotations.events) {
                    var ev, index;
                    for (index in this.klass.annotations.events) {
                        ev = this.klass.annotations.events[index];
                        if (ctrl[ev])
                            continue;
                        ctrl[ev] = function () {
                            var args = [];
                            for (var _i = 0; _i < arguments.length; _i++) {
                                args[_i - 0] = arguments[_i];
                            }
                            var $parse = injector.get('$parse');
                            if (!events.hasOwnProperty(ev)) {
                                var $log = injector.get('$log');
                                $log.info(_this.name + ": no callback set for " + ev);
                                return;
                            }
                            var fn = $parse(events[ev]);
                            var data = args.length <= 1 ? args[0] : args;
                            var event = { data: data };
                            fn(scope, { $event: event });
                        };
                    }
                }
                // proxy from scope to controller
                for (key in ctrl) {
                    if (key.indexOf('$') === 0)
                        continue;
                    Object.defineProperty(scope, key, {
                        get: function () {
                            return ctrl[key];
                        }
                    });
                }
            };
            Component.prototype.postlink = function (scope, element, attrs, ctrl) {
                (typeof ctrl.activate === 'function') && ctrl.activate();
            };
            return Component;
        })();
        Ng1.Component = Component;
    })(Ng1 = Polycod.Ng1 || (Polycod.Ng1 = {}));
})(Polycod || (Polycod = {}));
/// <reference path = "polycod/ng1/component.ts" />
var Polycod;
(function (Polycod) {
    var strategy = Polycod.Ng1.Component;
    function Component(klass) {
        return new strategy(klass);
    }
    Polycod.Component = Component;
    function component(annotations) {
        var klass = annotations['class'];
        delete annotations['class'];
        klass.annotations = annotations;
        return new strategy(klass);
    }
    Polycod.component = component;
})(Polycod || (Polycod = {}));
