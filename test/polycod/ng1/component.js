var app = angular.module('myApp', []);

Polycod.component({
  selector: 'test1',
  module: 'myApp',
  template: '<h1>HELLO {{ user_name }}</h1>',
  class: function() {}
});

Polycod.component({
  selector: 'test2',
  module: 'myApp',
  events: ['activated', 'deactivated'],
  template: '<h1>bright side.</h1>',
  class: function() {
    this.ngAfterViewInit = function() {
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

Polycod.component({
  selector: 'test5',
  module: 'myApp',
  template: '<input (click)="onClick()" (keydown)="onKeydown()" [(ng-model)]="foo"></div>',
  class: function() {}
});

Polycod.component({
  selector: 'test6',
  module: 'myApp',
  template: '<h1>HELLO {{ name }}</h1>',
  class: function() {
    this.ngOnChanges = function(changes) {}
  }
});

Polycod.component({
  selector: 'test7',
  module: 'myApp',
  properties: ['organization'],
  template: '<h1>HELLO</h1>',
  class: function() {
    this.ngOnChanges = function(changes) {}
  }
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
    var element = $compile("<test1 [user_name]=\"userName\"></test1")(scope);
    $rootScope.$digest();
    expect(element.html()).toContain('HELLO joe')

    scope.userName = 'jane';
    $rootScope.$digest();
    expect(element.html()).toContain('HELLO jane')
  });

  it('compiles with two way binding', function() {
    scope = $rootScope.$new();
    scope.user      = 'joe';
    var element     = $compile("<test1 [(user_name)]=\"user\"></test1")(scope);
    var controller  = element.controller('test1');
    $rootScope.$digest();
    expect(element.html()).toContain('HELLO joe')

    scope.user = 'jane';
    $rootScope.$digest();
    expect(controller.user_name).toEqual('jane');
    expect(element.html()).toContain('HELLO jane')

    controller.user_name = 'jeremy';
    $rootScope.$digest();
    expect(scope.user).toEqual('jeremy')
  });

  // hm, does not work in test run (injector is undefined), but works in real world.
  it('compiles with events', function() {
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
    var element = $compile("<test4 [items]='items'></test4")(scope);
    $rootScope.$digest();
    expect(element.html()).toContain('ng-repeat="item in items')
  });

  it('replaces (click) with ng-click', function() {
    scope = $rootScope.$new();
    var element = $compile("<test5></test5")(scope);
    $rootScope.$digest();
    expect(element.html()).toContain('ng-click')
  });

  it('replaces (keydown) with ng-keydown', function() {
    scope = $rootScope.$new();
    var element = $compile("<test5></test5")(scope);
    $rootScope.$digest();
    expect(element.html()).toContain('ng-keydown')
  });

  it('replaces [(ng-model)] with ng-model', function() {
    scope = $rootScope.$new();
    var element = $compile("<test5></test5")(scope);
    $rootScope.$digest();
    expect(element.html()).toContain('ng-model=')
  });

  it('calls ngOnChanges when binding changed', function() {
    scope = $rootScope.$new();
    scope.userName  = 'joe';
    var element     = $compile("<test6 [name]=\"userName\"></test6")(scope);
    var controller  = element.controller('test6');
    $rootScope.$digest();

    scope.userName  = 'jane';
    expect(element.html()).toContain('HELLO joe')

    spyOn(controller, 'ngOnChanges')
    scope.userName = 'jeremy';
    $rootScope.$digest();

    expect(controller.ngOnChanges).toHaveBeenCalledWith({ name: { currentValue: 'jeremy'  } });

    controller.name = 'johanna';
    $rootScope.$digest();

    expect(controller.ngOnChanges).toHaveBeenCalledWith({ name: { currentValue: 'johanna'  } });
  });

  it('calls ngOnChanges when property changed', function() {
    scope = $rootScope.$new();
    var element     = $compile("<test7></test7")(scope);
    var controller  = element.controller('test7');

    spyOn(controller, 'ngOnChanges')
    controller.organization = 'McJunkin';
    $rootScope.$digest();

    expect(controller.ngOnChanges).toHaveBeenCalledWith({ organization: { currentValue: 'McJunkin'  } });
  });

  it('calls ngOnChanges only once when defined both in markup and annotation', function() {
    scope = $rootScope.$new();
    var element     = $compile("<test7 [organization]='comp'></test7")(scope);
    var controller  = element.controller('test7');

    $rootScope.$digest();

    spyOn(controller, 'ngOnChanges')
    controller.organization = 'McJunkin';
    $rootScope.$digest();

    expect(controller.ngOnChanges).toHaveBeenCalledWith({ organization: { currentValue: 'McJunkin'  } });
    expect(controller.ngOnChanges.calls.count()).toEqual(1);
  });
});
