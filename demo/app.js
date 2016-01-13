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
  providers: ['$element'],
  template: '\
    <div class="component">\
      <h1>hello {{ name }}&nbsp;<small>(using name1 from binding)</small></h1>\
      <content select="info"></content>\
      <br /><br />\
      <button (click)="changeName()">Change Name</button>\
    </div>',
  events: ['activated', 'deactivated'],
  transclude: true,
  class: function($element) {
    var self = this;

    this.activate = function() {
      self.activated('yay')
    };

    this.changeName = function() {
      self.name = 'jane';
    };
  }
});

Polycod.component({
  selector: 'cmp2',
  module: 'demo',
  template: '\
    <div class="component">\
      <span *ng-for="#day of days" (click)="onClick()">{{ day }}&nbsp;</span>\
    </div>',
  class: function() {
    this.onClick = function() {
      alert('clicked a day. is it your favourite day? i won\'t tell anyone.');
    }
  }
});

Polycod.component({
  selector: 'cmp4',
  module: 'demo',
  providers: ['$element'],
  host: { 'mouseover': 'onMouseover()' },
  template: '\
    <div class="component">\
      <h1>hello {{ name }}&nbsp;<small>(using name2 from two-way binding)</small></h1>\
      <button (click)="changeName()">Change Name</button>\
      <br /><br />\
      got {{ mouseOverCount }} mouseover events\
    </div>',
  class: function($element) {
    var self = this;
    this.mouseOverCount = 0;

    this.changeName = function() {
      self.name = 'jane';
    };

    this.onMouseover = function() {
      self.mouseOverCount++;
    };

    this.ngOnChanges = function(changes) {
      console.log('cmp4: got property changes', changes);
    }
  }
});

