// REG
const REG = {
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
  az = 0;
  number = 0;
  ctrl = 0;
  shift = 0;
  meta = 0;
  alt = 0;
  function = 0;
  space = 0;
  backspace = 0;
  semicolon = 0;
  quot = 0;
  init (){
    for (let name in this) {
      this[name] = 0;
    }
  }
}

class Engine {
  isStarted = false;
  isPaused = false;
  timeStart; //ms
  timeEnd; // ms
  duration; // ms
  handleRefresh;
  refreshRate = 1000; // ms

  start(){
    this.isStarted = true;
    this.timeStart = (new Date()).getTime();
    this.startRefresh();
  }
  end(){

  }
  startRefresh(){
    this.handleRefresh = setInterval(()=>{
      show(this.duration);
      let timeNow = (new Date()).getTime()
      this.duration = timeNow - this.timeStart;
      this.showTime();
    }, this.refreshRate)
  }
  stopRefresh(){
    clearInterval(this.handleRefresh);
  }

  compare(){
    let typedWords = pad.value;
    let arrayOrigin = currentWords.split('');
    let arrayTyped = typedWords.split('');
    let html = '';
    let lastCharacterIsCorrect = false; // 上一个字符是正确的
    let wordsCorrect = '';
    let wordsWrong = '';
    arrayTyped.forEach( (current, index) => {
      let origin = arrayOrigin[index];
      let currentCharacterIsCorrect = current === origin;
      if (currentCharacterIsCorrect){
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

  countSpeed(){

  }
  showTime(){
    if (this.isStarted){
      let secondAll = this.duration / 1000;
      let minute = Math.floor(secondAll / 60);
      let second = Math.floor(secondAll % 60);
      $('.minute').innerText = minute >= 10? minute : `0${minute}`;
      $('.second').innerText = second >= 10? second : `0${second}`;
    } else {
      $('.minute').innerText = '--';
      $('.second').innerText = '--';
    }
  }

  pause(){
    this.isPaused = true;
    this.stopRefresh()
  }
  resume(){
    this.timeStart = (new Date()).getTime() - this.duration;
    this.isPaused = false;
    this.startRefresh();

  }
  reset(){
    this.isPaused = false;
    this.isStarted = false;
    pad.value = '';
    count.init();
    updateInfo();
    this.stopRefresh();
    this.showTime();
  }
  finish(){

  }
}


const Before500 = '的一是了不在有个人这上中大为来我到出要以时和地们得可下对生也子就过能他会多发说而于自之用年行家方后作成开面事好小心前所道法如进着同经分定都然与本还其当起动已两点从问里主实天高去现长此三将无国全文理明日些看只公等十意正外想间把情者没重相那向知因样学应又手但信关使种见力名二处门并口么先位头回话很再由身入内第平被给次别几月真立新通少机打水果最部何安接报声才体今合性西你放表目加常做己老四件解路更走比总金管光工结提任东原便美及教难世至气神山数利书代直色场变记张必受交非服化求风度太万各算边王什快许连五活思该步海指物则女或完马强言条特命感清带认保望转传儿制干计民白住字它义车像反象题却流且即深近形取往系量论告息让决未花收满每华业南觉电空眼听远师元请容她军士百办语期北林识半夫客战院城候单音台死视领失司亲始极双令改功程爱德复切随李员离轻观青足落叫根怎持精送众影八首包准兴红达早尽故房引火站似找备调断设格消拉照布友整术石展紧据终周式举飞片虽易运笑云建谈界务写钱商乐推注越千微若约英集示呢待坐议乎留称品志黑存六造低江念产刻节尔吃势依图共曾响底装具喜严九况跟罗须显热病证刚治绝群市阳确究久除闻答段官政类黄武七支费父统';

// Articles
const ARTICLE = {
  common15: shuffle(Before500.split('')).slice(0,15).join('')
}

const template = $('.template p');
const pad = $('#pad');
let count = new Count();
let engine = new Engine();
let currentWords = ARTICLE.common15;

window.onload = () => {
  // init
  template.innerText = currentWords;
  updateInfo();

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

  // key pressed
  pad.onkeydown = (e) => {
    if (e.key === 'Tab' ||
      ((e.metaKey||e.ctrlKey) && e.key === 'r')||
      ((e.metaKey||e.ctrlKey) && e.key === 's'))
    {
      e.preventDefault();
    }
    if (REG.az.test(e.key) && !engine.isStarted){
      engine.start()
    }
  }

  pad.onkeyup = (e) => {
    e.preventDefault();
    countKeys(e);
    engine.compare();
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
  updateInfo()
}



// Update infos
function updateInfo() {
  for (let type in count){
    $(`.word-${type} p`).innerText = count[type];
  }
  $('.count-total').innerText = currentWords.length;
  $('.count-current').innerText = pad.value.length;
}



function shuffleWords() {
  let array = currentWords.split('');
  currentWords = shuffle(array).join('');
  template.innerText = currentWords;
  engine.reset();
  updateInfo();
}




/*
let app = new Vue({
  el: '#app',
  data: {
    currentWords: ''
  },
  mounted: function () {
    this.currentWords = ARTICLE.before500
  },
  watch: {

  },
  methods: {
    shuffleWords: function () {

    }
  }
})*/


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
