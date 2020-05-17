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
  init (){
    this.az = 0;
    this.number = 0;
    this.ctrl = 0;
    this.shift = 0;
    this.meta = 0;
    this.alt = 0;
    this.function = 0;
    this.backspace = 0;
    this.space = 0;
  }
}

// Articles
const ARTICLE = {
  before500: '的一是了不在有个人这上中大为来我到出要以时和地们得可下对生也子就过能他会多发说而于自之用年行家方后作成开面事好小心前所道法如进着同经分定都然与本还其当起动已两点从问里主实天高去现长此三将无国全文理明日些看只公等十意正外想间把情者没重相那向知因样学应又手但信关使种见力名二处门并口么先位头回话很再由身入内第平被给次别几月真立新通少机打水果最部何安接报声才体今合性西你放表目加常做己老四件解路更走比总金管 光工结提任东原便美及教难世至气神山数利书代直色场变记张必受交非服化求风度太万各算边王什快许连五活思该 步海指物则女或完马强言条特命感清带认保望转传儿制干计民白住字它义车像反象题却流且即深近形取往系量论告 息让决未花收满每华业南觉电空眼听远师元请容她军士百办语期北林识半夫客战院城候单音台死视领失司亲始极双 令改功程爱德复切随李员离轻观青足落叫根怎持精送众影八首包准兴红达早尽故房引火站似找备调断设格消拉照布 友整术石展紧据终周式举飞片虽易运笑云建谈界务写钱商乐推注越千微若约英集示呢待坐议乎留称品志黑存六造低 江念产刻节尔吃势依图共曾响底装具喜严九况跟罗须显热病证刚治绝群市阳确究久除闻答段官政类黄武七支费父统',
}

const comparison = $('.comparison p');
const pad = $('#pad');
let count = new Count();


window.onload = () => {
  comparison.innerText = ARTICLE.before500;

  // keypressed
  pad.onkeydown = (e) => {
    console.log(e)
    if (e.key === 'Tab' || (e.metaKey && e.key === 'r')) {
      e.preventDefault();
    }
    countKeys(e);
  }

  pad.oninput = () => {
    console.log(pad.value)
  }
}



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


function resetCount() {
  pad.value = ''
  count.init();
  updateInfo()
}

// Update infos
function updateInfo() {
  for (let type in count){
    $(`.word-${type} p`).innerText = count[type];
  }
}



/**
 * LIB
 * @param selector
 * @return {*}
 */

function $(selector){
  return document.querySelector(selector)
}