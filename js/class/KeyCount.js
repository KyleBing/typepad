define(['Reg'], function (Reg) {
   /**
    * 按键记录
    */
   class KeyCount {
      constructor() {
         this.all        = 0; // 所有按键
         this.az         = 0;
         this.number     = 0;
         this.ctrl       = 0;
         this.shift      = 0;
         this.meta       = 0;
         this.alt        = 0;
         this.function   = 0;
         this.space      = 0;
         this.backspace  = 0;
         this.semicolon  = 0;
         this.quot       = 0;
      }

      reset (){
         for (let name in this) {
            this[name] = 0;
         }
      }

      // Count Key
      countKeys(e) {
         if(e.key === 'Process') return
         for (let type in this){
            if ( typeof(this[type]) !== 'function' ){
               if (Reg.KEYS[type].test(e.key)){
                  this[type]++
               }
            }
         }
      }

      // 最终结束的时候，上屏的那个按钮是无法被记录到 keyCount 中的，所以需要手动 +1
      plusOne(){
         this.all++
      }
   }

   return KeyCount
})
