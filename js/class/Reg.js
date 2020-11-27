const Reg = {
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

define(function () {
   return Reg
})