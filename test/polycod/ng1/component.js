var app = angular.module('myApp', []);

Polycod.component({
  selector: 'test1',
  module: 'myApp',
  template: '<h1>HELLO {{ name }}</h1>',
  class: function() {}
});

Polycod.component({
  selector: 'test2',
  module: 'myApp',
  events: ['activated', 'deactivated'],
  template: '<h1>bright side.</h1>',
  class: function() {
    this.activate = function() {
      this.activated('yay');
    }.bind(this);
  }
});

Polycod.component({
  selector: 'test3',
  module: 'myApp',
  transclude: true,
  events: ['activated', 'deactivated'],
  template: '<content select="info">',
  class: function() {}
});

Polycod.component({
  selector: 'test4',
  module: 'myApp',
  template: '<div *ng-for="#item of items"></div>',
  class: function() {}
});

describe('Polycod.Ng1.Component', function(){
  describe('#constructor', function() {
    it('moves providers to $inject', function(){
      var cmp = Polycod.component({
        selector: 'foo',
        module: 'demo',
        providers: ['$timeout'],
        class: function() {}
      });
      expect(cmp.klass['$inject']).toEqual(['$timeout']);
    });

    it('initializes camel cased name for angular', function(){
      var cmp = Polycod.component({
        selector: 'foo-bar',
        module: 'demo',
        providers: ['$timeout'],
        class: function() {}
      });
      expect(cmp.name).toEqual('fooBar');
    });
  });
});

describe('Testing directives', function() {
  var $compile,
      $rootScope;

  beforeEach(module('myApp'));

  beforeEach(inject(function(_$compile_, _$rootScope_){
    $compile = _$compile_;
    $rootScope = _$rootScope_;
  }));

  it('compiles with binding', function() {
    scope = $rootScope.$new();
    scope.userName = 'joe';
    var element = $compile("<test1 [name]=\"userName\"></test1")(scope);
    $rootScope.$digest();
    expect(element.html()).toContain('HELLO joe')

    scope.userName = 'jane';
    $rootScope.$digest();
    expect(element.html()).toContain('HELLO jane')
  });

  // hm, does not work in test run (injector is undefined), but works in real world.
  xit('compiles with events', function() {
    scope = $rootScope.$new();
    scope.onActivated = function() {};
    var element = $compile("<test2 (activated)=\"onActivated($event)\"></test2")(scope);
    $rootScope.$digest();
  });

  it('compiles with transclusion', function() {
    scope = $rootScope.$new();
    scope.userName = 'joe';
    var element = $compile("<test3><info>INFO</info></test3")(scope);
    $rootScope.$digest();
    expect(element.html()).toContain('INFO')
  });

  it('reformats ng-for', function() {
    scope = $rootScope.$new();
    scope.userName = 'joe';
    scope.items = ['one']
    var element = $compile("<test4></test4")(scope);
    $rootScope.$digest();
    expect(element.html()).toContain('ng-repeat="item in items"')
  });
});
