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
                if (klass.annotations.providers)
                    this.klass['$inject'] = klass.annotations.providers;
                this.name = Polycod.util.dash2Camel(Polycod.util.deBracket(klass.annotations.selector));
                this.build();
            }
            Component.prototype.build = function () {
                var _this = this;
                angular.module(this.klass.annotations.module).directive(this.name, function () {
                    return {
                        controller: _this.klass,
                        controllerAs: _this.name,
                        // bindToController does not work with attributes in parenthesis or brackets
                        // instead we use our own proxying (see below)
                        bindToController: false,
                        scope: true,
                        compile: _this.compile.bind(_this),
                        templateUrl: _this.klass.annotations.templateUrl,
                        template: _this.klass.annotations.template,
                        transclude: _this.klass.annotations.transclude,
                    };
                });
            };
            Component.prototype.compile = function (element, attrs) {
                element[0].innerHTML = this.convertTemplate(element[0].innerHTML);
                return {
                    pre: this.prelink.bind(this),
                    post: this.postlink.bind(this)
                };
            };
            Component.prototype.prelink = function (scope, element, attrs, ctrl) {
                var events = {};
                var injector = element.injector();
                for (var key in attrs) {
                    var value = attrs[key];
                    if (Polycod.util.isNgEvent(key)) {
                        var name = key.replace(/^bind-/, '');
                        name = Polycod.util.deAll(name);
                        events[name] = value;
                    }
                    else if (Polycod.util.isNgProperty(key)) {
                        var name = key.replace(/^bind-/, '');
                        name = Polycod.util.deAll(name);
                        ctrl[name] = undefined;
                        (function (_name) {
                            scope.$watch(value, function (v) {
                                ctrl[_name] = v;
                            });
                        })(name);
                    }
                    else {
                        ctrl[key] = value;
                    }
                }
                // implements functions to emit events
                if (this.klass.annotations.events) {
                    for (var index in this.klass.annotations.events) {
                        var ev = this.klass.annotations.events[index];
                        if (ctrl[ev])
                            continue;
                        (function (_event) {
                            ctrl[_event] = function () {
                                var $parse = injector.get('$parse');
                                if (!events.hasOwnProperty(_event)) {
                                    var $log = injector.get('$log');
                                    $log.info(this.name + ": no callback set for " + _event);
                                    return;
                                }
                                var fn = $parse(events[_event]);
                                var args = [].slice.call(arguments);
                                var data = args.length <= 1 ? args[0] : args;
                                var event = { data: data };
                                fn(scope, { $event: event });
                            };
                        })(ev);
                    }
                }
                // proxy from scope to controller
                for (key in ctrl) {
                    if (key.indexOf('$') === 0)
                        continue;
                    (function (_key) {
                        Object.defineProperty(scope, _key, {
                            get: function () {
                                return ctrl[_key];
                            }
                        });
                    })(key);
                }
            };
            Component.prototype.postlink = function (scope, element, attrs, ctrl, transclude) {
                (typeof ctrl.activate === 'function') && ctrl.activate();
                if (!this.klass.annotations.transclude)
                    return;
                // custom transclusion. from here https://www.airpair.com/angularjs/posts/creating-container-components-part-2-angular-1-directives
                transclude(function (clone) {
                    angular.forEach(clone, function (cloneEl) {
                        if (!cloneEl.attributes)
                            return;
                        var select = cloneEl.nodeName.toLowerCase();
                        var destination = element.find('content[select="' + select + '"]');
                        if (destination.length) {
                            destination.append(cloneEl);
                        }
                        else {
                            cloneEl.remove();
                        }
                    });
                });
            };
            Component.prototype.convertTemplate = function (html) {
                if (!html || !html.length)
                    return;
                html = html.replace(/((\*ng-for="#)([a-zA-Z0-9-_]+)( of )([a-zA-Z0-9-_]+))/g, 'ng-repeat="$3 in $5');
                html = html.replace(/\(click\)/g, 'ng-click');
                return html;
            };
            return Component;
        })();
        Ng1.Component = Component;
    })(Ng1 = Polycod.Ng1 || (Polycod.Ng1 = {}));
})(Polycod || (Polycod = {}));
var Polycod;
(function (Polycod) {
    var Decorators;
    (function (Decorators) {
        var addAnnotations = function (target, annotations) {
            if (!target.annotations)
                target.annotations = {};
            for (var key in annotations) {
                target.annotations[key] = annotations[key];
            }
            return target;
        };
        var validateAnnotations = function (annotations, annotationName, allowed) {
            for (var key in annotations) {
                if (allowed.indexOf(key) === -1) {
                    throw new Error("'" + key + "' option is not allowed for " + annotationName);
                }
            }
        };
        function Component(annotations) {
            return function (target) {
                validateAnnotations(annotations, 'Component', [
                    'selector', 'events', 'template', 'templateUrl', 'providers', 'module', 'transclude'
                ]);
                return addAnnotations(target, annotations);
            };
        }
        Decorators.Component = Component;
        function View(annotations) {
            return function (target) {
                validateAnnotations(annotations, 'Component', [
                    'template', 'templateUrl'
                ]);
                return addAnnotations(target, annotations);
            };
        }
        Decorators.View = View;
        function Ng1(annotations) {
            return function (target) {
                validateAnnotations(annotations, 'Component', [
                    'providers', 'transclude', 'module'
                ]);
                return addAnnotations(target, annotations);
            };
        }
        Decorators.Ng1 = Ng1;
    })(Decorators = Polycod.Decorators || (Polycod.Decorators = {}));
})(Polycod || (Polycod = {}));
/// <reference path = "polycod/ng1/component.ts" />
/// <reference path = "polycod/decorators.ts" />
var Polycod;
(function (Polycod) {
    var strategy = Polycod.Ng1.Component;
    function bootstrap(klass) {
        return new strategy(klass);
    }
    Polycod.bootstrap = bootstrap;
    function component(annotations) {
        var klass = annotations['class'];
        delete annotations['class'];
        klass.annotations = annotations;
        return new strategy(klass);
    }
    Polycod.component = component;
})(Polycod || (Polycod = {}));
