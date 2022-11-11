/**
 * 文章类别
 * @type {{character: string, english: string, word: string, getTypeNameWith(*): (string), article: string}}
 */

define(function () {
   return {
      // 这里的顺序，决定在界面中 select>option 中展示的顺序
      character : 'character',
      article   : 'article',
      phrase    : 'phrase',
      english   : 'english',
      word      : 'word',
      customize : 'customize',
      getTypeNameWith(type){
         switch (type) {
            case this.article    : return '文章';
            case this.character  : return '单字';
            case this.phrase     : return '词条';
            case this.word       : return '英文单词';
            case this.english    : return '英文文章';
            case this.customize  : return '自定义';
            default:break;
         }
      },
      // 根据内容类型标识，获取跟打记录中类别的字体颜色样式
      getTextClassNameOf(articleType){
         switch (articleType) {
            case this.character : return 'text-orange';
            case this.article   : return 'text-blue';
            case this.phrase    : return 'text-yellow';
            case this.english   : return 'text-green';
            case this.word      : return 'text-red';
            case this.customize : return 'text-roseo';
            default: return '';
         }
      }
   }
})
