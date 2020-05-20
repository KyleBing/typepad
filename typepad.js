// REG
const REG = {
  all: /.*/,
  az: /^[a-zA-Z]$/,
  number: /\d/,
  function : /^(Control|Alt|Meta|Shift|Tab)$/,
  ctrl : /^(Control|Alt|Meta|Shift)$/,
  shift : /^Shift$/,
  meta : /^Meta$/,
  alt : /^Alt$/,
  space : /^ $/,
  backspace : /^Backspace$/,
  delete : /^Delete$/,
  semicolon: /;/,
  quot: /'/,
}

class Count {
  constructor() {
    this.all = 0;
    this.az = 0;
    this.number = 0;
    this.ctrl = 0;
    this.shift = 0;
    this.meta = 0;
    this.alt = 0;
    this.function = 0;
    this.space = 0;
    this.backspace = 0;
    this.semicolon = 0;
    this.quot = 0;
  }

  init (){
    for (let name in this) {
      this[name] = 0;
    }
  }
}


// 跟打器参数
class Option {
  constructor() {
    this.chapter = 1;
    this.chapterTotal = 1;
    this.isShuffle = false;
    this.count = 15;
    this.article = ARTICLE.top500;
  }
}

// 跟打器内核
class Engine {
  constructor() {
    this.isFinished = false;
    this.isStarted = false;
    this.isPaused = false;
    this.timeStart; //ms
    this.timeEnd; // ms
    this.duration = 0; // ms
    this.handleRefresh;
    this.refreshRate = 500; // ms
  }

  start(){
    this.isStarted = true;
    this.timeStart = (new Date()).getTime();
    this.startRefresh();
  }

  startRefresh(){
    this.handleRefresh = setInterval(()=>{
      let timeNow = (new Date()).getTime();
      this.duration = timeNow - this.timeStart;
      this.updateInfo();
      this.showTime();
    }, this.refreshRate)
  }

  stopRefresh(){
    clearInterval(this.handleRefresh);
  }

  // 上一段
  prevChapter(){
    if (option.chapter !== 1){
      currentWords = currentOriginWords.slice(option.count * (option.chapter - 2), option.count * (option.chapter - 1)).join('');
      option.chapter--;
      engine.reset();
    }
  }

  // 下一段
  nextChapter(){
    if (option.chapter !== option.chapterTotal) {
      currentWords = currentOriginWords.slice(option.count * option.chapter, option.count * (option.chapter + 1)).join('');
      option.chapter++;
      engine.reset();
    }
  }

  // 改变文章内容
  changeArticle() {
    let article = $('#article').value;
    let isShuffle = $('#mode').checked;
    let radios = document.querySelectorAll('input[type=radio]');
    let perCount = 0;
    for (let i=0; i< radios.length; i++){
      if(radios[i].checked){
        perCount = Number(radios[i].value);
      }
    }
    switch (article) {
      case 'top500':
        currentOriginWords = isShuffle ? shuffle(ARTICLE.top500.split('')):ARTICLE.top500.split('');
        currentWords = currentOriginWords.slice(0, Number(perCount)).join('');
        break;
      case 'mid500':
        currentOriginWords = isShuffle ? shuffle(ARTICLE.mid500.split('')) : ARTICLE.mid500.split('');
        currentWords = currentOriginWords.slice(0, Number(perCount)).join('');
        break;
      case 'tail500':
        currentOriginWords = isShuffle ? shuffle(ARTICLE.tail500.split('')) : ARTICLE.tail500.split('');
        currentWords = currentOriginWords.slice(0, Number(perCount)).join('');
        break;
      default:
        break;
    }

    option.article = article;
    option.isShuffle = isShuffle;
    option.count = perCount;
    let originTol = currentOriginWords.length / option.count;
    let tempTol = Math.floor(originTol);
    option.chapterTotal = originTol > tempTol ? tempTol + 1 : tempTol;

    this.reset();
    this.updateInfo();
  }

  // 对比上屏字
  compare(){
    correctWordsCount = 0;
    let typedWords = pad.value;
    let arrayOrigin = currentWords.split('');
    let arrayTyped = typedWords.split('');
    let html = '';
    let lastCharacterIsCorrect = false; // 上一个字符是正确的
    let wordsCorrect = '';
    let wordsWrong = '';
    /**
     * 对与错的词成块化，
     * 如果上一个字跟当前字的对错一致，追加该字到对应字符串，
     * 如果不是，输出相反字符串
     */
    arrayTyped.forEach( (current, index) => {
      let origin = arrayOrigin[index];
      origin = origin ? origin : ' ';
      let currentCharacterIsCorrect = current === origin;
      if (currentCharacterIsCorrect){
        correctWordsCount ++;
        wordsCorrect = wordsCorrect.concat(origin);
      } else {
        wordsWrong = wordsWrong.concat(origin);
      }
      if (wordsCorrect && !lastCharacterIsCorrect && index){
        html = html.concat(`<span class="wrong">${wordsWrong}</span>`);
        wordsWrong = '';
      } else if (wordsWrong && lastCharacterIsCorrect && index) {
        html = html.concat(`<span class="correct">${wordsCorrect}</span>`);
        wordsCorrect = '';
      }
      if ((index + 1) === typedWords.length) {
        if (wordsCorrect) {
          html = html.concat(`<span class="correct">${wordsCorrect}</span>`);
        } else {
          html = html.concat(`<span class="wrong">${wordsWrong}</span>`);
        }
      }
      lastCharacterIsCorrect = current === origin;
    })
    let untypedString = currentWords.substring(arrayTyped.length)
    html = html.concat(untypedString)
    template.innerHTML = html;
  }

  // 更新时间
  showTime(){
    if (this.isStarted){
      let secondAll = this.duration / 1000;
      let minute = Math.floor(secondAll / 60);
      let second = Math.floor(secondAll % 60);
      $('.minute').innerText = minute >= 10? minute : `0${minute}`;
      $('.second').innerText = second >= 10? second : `0${second}`;
    } else {
      $('.minute').innerText = '00';
      $('.second').innerText = '00';
    }
  }

  // 暂停
  pause(){
    this.isPaused = true;
    this.stopRefresh()
  }

  // 继续
  resume(){
    this.timeStart = (new Date()).getTime() - this.duration;
    this.isPaused = false;
    this.startRefresh();

  }

  // 乱序当前段
  wordsShuffle() {
    let array = currentWords.split('');
    currentWords = shuffle(array).join('');
    template.innerText = currentWords;
    engine.reset();
    this.isFinished = false;
    this.updateInfo();
  }

  // 重置计数器
  reset(){
    template.innerHTML = currentWords;
    this.isPaused = false;
    this.isStarted = false;
    this.isFinished = false;
    pad.value = '';
    count.init();
    this.updateInfo();
    this.stopRefresh();
    this.showTime();
  }

  // 当前段打完
  finish(){
    this.isStarted = false;
    this.isFinished = true;
    this.stopRefresh();
    this.timeEnd = (new Date()).getTime();
    this.updateInfo();
  }

  // 更新界面信息
  updateInfo() {
    // key count
    for (let type in count){
      $(`.word-${type} p`).innerText = count[type];
    }
    $('.count-total').innerText = currentWords.length;
    $('.count-current').innerText = pad.value.length ? pad.value.length : '--';

    // speed
    if (!engine.isStarted && !engine.isFinished) {
      $('.speed').innerText = '--';
      $('.count-key-rate').innerText = '--';
    } else {
      let speed = (correctWordsCount / engine.duration * 1000 * 60).toFixed(2);
      $('.speed').innerText = speed;

      let keyCount = count.all - count.function;
      let keyRate = (keyCount / engine.duration * 1000).toFixed(2);
      $('.count-key-rate').innerText = keyRate;

      let keyLength = (keyCount / currentWords.length).toFixed(2);
      $('.count-key-length').innerText = keyLength;
    }
    // option
    $('.chapter-current').innerText = option.chapter;
    $('.chapter-total').innerText = option.chapterTotal;
  }
}



// 默认文章
const ARTICLE = {
  top500: '的一是了不在有个人这上中大为来我到出要以时和地们得可下对生也子就过能他会多发说而于自之用年行家方后作成开面事好小心前所道法如进着同经分定都然与本还其当起动已两点从问里主实天高去现长此三将无国全文理明日些看只公等十意正外想间把情者没重相那向知因样学应又手但信关使种见力名二处门并口么先位头回话很再由身入内第平被给次别几月真立新通少机打水果最部何安接报声才体今合性西你放表目加常做己老四件解路更走比总金管光工结提任东原便美及教难世至气神山数利书代直色场变记张必受交非服化求风度太万各算边王什快许连五活思该步海指物则女或完马强言条特命感清带认保望转传儿制干计民白住字它义车像反象题却流且即深近形取往系量论告息让决未花收满每华业南觉电空眼听远师元请容她军士百办语期北林识半夫客战院城候单音台死视领失司亲始极双令改功程爱德复切随李员离轻观青足落叫根怎持精送众影八首包准兴红达早尽故房引火站似找备调断设格消拉照布友整术石展紧据终周式举飞片虽易运笑云建谈界务写钱商乐推注越千微若约英集示呢待坐议乎留称品志黑存六造低江念产刻节尔吃势依图共曾响底装具喜严九况跟罗须显热病证刚治绝群市阳确究久除闻答段官政类黄武七支费父统',
  mid500: '查般斯倒突号树拿克初广奇愿欢希母香破谁致线急古既句京甚仍晚争游龙余护另器细木权星哪苦孩试朝阿队居害独讲错局男差参社换选止际假汉够诉资密案史较环投静宝专修室区料帮衣竟模脸善兵考规联团冷玉施派纪采历顾春责夜画惊银负续吗简章左块索酒值态按陈河巴冲阵境助角户乱呼灵脚继楼景怕停铁异谢否伤兰置医良承福科属围需退基右速适药怀击买素背岁土忙充排价质遇端列印贵疑露哥杀标招血礼弟亮齐穿脑委州某顺省讨尚维板散项状追笔副层沙养读习永草胡济执察归富座雨堂威忽苏船罪敢妇村著食导免温莫掌激慢托胜险寻守波雷沉秀职验靠楚略族藏丽渐刘仅肯担扬盘唐钟级毛营坚松皮供店饭范哈赶吧雪斗效临农味恶烟园烈配杂短卫跳孙曲封抓移顿律卖艺旧朋救防脱翻划迎痛校窗宣乡杨叶警限湖软掉财词压挥超屋秋跑忘馆暗班党宗坏技困登姐预耳席梦朱组旁份禁套亚益探康增诗戏伯晓含劳恩顶君庄谓付田毕纸研虚怪宁替犯灯优您姓例丝盖误架幸隐股毒娘占智佛床米凡介征彩演射祖欲束获舞圣伙梅普借私源镇睡缓升纳织歌宫概野醒夏互积街牌休摇洋败监骨批兄刀网率庭熟创访硬仁菜丁绿牛避阴拍雄秘缺卷姑尼油恐玩释遍握球降虑荣策肉妈迷检伸欧攻练育危厅啊睛摆茶勇判材抱亦妻吸喝趣嘴逐操午吉浪轮默毫冰珠',
  tail500: '鼓阶孔徐固偏陆诸遗爷述帝闭补编巨透弄尤鲁拥录吴墙货弱敌挑宽迹抽忍折输稳皇桌献蒙纷麻洗评挂童尊舍唯博剧乃混弹附迟敬杯鱼控塞剑厚佳测训牙洞淡盛县芳雅革款横累择乘刺载猛逃构赵杜庆途奔虎巧抗针徒圆闪谷绍聚额健诚鲜泪闲均序震仿缘戴婚篇亡奶忠烦赛闹协杰残懂丹柳妹映桥叹愈旅授享暴偷蓝氏寒宜弃丰延辈抢颜赞典冒眉烧厂唱径库川辞伴怒型纯贝票隔穷拜审伦悲柔启减页纵扫伟迫振瑞丈梁洲枪央触予孤缩洛损促番罢宋奋销幕犹锁珍抬陪妙摸峰劲镜沈夺昨哭讯貌谋泰侧贫扶阻贴申岸彼赏版抵泽插迅凭伊潮咱仙符宇肩尝递燕洁拒郎凝净遭仪薄卡末勒乌森诺呀壮忧沿惯丢季企壁惜婆袋朗零辛忆努舒枝凤灭韩胆灰旦孟陷俗绕疾瞧洪甲帐糊泛皆碰吹码奉箱倾胸堆狂仲圈冬餐厉腿尖括佩鬼欣垂跃港骗融撞塔紫荡敏郑赖滑允鸟课暂瓦祥染滚浮粗刑辆狗扑稍秦扎魂岛腾臣琴悉络摩措域冠竹殊豪呆萨旋喊寄悄倍祝剩督旗返召彻宾甘吐乔腰拔幅违详臂尺饮颗涉逼竞培惠亏叔伏唤鸡邻池怨奥侯骑漫拖俊尾恨贯凌兼询碎晨罚铺浓伍宿泉井繁粉绪筑恢匹尘辉魔仰董描距盗渡勤劝莲坦搭挺踪幽截荒恰慧邦颇焦醉废掩签丧灾鼻侵陶肃裁俱磨析奖匆瓶泥拾凉麦钢涌潜隆津搞蛋奈扰耐傅锦播墨偶捕惑飘屈鸣挤毁斜啦污赤慰饰锋覆汤寿跨羊航'
}

const template = $('.template p');
const templateBoard = $('.template');
const pad = $('#pad');
let count = new Count();
let engine = new Engine();
let option = new Option();
let correctWordsCount = 0;
let currentWords = '';
let currentOriginWords = [];


// 初始化
window.onload = () => {
  // init
  engine.changeArticle();
  template.innerText = currentWords;
  engine.updateInfo();

  pad.onblur = () => {
    if (engine.isStarted && !engine.isPaused){
      engine.pause();
    }
  }

  pad.onfocus = () => {
    if (engine.isStarted && engine.isPaused){
      engine.resume();
    }
  }

  // 按键过滤器
  /****
   **** ⌘ + R: 重打当前段
   **** ⌘ + L: 打乱当前段
   **** ⌘ + N: 下一段
   **** ⌘ + P: 上一段
   **** ⌘ + H: 重新开始
   ****/
  pad.onkeydown = (e) => {
    if (e.key === 'Tab' || ((e.metaKey||e.ctrlKey) && (/[qewfgyplt]/.test(e.key))))
    {
      e.preventDefault();
    } else if ((e.metaKey||e.ctrlKey) && e.key === 'r') {
      e.preventDefault();
      engine.reset();
    } else if ((e.metaKey||e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      engine.wordsShuffle();
    } else if ((e.metaKey||e.ctrlKey) && e.key === 'u') {
      engine.prevChapter();
      e.preventDefault();
    } else if ((e.metaKey||e.ctrlKey) && e.key === 'j') {
      engine.nextChapter();
      e.preventDefault();
    } else if (REG.az.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey && !engine.isStarted && !engine.isFinished){
      engine.start()
    }
  }

  pad.onkeyup = (e) => {
    e.preventDefault();
    if (!engine.isFinished){
      countKeys(e);
      engine.compare();
      // 末字时结束的时候
      if (pad.value.length >= currentWords.length){
        if (pad.value === currentWords) {
          engine.finish();
        }
      }
    }
  }
}

// Count Key
function countKeys(e) {
  for (let type in count){
    if ( typeof(count[type]) !== 'function' ){
      if (REG[type].test(e.key)){
        count[type]++
      }
    }
  }
  $('.count-key-backspace').innerText = count.backspace;
}


/**
 * LIB
 * @param selector
 * @return {*}
 */

function $(selector){
  return document.querySelector(selector)
}


/**
 * 数组乱序算法
 * @param arr
 * @return {*}
 */
function shuffle(arr) {
  let length = arr.length,
    r = length,
    rand = 0;

  while (r) {
    rand = Math.floor(Math.random() * r--);
    [arr[r], arr[rand]] = [arr[rand], arr[r]];
  }
  return arr;
}

function show(msg) {
  console.log(msg)
}
