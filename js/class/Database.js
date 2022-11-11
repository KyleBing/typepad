const OBJECT_NAME = 'TypingRecord';
const SPEED_GAP   = 30;             // 速度阶梯，每30新增一个颜色

define(['Utility', 'ArticleType'], function (Utility, ArticleType) {
   /**
    * IndexedDB 数据库
    */
   class Database {
      constructor() {
         // INDEX DB
         let request = window.indexedDB.open(DBName);
         request.onsuccess = e =>{
            if (e.returnValue){
               this.db = request.result;
            } else {
            }
         }

         request.onerror = e => {
            console.log(e);
         }

         request.onupgradeneeded = e => {
            if (this.db){
            } else {
               this.db = request.result;
            }
            let objectStore = this.db.createObjectStore(OBJECT_NAME, { keyPath: 'id' });
         }
      }
      // 添加数据
      insert(record, config){
         // 记录当前跟打的重复值，避免 config 被修改，导致产出的记录值不对
         let lastRepeatCount = config.repeatCountCurrent
         let articleName =
             config.isAutoRepeat ?
             config.articleName + ' : ' + config.repeatCountCurrent :
             config.articleName;
         let request = this.db.transaction([OBJECT_NAME], 'readwrite')
            .objectStore(OBJECT_NAME)
            .add({
               id                : config.IDBIndex,
               speed             : record.speed,
               codeLength        : record.codeLength,
               hitRate           : record.hitRate,
               backspace         : record.backspace,
               wordCount         : record.wordCount,
               articleIdentifier : config.articleIdentifier,
               articleName       : articleName,
               timeStart         : record.timeStart,
               duration          : record.duration,
               articleType       : config.articleType,
            });
         request.onsuccess = e => {
            console.log('insert data success');
            // 插入最后的数据到顶部
            let tr = document.createElement('tr');
            tr.innerHTML = record.getHtml(config, lastRepeatCount);
            let tbody = $('tbody');
            tbody.insertBefore(tr, tbody.firstChild);

            // RECORD LIST
            let div = document.createElement('div');
            div.classList.add('record-item')
            div.innerHTML = record.getHtmlForRecord(config);
            let recordContainer = $('.record-container');
            recordContainer.insertBefore(div, recordContainer.firstChild);

            // id ++
            config.IDBIndex = config.IDBIndex + 1; config.save();
         }

         request.onerror = e => {
            console.log(e);
            console.log('insert data error')
         }
      }

      // 获取所有数据
      fetchAll(){
         let request = window.indexedDB.open(DBName);
         request.onsuccess = e => {
            if (e.returnValue) {
               let result = request.result;
               let objectStore = this.db.transaction([OBJECT_NAME], 'readwrite').objectStore(OBJECT_NAME);
               let htmlTable = '';
               let htmlRecordList = '';
               let currentCursor = objectStore.openCursor(IDBKeyRange.upperBound(9999), "prev").onsuccess = e => {
                  let cursor = e.target.result;
                  if (cursor) {
                     htmlTable = htmlTable + this.getHtmlWithCursor(cursor);
                     document.querySelector('tbody').innerHTML = htmlTable;

                     // RECORD LIST
                     htmlRecordList = htmlRecordList + this.getHtmlForRecordWithCursor(cursor);
                     document.querySelector('.record-container').innerHTML = htmlRecordList;

                     cursor.continue(); // 移到下一个位置
                  }
               }
            } else {
            }
         };

         request.onerror = e => {
            console.log(e);
         }
      }

      getHtmlWithCursor(cursor){
         let level = Math.floor(cursor.value.speed/SPEED_GAP);
         level = level > 6 ? 6 : level;
         let articleTypeName = ArticleType.getTypeNameWith(cursor.value.articleType);
         let textClass = ArticleType.getTextClassNameOf(cursor.value.articleType)
         return `<tr>  
              <td class="text-center">${cursor.key}</td>
              <td class="bold galvji speed text-right lv-${level}">${cursor.value.speed}</td>
              <td class="hidden-sm">${cursor.value.hitRate}</td>
              <td class="hidden-sm">${cursor.value.codeLength}</td>
              <td class="hidden-sm">${cursor.value.backspace}</td>
              <td>${cursor.value.wordCount}</td>
              <td class="time">${Utility.formatTimeLeft(cursor.value.duration)}</td>
              <td class="text-center ${textClass}">${articleTypeName}</td>
              <td>${cursor.value.articleName ? cursor.value.articleName : ''}</td>
              <td class="hidden-sm time">${Utility.dateFormatter(new Date(cursor.value.timeStart))}</td>
              <td><button class="btn btn-danger btn-sm" onclick="engine.delete(${cursor.key}, this)" type="button">删除</button></td>
            </tr>`;
      }


      getHtmlForRecordWithCursor(cursor){
         let level = Math.floor(cursor.value.speed/SPEED_GAP);
         level = level > 6 ? 6 : level;
         let articleType = ArticleType.getTypeNameWith(cursor.value.articleType);
         let textClass = ArticleType.getTextClassNameOf(articleType)
         return `<div class="record-item">
               <div class="speed lv-${level}">${cursor.value.speed}</div>
               <div class="meta">
                  <div class="hit-rate">${cursor.value.hitRate}</div>
                  <div class="code-length">${cursor.value.codeLength}</div>
               </div>
            </div>`;
      }


      // 删除一条数据
      delete(id, sender){
         let objectStore = this.db.transaction([OBJECT_NAME], 'readwrite').objectStore(OBJECT_NAME);
         objectStore.delete(id).onsuccess = e => {
            console.log(`delete data ${id} success`);
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

   return Database;

})
