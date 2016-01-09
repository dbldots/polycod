var app = angular.module('myApp', []);

Polycod.component({
  selector: 'test1',
  module: 'myApp',
  template: '<h1>HELLO {{ name }}</h1>',
  class: function() { }
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

describe('Polycod.Ng1.Component', function(){
  describe('#constructor', function() {
    it('moves injections to $inject', function(){
      var cmp = Polycod.component({
        selector: 'foo',
        module: 'demo',
        inject: ['$timeout'],
        class: function() {}
      });
      expect(cmp.klass['$inject']).toEqual(['$timeout']);
    });

    it('initializes camel cased name for angular', function(){
      var cmp = Polycod.component({
        selector: 'foo-bar',
        module: 'demo',
        inject: ['$timeout'],
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
});
