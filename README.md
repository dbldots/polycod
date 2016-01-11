# polycod
[![build status](https://travis-ci.org/dbldots/polycod.svg?branch=master)](https://travis-ci.org/dbldots/polycod)

Polycod is a shim library that exposes an API similiar to angular2 to write components for angular 1.x applications. Polycod also supports Typescript annotations like angular 2 does.

The purpose of this library is to seamlessly migrate existing angular1 applications to angular2.

Polycod is heavily inspired by [ngsham](https://github.com/mediapeers/mpx-ngsham). Kudos to [Jason Grier](https://github.com/jasongrier).

*Naming: The company I work for uses animal names for their weekly sprints. Last week was the week of 'cod'. A combination of 'polyfill' and 'cod' then resulted into 'polycod'. It sounds a bit like 'polyglot', which I like in this context. Native speakers may have a different opinion :)* 

## Setup

### Install via npm

`npm install polycod`

### Install via bower

`bower install polycod`

### Load polycod

Make sure polycod is loaded into the browser after angular. Do it the way you want.

## Usage

### Javascript

```javascript
Polycod.component({
  module: 'demo',
  selector: 'js-cmp',
  template: '<h1>HELLO</h1>',
  class: function() {}
});

```

### Typescript

```typescript
// declare or reference policod.d.ts first
declare var Polycod;

@Polycod.Decorators.Component({
  module: 'demo',
  selector: 'ts-cmp',
  template: '<h1>HELLO</h1>',
})
class TsCmp {
}

Polycod.bootstrap(TsCmp);
```

A View decorator is also available:

```typescript
// declare or reference policod.d.ts first
declare var Polycod;

@Polycod.Decorators.Component({
  module: 'demo',
  selector: 'ts-cmp'
})
@Polycod.Decorators.View({
  template: '<h1>HELLO</h1>'
})
class TsCmp {
}

Polycod.bootstrap(TsCmp);
```

## Features

### Bindings

Polycod allows you to bind to your controllers directly.

Example:

```typescript
@Polycod.Decorators.Component({
  module: 'demo',
  selector: 'ts-cmp',
  template: '<h1>HELLO {{ name }}</h1>'
})
class TsCmp {
  name = 'joe';
}
```

.. will display: `HELLO joe`

### Events

It is easily possible to setup events emitted by your components.
Let's assume the context of your new component is some old angular 1 scope like this:

```javascript
var scope = $rootScope.$new()
scope.onSubmitted = function ($event) {
  console.log($event.data);
};
```

This is your component emitting the event when the `submit` function is called:

```typescript
@Polycod.Decorators.Component({
  module: 'demo',
  selector: 'ts-cmp',
  events: ['submitted'],
  template: '<h1>HELLO</h1>'
})
class TsCmp {
  submit() {
  	this.submitted('yay');
  }
}
```

The HTML that does the connection:

```html
<ts-cmp (submitted)="onSubmitted($event)"></ts-cmp>
```

### Properties (one directional bindings)

This makes a local variable available as property in your component (on the component controller). Any change will be propagated.

```html
<ts-cmp [name]="userName"></ts-cmp>
```

### Dependency Injection

```typescript
@Polycod.Decorators.Component({
  module: 'demo',
  selector: 'ts-cmp',
  providers: ['$q', '$timeout', 'UserService'],
  template: '<h1>HELLO</h1>'
})
class TsCmp {
  constructor($q, $timeout, UserService) {
  	// use $q, $timeout, UserService here
  }
}
```

### Transclusion

Polycod has a custom transclusion mechanism that is not quite as nice as what angular2 provides you, but it comes close.

```typescript
@Polycod.Decorators.Component({
  module: 'demo',
  selector: 'ts-cmp',
  transclude: true,
  template: `
    <h1>HELLO</h1>
    <div transclude-id="info1"></div>
    <div transclude-id="info2"></div>
  `
})
class TsCmp {
}
```

Usage:

```html
<ts-cmp>
  <span transclude-to="info1">INFO1</span>
  <span transclude-to="info2">INFO2</span>
</ts-cmp>
```

Renders:

```html
<h1>HELLO</h1>
<div transclude-id="info1"><span transclude-to="info1">INFO1</span></div>
<div transclude-id="info2"><span transclude-to="info2">INFO2</span></div>  
```

Since `transclude` is angular 1 specific you may want to seperate the annotation which is possible as well:

```typescript
@Polycod.Decorators.Component({
  module: 'demo',
  selector: 'ts-cmp',
  template: `
    <h1>HELLO</h1>
    <div transclude-id="info1"></div>
    <div transclude-id="info2"></div>
  `
})
@Polycod.Decorators.Ng1({
  transclude: true
})
class TsCmp {
}
```

### Activate function

Expose a function called `activate` on your controller class. It is called once an instance of your component got rendered (*linked* in angular 1 lingo).

```typescript
@Polycod.Decorators.Component({
  module: 'demo',
  selector: 'ts-cmp',
  template: '<h1>HELLO</h1>',
})
class TsCmp {
  activate() {
  	console.log('rendered');
  }
}

Polycod.bootstrap(TsCmp);
```

## Caveats

### Variable naming

Since polycod is using child scopes internally, don't use the same variable name for property bindings. Using the same name effectively overrides the binding (and actually results in an indefinite loop when requesting the property value).

**Wrong:**

```html
<ts-cmp [name]="name"></ts-cmp>
```

**Right:**

```html
<ts-cmp [name]="userName"></ts-cmp>
```

## Todo

Things I would like to see in polycod:

* `host` events
* Two way bindings
* Throw error when same variable name is used for properties.
* Support AMD/CommonJS module strategies

## Development

### Setup

```bash
npm install
npm install -g testem
npm install -g browserify
npm install -g typescript
```

### Test run

`testem`

### Build

`./bin/build`

### Launch demo

`./bin/demo`

> Serves a local server on port 8000.
