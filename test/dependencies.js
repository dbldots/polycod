// PhantomJS doesn't support bind yet
Function.prototype.bind = Function.prototype.bind || function (thisp) {
  var fn = this;
  return function () {
    return fn.apply(thisp, arguments);
  };
};

window.jQuery = require('jquery');
require('angular');
require('angular-mocks');
