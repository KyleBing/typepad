const OBJECT_NAME = 'TypingRecord';
const SPEED_GAP   = 30;             // 速度阶梯，每30新增一个颜色

// IndexDB
class Database {
   constructor() {
      // INDEX DB
      let request = window.indexedDB.open(DBName);
      request.onsuccess = e =>{
         if (e.returnValue){
            this.db = request.result;
            this.fetchAll();
         } else {
         }
      }

      request.onerror = e => {
         show(e);
      }

      request.onupgradeneeded = e => {
         if (this.db){
         } else {
            this.db = request.result;
         }
         var objectStore = this.db.createObjectStore(OBJECT_NAME, { keyPath: 'id' });
      }
   }
   // 添加数据
   insert(record, config){
      console.log(config.IDBIndex,record)
      let request = this.db.transaction([OBJECT_NAME], 'readwrite')
         .objectStore(OBJECT_NAME)
         .add({
            id: config.IDBIndex,
            speed: record.speed,
            codeLength: record.codeLength,
            hitRate: record.hitRate,
            backspace: record.backspace,
            wordCount: record.wordCount,
            articleIdentifier: config.articleIdentifier,
            articleName: config.articleName,
            timeStart: record.timeStart,
            duration: record.duration,
            articleType: config.articleType,
         });
      request.onsuccess = e => {
         show('insert data success');
         // 插入最后的数据到顶部
         let tr = document.createElement('tr');
         tr.innerHTML = record.getHtml(config);
         let tbody = $('tbody');
         tbody.insertBefore(tr, tbody.firstChild);
         // id ++
         config.IDBIndex = config.IDBIndex + 1; config.save();
      }

      request.onerror = e => {
         show(e);
         show('insert data error')
      }
   }

   // 获取所有数据
   fetchAll(){
      let request = window.indexedDB.open(DBName);
      request.onsuccess = e => {
         if (e.returnValue) {
            let result = request.result;
            let objectStore = this.db.transaction([OBJECT_NAME], 'readwrite').objectStore(OBJECT_NAME);
            let html = '';
            let currentCursor = objectStore.openCursor(IDBKeyRange.upperBound(9999), "prev").onsuccess = e => {
               let cursor = e.target.result;
               if (cursor) {
                  html = html + this.getHtmlWithCursor(cursor);
                  document.querySelector('tbody').innerHTML = html;
                  cursor.continue(); // 移到下一个位置
               }
            }
         } else {
         }
      };

      request.onerror = e => {
         show(e);
      }
   }

   getHtmlWithCursor(cursor){
      let level = Math.floor(cursor.value.speed/SPEED_GAP);
      level = level > 6 ? 6 : level;
      let articleType = ArticleType.getTypeNameWith(cursor.value.articleType);
      let textClass = '';
      switch (cursor.value.articleType) {
         case ArticleType.character: textClass = 'text-orange';break;
         case ArticleType.english: textClass = 'text-green';break;
         case ArticleType.article: textClass = 'text-blue';break;
         case ArticleType.word: textClass = 'text-red';break;
         default: articleType = '' ;break;
      }
      return `<tr>  
              <td class="text-center roboto-mono">${cursor.key}</td>
              <td class="bold roboto-mono lv-${level}">${cursor.value.speed}</td>
              <td>${cursor.value.codeLength}</td>
              <td>${cursor.value.hitRate}</td>
              <td>${cursor.value.backspace}</td>
              <td>${cursor.value.wordCount}</td>
              <td class="text-center ${textClass}"">${articleType}</td>
              <td>${cursor.value.articleName ? cursor.value.articleName : ''}</td>
              <td class="hidden-sm">${dateFormatter(new Date(cursor.value.timeStart))}</td>
              <td class="time">${formatTimeLeft(cursor.value.duration)}</td>
              <td><button class="btn btn-danger btn-sm" onclick="engine.delete(${cursor.key}, this)" type="button">删除</button></td>
            </tr>`;
   }


   // 删除一条数据
   delete(id, sender){
      let objectStore = this.db.transaction([OBJECT_NAME], 'readwrite').objectStore(OBJECT_NAME);
      objectStore.delete(id).onsuccess = e => {
         show(`delete data ${id} success`);
         sender.parentElement.parentElement.remove();
      };
   }

   // 清除记录
   clear(config){
      let objectStore = this.db.transaction([OBJECT_NAME], 'readwrite').objectStore(OBJECT_NAME);
      let that = this;
      objectStore.clear().onsuccess = e => {
         config.IDBIndex = 1;config.save();
         that.fetchAll();
         location.reload();
      };
   }
}

define(function () {
   return Database;
})