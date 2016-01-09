angular.module('demo', []);

angular.module('demo').run(function($rootScope) {
  $rootScope.userName = 'joe';
  $rootScope.onActivated = function ($event) {
    console.log('got event', $event);
    $rootScope.gotActivated = true;
  }
  $rootScope.gotActivated = false;
  $rootScope.weekDays = ['monday', 'tuesday', 'wednesday']
  $rootScope.onClick = function() {
    alert('clicked a day. is it your favourite day? i won\'t tell anyone.');
  }
});

Polycod.component({
  selector: 'cmp1',
  module: 'demo',
  inject: ['$element'],
  template: '<h1>hello {{ name }}&nbsp;<small>(using name from binding)</small></h1><div transclude-id="info"></div>',
  events: ['activated', 'deactivated'],
  transclude: true,
  class: function($element) {
    console.log('injected $element', $element);

    this.activate = function() {
      this.activated('yay')
    }.bind(this);
  }
});

Polycod.component({
  selector: 'cmp2',
  module: 'demo',
  template: '<div><span *ng-for="#day of days" (click)="onClick()">{{ day }}&nbsp;</span></div>',
  class: function() {}
});
