angular.module('demo', []);

angular.module('demo').run(function($rootScope) {
  $rootScope.userName = 'joe';
  $rootScope.onActivated = function ($event) {
    console.log('got event', $event);
    $rootScope.gotActivated = true;
  }
  $rootScope.gotActivated = false;
});

Polycod.component({
  selector: 'foo',
  module: 'demo',
  inject: ['$element'],
  template: '<h1>hello {{ name }}</h1><small>(using name from binding)</small>',
  events: ['activated', 'deactivated'],
  class: function($element) {
    console.log('injected $element', $element);

    this.activate = function() {
      this.activated('yay')
    }.bind(this);
  }
});
