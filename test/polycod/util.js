describe('Polycod.util', function(){
  describe('.deBracket', function() {
    it('should remove the brackets', function(){
      expect(Polycod.util.deBracket('[hello]')).toEqual('hello');
    });
  });

  describe('.deParen', function() {
    it('should remove the parenthesis', function(){
      expect(Polycod.util.deParen('(hello)')).toEqual('hello');
    });
  });

  describe('.deAll', function() {
    it('should remove the parenthesis AND brackets', function(){
      expect(Polycod.util.deAll('[(hello)]')).toEqual('hello');
    });
  });

  describe('.dash2Camel', function() {
    it('should convert from dashed to camel case', function(){
      expect(Polycod.util.dash2Camel('foo-bar-joe')).toEqual('fooBarJoe');
    });
  });

  describe('.isNgEvent', function() {
    it('should detect event attribute', function(){
      expect(Polycod.util.isNgEvent('(activated)')).toEqual(true);
    });
  });

  describe('.isNgProperty', function() {
    it('should detect property attribute', function(){
      expect(Polycod.util.isNgProperty('[model]')).toEqual(true);
    });
  });

  describe('.isNgTwoWayBinding', function() {
    it('should detect two-way binding attribute', function(){
      expect(Polycod.util.isNgTwoWayBinding('[(model)]')).toEqual(true);
    });
  });

  describe('.isNgAttribute', function() {
    it('should detect attribute', function(){
      expect(Polycod.util.isNgAttribute('staticAttr')).toEqual(true);
    });

    it('should not consider event attr as static attr', function(){
      expect(Polycod.util.isNgAttribute('(activated)')).toEqual(false);
    });

    it('should not consider property attr as static attr', function(){
      expect(Polycod.util.isNgAttribute('[model]')).toEqual(false);
    });
  });
});
