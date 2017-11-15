module Polycod {
  export abstract class Controller {
    $injector: any
    $apply: Function
    $get: (string) => any
  }
}
