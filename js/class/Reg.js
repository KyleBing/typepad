/**
 * 按键配置正则表达式
 * @type {{all: RegExp, ctrl: RegExp, shift: RegExp, alt: RegExp, delete: RegExp, space: RegExp, number: RegExp, backspace: RegExp, meta: RegExp, function: RegExp, az: RegExp, quot: RegExp, semicolon: RegExp}}
 */
define(function () {
   const REMOVE = {
      space: 			[{reg: /( |　)/g, replacement: ""},],
      return: 		[{reg: /\n/g, replacement: ""},],
      tab: 				[{reg: /\t/g, replacement: ""},],
      quot: 			[{reg: /[“”"']/g, replacement: ""},] ,
      whiteReturn: [{reg: /(^\s*?(\n|\r\n|\r))+/g, replacement: ""},],
      bracket:		[{reg: /(\(|\)|（|）)/g, replacement: ""},],
      htmlTag:		[{reg: /<.+?>|<\/.+?>/g, replacement: ""},],
      all: [].concat(
         this.space, this.return,
         this.quot, this.whiteReturn,
         this.bracket, this.tab,
         this.htmlTag
      )
   }
   const TOZH = {
      space: [
         {reg: / /g, replacement: "　"},
      ],
      comma: [
         {reg: /,/g, replacement: "，"},
         {reg: /\./g, replacement: "。"},
      ],
      questionmark: [
         {reg: /\?/g, replacement: "？"},
         {reg: /!/g, replacement: "！"},
      ],
      colon: [
         {reg: /;/g, replacement: "；"},
         {reg: /:/g, replacement: "："},
      ],
      bracket: [
         {reg: /\(/g, replacement: "（"},
         {reg: /\)/g, replacement: "）"},
      ],
      quot: [
         {reg: /"(.*?)"/g, replacement: "“$1”"},
         {reg: /'(.*?)'/g, replacement: "‘$1’"},
      ],
      connector: [
         {reg: /-/g, replacement: "—"},
         {reg: /\.\.\./g, replacement: "…"},
      ],
      all: [].concat(
         this.space, this.comma,
         this.questionmark, this.colon,
         this.bracket, this.quot,
         this.connector
      )
   }
   const TOEN = {
      space: [
         {reg: /　/g, replacement: " "},
      ],
      comma: [
         {reg: /，/g, replacement: ","},
         {reg: /。/g, replacement: "."},
      ],
      colon: [
         {reg: /；/g, replacement: ";"},
         {reg: /：/g, replacement: ":"},
      ],
      quot: [
         {reg: /[“”]/g, replacement: "\""},
         {reg: /[‘’]/g, replacement: "\'"},
      ],
      questionmark: [
         {reg: /？/g, replacement: "?"},
         {reg: /！/g, replacement: "!"},
      ],
      bracket: [
         {reg: /（/g, replacement: "("},
         {reg: /）/g, replacement: ")"},
      ],
      connector: [
         {reg: /[－—–]/g, replacement: "-"},
         {reg: /…/g, replacement: "..."},
      ],
      all: [].concat(
         this.space, this.comma,
         this.questionmark, this.colon,
         this.bracket, this.quot,
         this.connector
      )
   }
   const MATCH = {
      symbolEn: /[,.:;'"!\?\[\]#@%\^\$\(\)\*\-\=\+\_\<\>\/\\{}`~]/g,
      symbolCn: /[，。：；”…“《》、？【】『』、（）￥！・—]/g,
      characterEn: /[a-zA-Z]/g,
      space: /[ 　]/g,
      tab: /\t/g,
      quot: /['"”“]/g,
      comma: /[，。,\.]/g,
   }
   const KEYS = {
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
   }

   return {
      REMOVE, TOEN, TOZH, MATCH, KEYS
   }
})