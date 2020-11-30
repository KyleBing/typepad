/**
 * 按键配置正则表达式
 * @type {{all: RegExp, ctrl: RegExp, shift: RegExp, alt: RegExp, delete: RegExp, space: RegExp, number: RegExp, backspace: RegExp, meta: RegExp, function: RegExp, az: RegExp, quot: RegExp, semicolon: RegExp}}
 */
define(function () {
   return{
      all        : /.*/,
      az         : /^[a-zA-Z]$/,
      number     : /\d/,
      function   : /^(Control|Alt|Meta|Shift|Tab)$/,
      ctrl       : /^(Control|Alt|Meta|Shift)$/,
      shift      : /^Shift$/,
      meta       : /^Meta$/,
      alt        : /^Alt$/,
      space      : /^ $/,
      backspace  : /^Backspace$/,
      delete     : /^Delete$/,
      semicolon  : /;/,
      quot       : /'/,
   };
})