declare var Polycod;

@Polycod.Decorators.Component({
  selector: 'cmp3',
  host: { foo: 'bar()' }
})
@Polycod.Decorators.View({
  template: '<div class="component">this is a typescript component</div>'
})
@Polycod.Decorators.Ng1({
  module: 'demo'
})
class Cmp3 {
  activate() {
    console.log('cmp3 activated');
  }
}

Polycod.bootstrap(Cmp3);
