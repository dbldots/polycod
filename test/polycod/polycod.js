describe('Polycod', function(){
  describe('.component', function() {
    var cmp;
    var app = angular.module('demo', []);

    beforeEach(function() {
      cmp = Polycod.component({
        selector: 'foo',
        module: 'demo',
        class: function() {}
      });
    });

    it('should instantiate a new component', function(){
      expect(cmp).toEqual(jasmine.any(Polycod.Ng1.Component));
    });

    it('should move options to class annotations', function(){
      expect(cmp.klass.annotations).toEqual({ selector: 'foo', module: 'demo'});
    });
  });
});
