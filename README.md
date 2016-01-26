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

__CAVEATS__

* HTML is case-insensitive. thus `<cmp [userName]="name"` will not work
* Dashes will be converted to underscores: `<cmp [user-name]="name"` is the same as `<cmp [user_name]="name">`


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

### Two-Way Bindings

Polycod also supports two-way bindings.

Example:

```javascript
var scope = $rootScope.$new()
scope.userName = 'jane';
```

```typescript
@Polycod.Decorators.Component({
  module: 'demo',
  selector: 'ts-cmp',
  template: '<h1>HELLO {{ name }}</h1>'
})
class TsCmp {
}
```

```html
<ts-cmp [(name)]="userName"></ts-cmp>
```

.. will display: `HELLO joe`. Any change to `name` will also be applied to the source (the scope's `userName` in this case).

### Property change Events

If your component exposes an `ngOnChanges` function that one will be called whenever any of the properties change.

Example:

```typescript
@Polycod.Decorators.Component({
  module: 'demo',
  selector: 'ts-cmp',
  template: '<h1>HELLO {{ name }}</h1>'
})
class TsCmp {
  this.ngOnChanges = function(changes) {
    console.log(changes.name.currentValue);
  };
}
```

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

### Host Events

You can catch events on your DOM host element like this:

```typescript
@Polycod.Decorators.Component({
  module: 'demo',
  selector: 'ts-cmp',
  host: { 'click': 'onClick()' }
  template: '<h1>HELLO</h1>'
})
class TsCmp {
  onClick() {
    console.log('ts-cmp has been clicked!')
  }
}
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
    <content select="info1"></content>
    <content select="info2"></content>
  `
})
class TsCmp {
}
```

Usage:

```html
<ts-cmp>
  <info1>INFO1</info1>
  <info2>INFO2</info2>
</ts-cmp>
```

Renders:

```html
<h1>HELLO</h1>
<content select="info1"><info1">INFO1</info1></content>
<content select="info2"><info2">INFO2</info2></content>  
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

### Activate/Destroy functions

Expose a function called `ngAfterViewInit` on your controller class. It is called once an instance of your component got rendered (*linked* in angular 1 lingo).
Also a lifecycle hook for `ngOnDestroy` is available.

```typescript
@Polycod.Decorators.Component({
  module: 'demo',
  selector: 'ts-cmp',
  template: '<h1>HELLO</h1>',
})
class TsCmp {
  ngAfterViewInit() {
  	console.log('rendered');
  }
  ngOnDestroy() {
  	console.log('destroyed');
  }
}

Polycod.bootstrap(TsCmp);
```

### Component Templates

The inner HTML of your templates will be converted to support angular2 style syntax. This is the list of supported keywords that will be converted to angular1 style syntax:

* *ng-for
* [hidden]
* [(ng-model)]
* (click)
* (dbl-click)
* (mousedown)
* (mouseup)
* (mouseenter)
* (mouseleave)
* (mouseover)
* (keydown)
* (keyup)
* (keypress)
* (change)

## Todo

Things I would like to see in polycod:

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
