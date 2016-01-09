declare module Polycod {
    namespace util {
        function noop(): void;
        function deBracket(s: string): string;
        function deParen(s: string): string;
        function deAll(s: string): string;
        function dash2Camel(s: string): string;
        function isNgEvent(s: string): Boolean;
        function isNgProperty(s: string): Boolean;
        function isNgAttribute(s: string): Boolean;
    }
}
declare var angular: any;
declare module Polycod {
    module Ng1 {
        class Component {
            klass: any;
            name: string;
            constructor(klass: any);
            private build();
            private compile(element, attrs);
            private prelink(scope, element, attrs, ctrl);
            private postlink(scope, element, attrs, ctrl, transclude);
            private convertTemplate(html);
        }
    }
}
declare module Polycod {
    function Component(klass: any): Ng1.Component;
    function component(annotations: any): Ng1.Component;
}
