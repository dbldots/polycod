module Polycod {
  export namespace util {
    export function noop (): void {};

    export function deBracket (s: string): string {
      return s.replace(/[\[\]]/g, '');
    };

    export function deParen (s: string): string {
      return s.replace(/[\(\)]/g, '');
    };

    export function deAll (s: string): string {
      return s.replace(/[\(\)\[\]]/g, '');
    }

    export function dash2Camel (s: string): string {
      return s.replace(/-([a-z])/g, function (g) {
        return g[1].toUpperCase();
      });
    };

    export function isNgEvent (s: string): Boolean {
      return /(^\((.+)\)$)/.test(s) || s.indexOf('on-') === 0;
    };

    export function isNgProperty (s: string): Boolean {
      return /(^\[(.+)\]$)/.test(s) || s.indexOf('bind-') === 0;
    };

    export function isNgTwoWayBinding (s: string): Boolean {
      return /(^\[\((.+)\)\]$)/.test(s);
    };

    export function isNgAttribute (s: string): Boolean {
      return !isNgEvent(s) && !isNgProperty(s);
    };
  }
}
