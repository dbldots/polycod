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
  template: '<h1>{{ testvar }}</h1>',
  events: ['activated'],
  class: function() {
    this.fun = function() {};

    this.activate = function() {
      console.log('activate');
      this.activated('hey joe')
    }.bind(this);
  }
});
