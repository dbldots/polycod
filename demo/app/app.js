angular.module('demo', []);

angular.module('demo').run(function($rootScope) {
  $rootScope.hello = 'hello you';
  $rootScope.onActivated = function ($event) {
    console.log('got event', $event);
  }
});

Polycod.component({
  selector: 'foo',
  module: 'demo',
  inject: ['$element'],
  template: '<h1>{{ testvar }}</h1>',
  events: ['activated'],
  class: function($element) {
    console.log('injected $element', $element);

    this.activate = function() {
      this.activated('hey joe')
    }.bind(this);
  }
});
