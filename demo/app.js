angular.module('demo', []);

angular.module('demo').run(function($rootScope) {
  $rootScope.name1 = 'joe';
  $rootScope.name2 = 'joe';
  $rootScope.onActivated = function ($event) {
    console.log('got event', $event);
    $rootScope.gotActivated = true;
  }
  $rootScope.gotActivated = false;
  $rootScope.weekDays = ['monday', 'tuesday', 'wednesday']
  $rootScope.addItem = function() {
    $rootScope.weekDays.push('foo' + Date.now());
  };
});

Polycod.component({
  selector: 'cmp1',
  module: 'demo',
  providers: ['$element', '$timeout'],
  template: '<div class="component"><h1>hello {{ name }}&nbsp;<small>(using name1 from binding)</small></h1><content select="info"></content><br /><br /><button>Change Name</button></div>',
  events: ['activated', 'deactivated'],
  transclude: true,
  class: function($element, $timeout) {
    var self = this;

    this.activate = function() {
      self.activated('yay')
    };

    $element.find('button').on('click', function () {
      $timeout(function () {
        self.name = 'jane'; 
      });
    });
  }
});

Polycod.component({
  selector: 'cmp2',
  module: 'demo',
  template: '<div class="component"><span *ng-for="#day of days" (click)="onClick()">{{ day }}&nbsp;</span></div>',
  class: function() {
    this.onClick = function() {
      alert('clicked a day. is it your favourite day? i won\'t tell anyone.');
    }
  }
});

Polycod.component({
  selector: 'cmp4',
  module: 'demo',
  providers: ['$element', '$timeout'],
  template: '<div class="component"><h1>hello {{ name }}&nbsp;<small>(using name2 from two-way binding)</small></h1><button>Change Name</button></div>',
  class: function($element, $timeout) {
    var self = this;

    $element.find('button').on('click', function () {
      $timeout(function () {
        self.name = 'jane'; 
      });
    });
  }
});

