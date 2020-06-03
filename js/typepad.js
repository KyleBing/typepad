/**
 * Author: KyleBing(kylebing@163.com)
 *
 * Count 所有按键记录
 * Config 用户配置，字数、乱序与否
 * Engine 主程序，开始、结束、暂停
 * Record 每段的打字数据记录
 * Database IndexedDB 相关操作
 *
 */

const localStorageIndexName = 'type_pad_idb_index';
const untypedStringClassName = 'untyped-part';
const HEIGHT_TEMPLATE = 150; // 对照区高度

const REG = {
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
const ArticleType = {
  character: 'character',
  article: 'article',
  english: 'english',
  word: 'word',
  getTypeNameWith(type){
    switch (type) {
      case this.article    : return '文章';
      case this.english    : return '英文';
      case this.character  : return '单字';
      case this.word       : return '单词';
      default:break;
    }
  }
}
// 默认文章
const ARTICLE = {
  top500: {
    name: '常用前500',
    value: 'top-500',
    type: ArticleType.character,
    content: '的一是了不在有个人这上中大为来我到出要以时和地们得可下对生也子就过能他会多发说而于自之用年行家方后作成开面事好小心前所道法如进着同经分定都然与本还其当起动已两点从问里主实天高去现长此三将无国全文理明日些看只公等十意正外想间把情者没重相那向知因样学应又手但信关使种见力名二处门并口么先位头回话很再由身入内第平被给次别几月真立新通少机打水果最部何安接报声才体今合性西你放表目加常做己老四件解路更走比总金管光工结提任东原便美及教难世至气神山数利书代直色场变记张必受交非服化求风度太万各算边王什快许连五活思该步海指物则女或完马强言条特命感清带认保望转传儿制干计民白住字它义车像反象题却流且即深近形取往系量论告息让决未花收满每华业南觉电空眼听远师元请容她军士百办语期北林识半夫客战院城候单音台死视领失司亲始极双令改功程爱德复切随李员离轻观青足落叫根怎持精送众影八首包准兴红达早尽故房引火站似找备调断设格消拉照布友整术石展紧据终周式举飞片虽易运笑云建谈界务写钱商乐推注越千微若约英集示呢待坐议乎留称品志黑存六造低江念产刻节尔吃势依图共曾响底装具喜严九况跟罗须显热病证刚治绝群市阳确究久除闻答段官政类黄武七支费父统'
  },
  mid500: {
    name: '常用中500',
    value: 'mid-500',
    type: ArticleType.character,
    content: '查般斯倒突号树拿克初广奇愿欢希母香破谁致线急古既句京甚仍晚争游龙余护另器细木权星哪苦孩试朝阿队居害独讲错局男差参社换选止际假汉够诉资密案史较环投静宝专修室区料帮衣竟模脸善兵考规联团冷玉施派纪采历顾春责夜画惊银负续吗简章左块索酒值态按陈河巴冲阵境助角户乱呼灵脚继楼景怕停铁异谢否伤兰置医良承福科属围需退基右速适药怀击买素背岁土忙充排价质遇端列印贵疑露哥杀标招血礼弟亮齐穿脑委州某顺省讨尚维板散项状追笔副层沙养读习永草胡济执察归富座雨堂威忽苏船罪敢妇村著食导免温莫掌激慢托胜险寻守波雷沉秀职验靠楚略族藏丽渐刘仅肯担扬盘唐钟级毛营坚松皮供店饭范哈赶吧雪斗效临农味恶烟园烈配杂短卫跳孙曲封抓移顿律卖艺旧朋救防脱翻划迎痛校窗宣乡杨叶警限湖软掉财词压挥超屋秋跑忘馆暗班党宗坏技困登姐预耳席梦朱组旁份禁套亚益探康增诗戏伯晓含劳恩顶君庄谓付田毕纸研虚怪宁替犯灯优您姓例丝盖误架幸隐股毒娘占智佛床米凡介征彩演射祖欲束获舞圣伙梅普借私源镇睡缓升纳织歌宫概野醒夏互积街牌休摇洋败监骨批兄刀网率庭熟创访硬仁菜丁绿牛避阴拍雄秘缺卷姑尼油恐玩释遍握球降虑荣策肉妈迷检伸欧攻练育危厅啊睛摆茶勇判材抱亦妻吸喝趣嘴逐操午吉浪轮默毫冰珠'
  },
  tail500: {
    name: '常用后500',
    value: 'tail-500',
    type: ArticleType.character,
    content: '鼓阶孔徐固偏陆诸遗爷述帝闭补编巨透弄尤鲁拥录吴墙货弱敌挑宽迹抽忍折输稳皇桌献蒙纷麻洗评挂童尊舍唯博剧乃混弹附迟敬杯鱼控塞剑厚佳测训牙洞淡盛县芳雅革款横累择乘刺载猛逃构赵杜庆途奔虎巧抗针徒圆闪谷绍聚额健诚鲜泪闲均序震仿缘戴婚篇亡奶忠烦赛闹协杰残懂丹柳妹映桥叹愈旅授享暴偷蓝氏寒宜弃丰延辈抢颜赞典冒眉烧厂唱径库川辞伴怒型纯贝票隔穷拜审伦悲柔启减页纵扫伟迫振瑞丈梁洲枪央触予孤缩洛损促番罢宋奋销幕犹锁珍抬陪妙摸峰劲镜沈夺昨哭讯貌谋泰侧贫扶阻贴申岸彼赏版抵泽插迅凭伊潮咱仙符宇肩尝递燕洁拒郎凝净遭仪薄卡末勒乌森诺呀壮忧沿惯丢季企壁惜婆袋朗零辛忆努舒枝凤灭韩胆灰旦孟陷俗绕疾瞧洪甲帐糊泛皆碰吹码奉箱倾胸堆狂仲圈冬餐厉腿尖括佩鬼欣垂跃港骗融撞塔紫荡敏郑赖滑允鸟课暂瓦祥染滚浮粗刑辆狗扑稍秦扎魂岛腾臣琴悉络摩措域冠竹殊豪呆萨旋喊寄悄倍祝剩督旗返召彻宾甘吐乔腰拔幅违详臂尺饮颗涉逼竞培惠亏叔伏唤鸡邻池怨奥侯骑漫拖俊尾恨贯凌兼询碎晨罚铺浓伍宿泉井繁粉绪筑恢匹尘辉魔仰董描距盗渡勤劝莲坦搭挺踪幽截荒恰慧邦颇焦醉废掩签丧灾鼻侵陶肃裁俱磨析奖匆瓶泥拾凉麦钢涌潜隆津搞蛋奈扰耐傅锦播墨偶捕惑飘屈鸣挤毁斜啦污赤慰饰锋覆汤寿跨羊航'
  },
  loveYourLife: {
    name: 'Love your life',
    value: 'love-your-life',
    type: ArticleType.english,
    content: 'However mean your life is, meet it and live it; do not shun it and call it hardnames. It is not so bad as you suppose. It looks poorest when you are richest. The faultfinder will find faults in paradise. Love your life, poor as it is. You may perhaps have some pleasant, thrilling, glorious hours, even in a poorhouse. The setting sun is reflected from the windows of the almshouse as brightly as from the rich man\'s abode; the snow melts before its door as early in the spring. I do not see but a quiet mind may live as contentedly there, and have as cheering thoughts, as in a palace. The town\'s poor seem to me often to live the most independent lives of any. May be they are simply great enough to receive without misgiving. Most think that they are above being supported by the town; but it often happens that they are not above supporting themselves by dishonest means. which should be more disreputable. Cultivate poverty like a garden herb, like sage. Do not trouble yourself much to get new things, whether clothes or friends, Turn the old, return to them. Things do not change; we change. Sell your clothes and keep your thoughts.'
  },
  classicSentences: {
    name: 'Classic sentences',
    value: 'classic-sentences',
    type: ArticleType.english,
    content: "Love your parents. We are too busy growing up yet we forget that they are already growing old. The moment you think about giving up, think of the reason why you held on so long. I don't wanna be your 'number one' that implies there are a number two and maybe a number three. I want to be your only one. Total umbrella for someone else if he, you're just not for him in the rain. Hold my hand, you won't get lost even with eyes closed. We never really grow up. We only learn how to act in public. Each trauma, is another kind of maturity. Fortune favours the brave. You keep on concentrating on the things you wish you had or things you wish you didn't have and you sort of forget what you do have. Never put your happiness in someone else's hands. Sometimes you have to give up on someone in order to respect yourself. There is a time in life that is full of uneasiness. We have no other choice but to face it. Being single means you're strong and patient enough to wait for someone who deserves your worth. The more you care, the more you have to lose. One of the best things in life is seeing a smile on a person's face and knowing that you put it there. No matter how bad your life may seem in the moment, it will always get betterSometimes, it is better to turn around and leave than to insist on and pretend to be well. Patience with family is love, Patience with others is respect, Patience with self is confidence. Sometimes, the most painful not lose, but get later not happy. For those things I don't talk about, it does not mean I don't know. We both have no idea if we are gonna be together in the end. But one thing's for sure that I'll do everything I can to make it happen."
  },
  cheerUp: {
    name: 'Cheer up',
    value: 'cheer-up',
    type: ArticleType.english,
    content: "That you going to have some ups and you're going to have some downs. Most people gave up on themselves easily. You know that a human spirit is powerful? There is nothing as powerful - its hard to kill the human spirit! Anybody can feel good when they have their health, they bills are paid, they have happy relationships. Anybody can be positive then, anybody can have a large of vision then. Anybody can have a lot of faith under those kind of circumstances. The real challenge of growth, mentally, emotionally and spiritually. Comes when you get knocked down. It takes courage to act. Part of being hungry when you've been defeated. It takes courage to start over again. Fear kills dream. Fear kills hope. Fear put people in the hospital. Fear can age you. Can hold you back from doing something that you know within yourself that you are capable of doing, but it will paralyzed you. At the end of your feelings is nothing, but at the end of every principles is a promise. Behind your little feelings, it might not be absolutely nothing at the end of your little feelings. But behind every principles is a promise. And some of you in your life. The reason why you are not in your goal right now, because you just all about your feelings. All on your feelings, you don't feel like waking up, so who does? Everyday you say 'no' to your dreams, you might be pushing your dreams back a whole six months, a whole year! That one single day, that one day you didn't get up could have pushed your stuff back I don't know how long. Don't allow your emotion to control you. We are emotional but we wanna begin to discipline your emotion. If you don't discipline and contain your emotion, they will use you. You want it and you're going to go all out to have it. Its not going to be easy, when you want to change. Its not easy. If it were in fact easy, everybody would do it. But if you're serious, you'll go all out. I'm in control here. I'm not going to let this get me down, I'm not going to let this destroy me! I'm coming back! And I'll be stronger and better because of it. You have got to make a declaration. That this is what you stand for. You standing up for your dream. You standing up for piece of mind. You standing up for health. Take full responsibility for your life. Accepts where you are and the responsibility that you're going to take yourself where you want to go. You can decide that I am going to live each day as if it were my last. Live your life with passion. With some drive. Decide that you are going to push yourself. The last chapter to your life has not been written yet. And it doesn't matter about what happened yesterday. It doesn't matter about what happened to you, what matter is. What are you going to do about it? This year I will make this goal become a reality. I wont talk about it anymore. I Can, I Can! I CAN! To persevere I think its important for everybody. Don't give up, don't give in. There's always an answer to everything."
  },
  steveJobs: {
    name: 'Steve Jobs\' speech',
    value: 'Steve-Jobs\'-speech',
    type: ArticleType.english,
    content: "So you have to trust that the dots will somehow connect in your future. You have to trust in something. Your gut, destiny, life, karma, whatever. Because believing that the dots will connect down the road. Will give you the confidence to follow your heart, even when it leads you off the well worn path. And that will make all the difference. Your time is limited, so don't waste it living someone else's life. Don't be trapped by dogma: Which is living with the results of other people's thinking. Don't let the noise of other opinions drown out your own inner voices. You've got to find what you love. And that is true for works, as its for your lovers. Your work is gonna fill a large part of your life. And the only way to be truly satisfied. Is to do what you believe is great work. And the only way to do a great work. Is to love what you do. If you haven't found it yet. Keep looking and don't settle. Have the courage to follow your heart and intuition. There somehow, already know. What you truly want to become."
  },
  CET4: {
    name: 'CET 4',
    value: 'CET4',
    type: ArticleType.word,
    content: "sincere\t真诚的\t\tmood\t情绪\t\tstatic\t稳定的\t\tsenator\t议员\t\thobby\t兴趣\t\tlad\t小伙子\t\tequip\t装备\t\tfrown\t蹙眉\t\tfasten\t紧抓\t\tsoftware\t软件\t\tstir\t搅拌\t\tdistribution\t分配\t\tflexible\t可调节的\t\tsolution\t解决办法\t\tpanel\t平板\t\tministry\t部门\t\tsupreme\t最高的\t\tdescribe\t描述\t\tlimb\t细枝\t\tcircumstance\t环境\t\tcore\t核心\t\tassistant\t助手\t\tmess\t乱\t\tminus\t减去\t\tstatistic\t统计数据\t\tpregnant\t孕妇\t\tsector\t部门\t\tdetection\t侦查\t\tstatue\t雕像\t\tbride\t新娘\t\tcycle\t自行车\t\tsaucer\t酱汁\t\tskillful\t娴熟的\t\tcivilization\t文明\t\toverhead\t在头上，经费\t\tclash\t碰\t\tgrant\t授予\t\tbond\t绑\t\tstaff\t人员\t\tintermediate\t中部的\t\tguitar\t吉他\t\tcomprehensive\t综合的\t\tpresence\t出席\t\tappliance\t器械\t\tcushion\t垫子\t\temergency\t紧急情况\t\tsolve\t解决\t\tlabel\t标签\t\tslim\t瘦的\t\tstatus\t地位\t\tsteady\t平稳的\t\tinclude\t包括\t\tresistance\t阻力\t\tprime\t主要的\t\tambassador\t大使\t\tderive\t起源\t\tsponsor\t启动者，资助者\t\tproportion\t比例\t\tmental\t金属\t\tpunch\t打\t\tresult\t导致\t\tclient\t顾客\t\tsteamer\t蒸汽轮船\t\toption\t选择\t\tdormitory\t寝室\t\tattitude\t态度\t\tsteep\t陡的\t\tagency\t部\t\tsteer\t掌舵\t\tscandal\t丑闻\t\tdefinite\t当然的\t\tcautious\t当心的\t\tprayer\t祈祷\t\tnest\t巢\t\tdomestic\t本国的\t\tchest\t箱子\t\tairline\t飞机\t\trebel\t反叛\t\tsatisfactory\t令人满意的\t\tstem\t主干\t\trender\t给予\t\tobject\t反对\t\tgardener\t园丁\t\tshrink\t皱缩\t\tparade\t接受检阅，游行\t\trumour\t流言\t\trug\t小地毯\t\testablish\t建立\t\tprimarily\t主要地\t\tkindness\t好意\t\tbreast\t胸脯\t\tsticky\t黏的\t\tboost\t激发，促进\t\tfund\t基金\t\tincredible\t难以置信的\t\tabroad\t到国外\t\tdetective\t侦探\t\tstiff\t僵硬的\t\tstimulate\t激发\t\tfame\t名望\t\tconsume\t消费，消化\t\taccelerate\t加速\t\tlightning\t闪电\t\tsting\t叮，刺\t\tbound\t划界\t\trouse\t唤醒\t\tcultivate\t培养\t\tmaterial\t材料\t\tpersonnel\t人员\t\tdisplay\t播放\t\tparticle\t粒子\t\tfrog\t青蛙\t\timpression\t深刻印象\t\tbiology\t生物\t\tdrunk\t醉的\t\tbarrier\t障碍，栅栏\t\tstock\t存货\t\tfisherman\t渔夫\t\tpolitician\t政客\t\troyal\t王室的\t\tbarber\t理发师\t\tstocking\t长袜\t\tdelegate\t代表\t\thighlight\t突出\t\tdepression\t沮丧\t\tsignature\t签名\t\tatmosphere\t大气\t\tevaluate\t估价\t\trescue\t救援\t\tpersonality\t人格\t\tlatter\t后面的\t\tparliament\t议会\t\tinput\t输入\t\tpartial\t部分的\t\tloyalty\t忠诚\t\tcalendar\t日历，历法\t\toverlook\t忽视\t\tdebate\t争论\t\tstoop\t俯身\t\tcube\t立方体\t\tsubmerge\t沉入\t\tcredit\t信用\t\tsurrounding\t环境\t\tstove\t电炉\t\tsubmit\t屈服\t\tcarrier\t运输工具\t\timply\t暗示\t\tstrain\t拉紧\t\tconsist\t组成\t\tstrap\t捆扎\t\tefficient\t有效率的\t\taccommodation\t住处、膳宿\t\tstrategic\t具有战略意义的\t\tlayer\t层\t\texclaim\t呼喊\t\trepresentative\t具有代表性的\t\tforecast\t预报\t\tdiscipline\t纪律\t\tneutral\t中性的\t\tinterpret\t打断\t\tknot\t结\t\tdesirable\t向往的\t\tpromote\t促进\t\tacceptance\t接受\t\tmayor\t市长\t\tequation\t方程\t\troutine\t管理\t\tripe\t成熟的\t\tprove\t证明\t\tlikewise\t然而\t\tchap\t小伙子\t\texplore\t探险\t\tovernight\t整夜\t\tstrategy\t策略\t\tstraw\t吸管\t\tbind\t捆扎\t\tstream\t溪流\t\tbearing\t风度\t\tsuppose\t假定\t\taccess\t方式，路\t\tremain\t保持\t\tabstract\t抽象\t\tstretch\t延伸\t\tapproximate\t估计\t\tstriking\t显眼的\t\tabuse\t滥用\t\tcritic\t批判\t\tinterpretation\t口译\t\tstring\t弦\t\tillustrate\t图示\t\thelpful\t有帮助的\t\tleak\t裂缝\t\taccountant\t会计\t\tcrude\t粗野的\t\tproduct\t产品\t\tstrip\t脱光\t\tstripe\t条纹\t\tcommunicate\t交流\t\tfollowing\t接下来的\t\thedge\t篱笆\t\tconsumer\t消费者\t\temotional\t情绪化的\t\tcraft\t工艺\t\tinstitute\t协会\t\tindispensable\t不可缺少的\t\tscheme\t计划\t\tscale\t比例\t\treplace\t代替\t\tbark\t吠叫\t\tgramme\t克\t\tcongress\t国会\t\tbump\t碰撞\t\tstroke\t划水，中风\t\tingredient\t成分\t\tarbitrary\t专制的，武断的\t\tpinch\t撮\t\texploit\t开发\t\taction\t行动\t\tash\t灰\t\trope\t绳\t\tbulk\t大宗货物\t\tstrengthen\t巩固\t\tindependent\t独立的\t\tboard\t去国外\t\trecall\t回忆起\t\tstudio\t工作室\t\tgrave\t坟墓\t\teve\t前夜\t\tformal\t正式的\t\tabsorb\t吸收\t\tsensitive\t敏感的\t\tability\t能力\t\tfairy\t小仙子\t\ttalent\t天赋\t\tcomparison\t比较\t\tstuff\t填\t\tbrow\t眉毛\t\tinfer\t推断\t\tinvasion\t侵略\t\tgrand\t极好的\t\tstress\t压力\t\tjournalist\t记者\t\tsupply\t供给\t\tpenetrate\t刺入\t\tsubject\t主题\t\tpole\t极\t\traw\t原始的\t\tembassy\t大使馆\t\tcarpenter\t木匠\t\tappropriate\t恰当的\t\tsocialist\t社会学家\t\tprotein\t潜在的\t\tenlarge\t扩充\t\tinherit\t继承\t\tchemist\t化学家\t\tconflict\t冲突\t\tdrain\t排水\t\tarchitecture\t建筑学\t\tcharity\t慈善机构\t\tentitle\t赋予，命名\t\tsubsequent\t之后的\t\tspan\t延长\t\tpea\t豌豆\t\tinstruct\t命令，教\t\tspite\t恶意\t\tslender\t苗条的\t\tautomobile\t机车\t\tbehavior\t行为\t\tenvy\t羡慕\t\tsubstance\t物质\t\tcontest\t竞赛\t\tspit\t吐\t\tmutual\t互相\t\tdorm\t宿舍\t\tsubstantial\t丰裕的\t\tmeanwhile\t同时\t\tdesire\t渴望\t\tconviction\t确信\t\tinteraction\t互相作用\t\tmenu\t菜单\t\tfrustrate\t使沮丧\t\tbelief\t信仰\t\tconfusion\t疑惑\t\tcivilize\t使开化\t\tpreface\t前言\t\tchemical\t化学的，化学品\t\thorizontal\t水平的\t\tinvitation\t请柬\t\tauto\t汽车\t\telectric\t电的\t\tpurse\t钱包\t\tblank\t空\t\tcourtyard\t院子\t\trural\t乡村的\t\tdiscourage\t使灰心\t\treflection\t反应\t\trainbow\t彩虹\t\tslide\t滑\t\tremoval\t移除\t\tmissing\t失踪的\t\tgraph\t绘图\t\tfortnight\t14天\t\tdisgust\t恶心\t\toffense\t冒犯\t\tallow\t允许\t\tproportional\t成比例的\t\tdevote\t奉献\t\tempire\t王朝\t\tmicrophone\t手机\t\tsubtract\t提取\t\tpace\t步伐\t\tgesture\t手势\t\tloop\t线圈\t\tsheer\t转弯，陡峭的\t\tcupboard\t橱柜\t\tsore\t疼痛\t\traid\t突击检查\t\tlower\t降低\t\tcomment\t评论\t\tdistress\t使沮丧\t\tpublicity\t公众注意力\t\tspin\t旋转\t\tmuseum\t博物馆\t\toutstanding\t杰出的\t\track\t痛苦，折磨\t\trent\t租，裂缝\t\thousing\t住房\t\tcomplain\t抱怨\t\tevidently\t显然\t\tlung\t肺\t\tdeny\t不承认\t\townership\t所有权\t\trid\t使摆脱\t\tharness\t马具\t\tacknowledge\t承认，报偿\t\tpassion\t激情\t\tgenuine\t真诚的\t\timaginary\t想象的\t\tprompt\t准时的\t\tinvention\t发明\t\tlucky\t幸运的\t\tconfidence\t信心\t\tsuburb\t乡村\t\tindustrialize\t工业化\t\tfearful\t害怕的\t\tintelligence\t智力\t\tchildhood\t童年\t\tcrush\t碾压\t\tintention\t意图\t\tfinding\t调查\t\tsubway\t地铁\t\tmagnet\t有磁性的\t\tdefect\t缺点\t\tattribute\t归于\t\trelease\t释放\t\tsuccession\t延续，继承\t\tchip\t碎片\t\tsimilar\t相似的\t\tmaintain\t保持\t\tadvertisement\t广告\t\tprivilege\t优惠\t\tdull\t枯燥的\t\tprovoke\t激起\t\tfunction\t功能\t\tsubstitute\t代替\t\textreme\t极\t\torbit\t环绕，轨道\t\tcorrespondent\t通讯员\t\tfashionable\t时尚的\t\tallowance\t津贴\t\tcomponent\t组分\t\tinterrupt\t口译\t\tsuccessive\t延续的\t\texternal\t外在的\t\tsomehow\t不知怎么地\t\tdeclaration\t声明\t\tdistribute\t分配\t\tspecialist\t专家\t\trotate\t转\t\trod\t棒子\t\tsuck\t吸吮\t\tnegative\t负的，消极的\t\tsuffer\t受苦\t\tsufficient\t充足的\t\tcourt\t庭，法庭\t\tcurl\t鬈\t\tbureau\t处，所，司，部\t\tmoist\t潮湿的\t\trelative\t相关的\t\tsuggestion\t建议\t\trestless\t多动的\t\tdelivery\t分发\t\tclaim\t声明\t\tsuicide\t自杀\t\tdip\t蘸\t\tprofit\t好处\t\tlease\t租契\t\tdisposal\t放，处置\t\tappeal\t呼吁\t\tcart\t马车\t\tstable\t稳定的\t\tmarried\t已婚的\t\treckon\t猜想，估计\t\tpractically\t几乎\t\treception\t招待会\t\tjury\t陪审团\t\tglory\t光荣\t\tmist\t雾\t\tcongratulate\t恭喜\t\tsum\t加和\t\texecute\t执行\t\tessay\t文章\t\troute\t路径\t\tmerit\t优点\t\tlocal\t当地的\t\tcompromise\t折中，妥协\t\trally\t集会\t\tfeather\t羽毛\t\tcharacterize\t以...为特征\t\texplode\t爆炸\t\taware\t知道\t\tgrain\t谷物\t\tkettle\t水壶\t\tsummarize\t总结\t\tfaulty\t错的\t\thighly\t很\t\tsummary\t总结\t\tconservation\t保护\t\tsummit\t巅峰\t\treward\t奖励\t\tavailable\t有提供的\t\tspecialize\t成为专家\t\tstructure\t结构\t\tresident\t抵抗\t\tboundary\t界线\t\tradical\t基本的\t\tleading\t重要的\t\trag\t碎布\t\tprescribe\t开处方\t\tdemonstrate\t描述\t\tmanner\t礼仪\t\tsunrise\t日出\t\tconstruct\t构筑\t\trailway\t铁路\t\topportunity\t机会\t\tlag\t落后\t\tfade\t褪色\t\tsunset\t日落\t\tsingular\t单数的\t\tbroom\t扫帚\t\tbeneath\t在...下面\t\trecreation\t娱乐\t\tprocession\t进程\t\ttackle\t钓具，处理\t\tcombination\t组合\t\thell\t地狱\t\tproof\t证明\t\tresort\t诉诸\t\trecruit\t新征\t\tcontrast\t比较\t\tsunshine\t阳光\t\tintroduction\t说明\t\tancestor\t原型，祖先\t\tsplit\t裂\t\tpainful\t痛苦的\t\tsuperb\t极好的\t\tinterest\t兴趣，利息\t\tnoticeable\t显然的\t\tgraduate\t毕业\t\tglance\t瞥\t\tbloody\t血的\t\tfierce\t猛烈的\t\tparagraph\t段落\t\tenquire\t询问，调查\t\tpreparation\t准备\t\tjustice\t正义，公正\t\tdrip\t滴\t\temit\t发射\t\tsuperficial\t肤浅的\t\trecommendation\t推荐\t\tsole\t底部的，单独的\t\tfolk\t人们\t\trank\t排名\t\tmotor\t马达\t\tairport\t机场\t\tenclose\t随信附上\t\tbounce\t弹\t\toccasion\t情况\t\tdetermine\t决定\t\tadvisable\t明智的\t\tpermission\t允许\t\tstatement\t陈述，声明\t\taward\t奖励\t\tbold\t粗鲁的\t\tso\t-\t\tcalled\t所谓的\t\tsuperior\t高级的\t\tsunlight\t阳光\t\talternative\t二选一的\t\tkingdom\t王国\t\tmobile\t移动的\t\tdamn\t诅咒\t\tstorage\t贮存\t\tsupplement\t补充\t\tlocate\t坐落，位于\t\tcabin\t小木屋\t\tmajority\t主要\t\treceiver\t收信者\t\tsupport\t支持\t\tbible\t圣经\t\tassign\t分配，指派\t\tepisode\t片段\t\tfatal\t致命的\t\tpad\t板\t\texcursion\t散步\t\tignorant\t无知的\t\tcounty\t县\t\tcondense\t压缩\t\theal\t拯救\t\tasset\t财产\t\tinvolve\t包括\t\trear\t饲养\t\thollow\t中空的\t\tcharter\t宪章\t\tleadership\t领导权\t\tshallow\t浅陋的\t\tprocedure\t程序，过程\t\timpressive\t印象深刻的\t\tcontroversial\t有争议的\t\tcurve\t转弯\t\tspiritual\t精神上的\t\tastonish\t震撼\t\tfold\t折叠\t\talert\t警戒\t\tcondition\t情况\t\tsegment\t瓣\t\tcabbage\t卷心菜\t\tcondemn\t谴责\t\tmild\t驯服的，温柔的\t\tsurgery\t外科手术\t\tleisure\t空闲时间\t\taccomplish\t完成\t\tplug\t插头\t\tpresentation\t提供，表演\t\tsurplus\t过剩的\t\tcassette\t盒式磁带\t\tsurround\t环绕\t\tprivate\t私人的\t\tbulb\t电灯泡\t\tmeaning\t意义\t\tannual\t每年的\t\texpansion\t扩张\t\teliminate\t消灭，取消\t\thorn\t号角\t\tresponsibility\t责任\t\tdam\t大坝\t\tchallenge\t挑战\t\talike\t一样的\t\tphenomenon\t现象\t\tsurvey\t调查\t\tcurtain\t窗帘\t\thousehold\t家里的\t\tsurvival\t幸存\t\tmedal\t奖牌\t\tinvest\t投资\t\tsurvive\t幸存\t\tawkward\t尴尬的\t\tsynthetic\t合成的\t\tmanufacture\t制造\t\tcurse\t诅咒\t\tsuspect\t怀疑\t\tsuspend\t悬挂\t\ttide\t潮水\t\tcrossing\t交叉的\t\ttour\t旅行\t\tbarely\t只是\t\tcope\t妥善解决\t\tgap\t沟\t\toppose\t相对\t\tdeadline\t最后期限\t\tautomatic\t自动的\t\tjoint\t接口；连接的\t\tsurrender\t投降\t\trude\t粗鲁的\t\tfaint\t轻微的\t\tconference\t会议\t\tissue\t事物\t\tswallow\t燕子，吞咽\t\tinterior\t内部的\t\tcalculator\t计算器\t\tanalyse\t分析\t\thazard\t危害\t\tmiracle\t奇迹\t\tsway\t摇摆\t\teditorial\t编辑的\t\trecognition\t识别\t\tlibrarian\t图书馆长\t\tanalysis\t分析\t\tkid\t小孩子，逗乐\t\tpartner\t搭档\t\tswear\t发誓\t\tcenter\t中心\t\ttidy\t整洁的\t\tpassport\t护照\t\tswell\t起伏，膨胀\t\tlink\t连接\t\tbrave\t勇敢的，面对\t\tswift\t迅速的\t\tprohibit\t禁止\t\tapprove\t允许\t\tswing\t使摇摆\t\tideal\t理想的\t\tarrest\t逮捕，拘留\t\tlandscape\t地标，风景\t\trepresent\t代表\t\taudience\t听众\t\tswitch\t开关\t\tsword\t剑\t\tspot\t点，看\t\tsymbol\t象征\t\tsanction\t批准\t\tbucket\t木桶\t\tpoetry\t诗歌\t\tfibre\t纤维\t\tpension\t退休金\t\tbeggar\t乞丐\t\tillustration\t解释\t\tliable\t有义务的，易... 的\t\tbunch\t束\t\tmanagement\t管理，经营\t\tsympathize\t同情\t\tsession\t会议\t\tdelicious\t可口的\t\tbreeze\t清风\t\timitate\t模仿\t\tinfant\t婴儿\t\tsympathy\t同情\t\tadvantage\t优势\t\tconsiderable\t大量的\t\tspur\t刺\t\treligious\t宗教的\t\tbanner\t横幅\t\tnylon\t尼龙\t\texceedingly\t极\t\tsymptom\t症状\t\tpillar\t柱子\t\toutcome\t结果\t\tjourney\t旅行，旅途\t\tforehead\t额\t\tconscience\t良心\t\tprecise\t精确地\t\tcable\t缆绳\t\tscrew\t螺丝，拧螺丝\t\tgang\t伙\t\tfavour\t恩惠\t\tconstitute\t构成\t\tsqueeze\t挤\t\tsystem\t系统\t\tculture\t文化\t\tmissile\t导弹\t\tcast\t扔，投掷\t\tmarxist\t马克思主义者\t\tprior\t预先的\t\tdye\t染料\t\tgraceful\t优雅的\t\tonion\t洋葱\t\tseal\t封\t\tsaint\t圣\t\thesitate\t犹豫\t\tcrawl\t爬行\t\tcontribute\t贡献\t\tfascinating\t不可思议的\t\tentertainment\t娱乐\t\tcigarette\t烟\t\timmense\t巨大的\t\touter\t外太空的\t\trevolutionary\t革命的\t\tfabric\t织物\t\tridge\t脊\t\tmass\t质量\t\tcompetent\t能胜任的，有能力\t\tconclusion\t结论\t\tbang\t猛击\t\tcurious\t好奇的\t\tpulse\t脉搏\t\tencounter\t遇见\t\tconcern\t关注，公司\t\tpreposition\t介词\t\tpond\t池塘\t\tprovision\t提供\t\treinforce\t加强\t\tsystematic\t(\t\tal\t)  系统的\t\trail\t栏杆\t\tpat\t轻拍\t\trational\t理智的\t\tflee\t逃走\t\tresponse\t负责任\t\texecutive\t可执行的\t\ttag\t标签，名言\t\tmeans\t方式\t\tnephew\t外甥\t\tmotivate\t目的\t\tfailure\t失败\t\tconsistent\t一致的\t\tnowhere\t无处\t\tsympathetic\t有同情心的\t\tsketch\t梗概\t\tcalm\t使平静\t\ttame\t驯服的\t\tcancel\t取消\t\tpray\t祈祷\t\ttarget\t目标\t\tcamel\t骆驼\t\ttechnician\t技术人员\t\tsetting\t背景\t\ttechnique\t技术\t\ttax\t税\t\temerge\t浮出\t\tcapable\t有能力的\t\ttechnology\t技术\t\tselfish\t自私的\t\tdefinition\t定义\t\tper\t每\t\tparticipate\t参与\t\ttedious\t冗长的\t\tanxious\t焦躁的\t\tfamine\t饥荒\t\tfundamental\t基本的\t\tplural\t复数\t\tanticipate\t预感，期望\t\tteenager\t青少年\t\tcompress\t压缩\t\tpepper\t胡椒粉\t\tdischarge\t释放\t\ttelescope\t望远镜\t\ttemper\t脾气\t\textensive\t大量的\t\tamuse\t取悦\t\tcurrent\t当前的，电流\t\tmask\t面具\t\tmusician\t音乐家\t\ttemple\t庙宇\t\tdecay\t腐烂\t\tcriticism\t批评\t\tfeedback\t反馈\t\taccordance\t一致，和谐\t\tperceive\t感觉，察觉\t\tscarcely\t很少\t\tclay\t粘土\t\tintelligent\t智慧的\t\tconductor\t售票员\t\tfrequency\t频率\t\tattractive\t有吸引力的\t\tgarlic\t大蒜\t\ttemporary\t暂时的\t\trecognize\t识别\t\tpuzzle\t使困惑\t\televator\t电梯\t\tacquisition\t获取\t\tabsolute\t绝对的\t\tfrank\t真诚的\t\thip\t臀部\t\tpolish\t使光滑\t\tdemocratic\t共和的\t\ttemptation\t诱惑\t\tdisguise\t恶心的\t\tglue\t胶水\t\tsolemn\t肃穆的\t\ttend\t倾向 使光滑\t\tdemocratic\t共和的\t\ttemptation\t诱惑\t\tdisguise\t恶心的\t\tglue\t胶水\t\tsolemn\t肃穆的\t\ttend\t倾向\t\tobserver\t观察员\t\tretreat\t撤退\t\trelevant\t相关的\t\tprecision\t精密度\t\tadmit\t承认\t\tjungle\t热带雨林，丛林\t\tthoughtful\t体贴的\t\tapartment\t公寓\t\tafterward\t后来\t\tentire\t整体\t\tcarbon\t碳\t\tchamber\t房室\t\trealm\t领域，范围\t\tratio\t比率\t\tcapture\t俘获\t\tbaseball\t棒球\t\tboring\t枯燥的\t\tcrowd\t人群\t\tsample\t样品\t\testate\t土地，财产，种植园\t\tthreat\t威胁\t\treliable\t可信赖的\t\tconstant\t不变的，常数\t\tsustain\t支持\t\thorsepower\t马力\t\tsuspicion\t怀疑\t\tprospect\t景象，前景\t\tconduct\t引导\t\tlawn\t草坪\t\ttransmit\t传播\t\tpollution\t污染\t\tslip\t滑到，小过错\t\tinfluential\t有影响的\t\thandle\t处理\t\tthreaten\t威胁的\t\taircraft\t飞船\t\tthrive\t繁荣的\t\tharm\t危害\t\tsimilarly\t类似地\t\tprominent\t突出的\t\tsignal\t信号\t\tencourage\t鼓励\t\trecession\t衰退\t\tcommitment\t委员会\t\tmonitor\t监测\t\tspark\t星火\t\tmug\t大杯，打劫\t\tabsence\t消失，缺席\t\tappreciate\t欣赏\t\tbean\t豆子\t\telastic\t有弹性的\t\tpresumably\t大概，可能\t\tbargain\t砍价\t\tsignificant\t重要的\t\tthroat\t喉咙\t\textend\t延伸\t\tcomparable\t比得上的\t\tcontainer\t容器\t\tchief\t首要的\t\tinstant\t片刻\t\tthrust\t刺入\t\tthumb\t大拇指\t\thoney\t甜的\t\tenforce\t强迫，实行\t\tease\t减缓\t\tthunder\t雷电\t\tliving\troom  起居室\t\tmonument\t纪念碑\t\tassess\t评估\t\tpanic\t恐慌\t\tblanket\t毯子\t\tdrift\t漂流\t\tnormally\t一般地\t\tdismiss\t解雇\t\tdeputy\t副手\t\tacre\t英亩\t\tcontract\t协议\t\tanniversary\t纪念日\t\tmainland\t大陆\t\texpose\t暴露\t\tpolicy\t政策\t\tmachinery\t机器\t\texert\t尽全力\t\tcollection\t收藏\t\tgasoline\t汽油\t\tdispose\t处理，扔弃\t\tarouse\t唤醒\t\trage\t狂怒\t\tinward\t里面的\t\tseries\t系列\t\troast\t烤\t\ttimber\t木材\t\treluctant\t勉强的\t\tlicense\t许可证\t\tupright\t笔直的\t\tauthor\t作者\t\tmission\t任务\t\tgrowth\t成长\t\tattack\t袭击\t\tfurnish\t装备\t\tpretend\t假装\t\tconcentrate\t集中\t\tinstitution\t惯例，习俗\t\tflat\t平的\t\ttissue\t组织\t\tdelicate\t易碎的\t\tupper\t上层的\t\tgram\t克\t\tcrown\t王冠\t\ttitle\t标题\t\tconvey\t表达\t\tmount\t积累\t\ttoast\t土司\t\ttolerance\t忍耐力\t\tamongst\t在... 之中\t\tslice\t切\t\tdairy\t乳制品\t\tconsultant\t顾问\t\tmultiply\t乘\t\tnaked\t裸体的\t\tcentigrade\t摄氏度\t\tmeasurement\t测量\t\tprecaution\t预防\t\tallocate\t分配\t\tcertificate\t证书\t\tagenda\t议事日程\t\telectronic\t电子的\t\talongside\t沿着\t\tconventional\t传统的\t\ttopic\t话题\t\trenew\t使复原\t\ttorch\t火炬\t\tclap\t鼓掌\t\tconservative\t保守的\t\tcopyright\t版权\t\testablishment\t建立\t\tlayout\t布局，安排\t\tauxiliary\t辅助的，备用的\t\tmajor\t主要的\t\tlegislation\t法规\t\tmoisture\t湿气\t\tnationality\t国际\t\tfoundation\t建立\t\tgulf\t海湾\t\tassistance\t援助\t\tcombat\t争斗\t\texhibit\t展览\t\tdonation\t捐助\t\tfragment\t碎片\t\treverse\t使倒转\t\tapply\t应用\t\treform\t改革\t\tgenerally\t一般地\t\telectron\t电子\t\tdistinct\t与... 显著不同\t\tpriority\t优先权\t\telementary\t基本的\t\ttowel\t纸巾\t\topera\t歌剧\t\tdigital\t数码的\t\tartistic\t艺术的\t\telderly\t年长的\t\tcrack\t裂缝\t\tchrist\t救世主\t\tevidence\t证据\t\tnaturally\t自然地\t\tmechanic\t技工\t\ttrace\t追踪\t\texpand\t扩张\t\tlaughter\t笑声\t\tcompass\t罗盘\t\tlean\t倾斜，屈身\t\tminister\t大臣\t\tduration\t持续\t\tcomprehension\t综合\t\ttractor\t拖拉机\t\ttradition\t传统\t\tcompete\t竞争\t\tgoodness\t天啊\t\ttragedy\t悲剧\t\toffend\t侵犯\t\tinstinct\t天性\t\tretire\t退休\t\tprofessional\t专业的\t\tbullet\t子弹\t\ttrail\t跟踪\t\tprosperity\t繁荣\t\tpants\t裤子\t\tminor\t低级的，次要的\t\tshortage\t短缺\t\tequality\t平等\t\tjealous\t嫉妒\t\tdominate\t占主要地位\t\tinspect\t检查\t\tgenerator\t发电机\t\tlorry\t卡车\t\tcue\t提示，暗号\t\ttransfer\t位移\t\tfarewell\t再见\t\trevenue\t收入，税收\t\ttransform\t变形\t\thay\t干草\t\tadvocate\t提倡\t\tmodify\t修饰\t\tfantastic\t奇妙的\t\tcomplicated\t复杂的\t\thistoric\t历史性的\t\tspecify\t详述\t\ttranslation\t翻译\t\tprosperous\t繁荣的\t\tbaggage\t行李\t\tpour\t倾倒\t\ttransmission\t传播\t\tobtain\t获得\t\tenthusiasm\t热情\t\tequivalent\t等同的\t\tassemble\t集中\t\tslope\t倾斜\t\tsecondary\t次要的\t\tassume\t假定\t\tawful\t糟糕的\t\tprocess\t过程\t\tlick\t吸吮\t\tovercome\t克服\t\tmotion\t示意\t\tcrucial\t至关重要的\t\tpriest\t神父\t\ttransparent\t透明的\t\tillegal\t非法的\t\tfancy\t想象\t\tconscious\t知道的\t\ttransport\t运输\t\tcontemporary\t同时代的\t\tchill\t使寒冷\t\tbreadth\t宽度\t\tflood\t洪水\t\tspecies\t物种\t\tnecessity\t必要性\t\tscare\t使惊恐\t\tscientific\t科学的\t\ttransportation\t交通运输\t\tregardless\t不管\t\tcreate\t创造\t\tdiagram\t图表\t\tvalid\t有效的\t\tcopper\t铜\t\testimate\t估计\t\tcarriage\t四轮马车\t\tmat\t垫子\t\tcashier\t出纳员\t\tsensible\t有感觉的\t\tfaithful\t真诚的\t\ttrap\t陷阱\t\tintensity\t强烈\t\tremedy\t疗法\t\thearing\t听觉\t\tdecent\t还可以的\t\thistorical\t历史性的\t\tconfine\t禁闭\t\tgymnasium\t体育馆\t\tacademy\t学院\t\tdefinitely\t当然\t\trecorder\t录音机\t\tsour\t酸臭的\t\tfruitful\t多产的\t\texpectation\t期望\t\tdisappear\t消失\t\ttrash\t垃圾\t\tbleed\t流血\t\tcarrot\t胡萝卜\t\ttray\t托盘\t\trealistic\t现实可行的\t\tretain\t保持\t\tfortunately\t幸运的\t\tcomb\t梳子\t\treference\t涉及\t\ttreatment\t处理\t\tpowerful\t有力量的\t\tpositive\t正面的\t\towing\t欠的\t\tappoint\t委任\t\tartificial\t人工的\t\tproject\t任务\t\ttreaty\t契约\t\temphasis\t强调\t\tselect\t挑选\t\ttremble\t颤抖\t\tattraction\t吸引力\t\tabundant\t丰富的\t\tfaith\t真诚\t\tmathematical\t数学\t\tnavy\t海军\t\ttremendous\t巨大的\t\tdominant\t占支配地位的\t\tproposal\t建议\t\tmagnetic\t有磁性的\t\tharden\t使变硬\t\ttrend\t趋势\t\telaborate\t精细的\t\tbat\t球拍，蝙蝠\t\ttriangle\t三角形\t\tliterary\t文学的\t\tjail\t监狱\t\tdesign\t设计\t\tscript\t底稿，脚本\t\tsaddle\t马鞍\t\tlest\t唯恐\t\tcreep\t爬行\t\tafford\t承担\t\ttrial\t审判，测验\t\tinn\t小旅店\t\tchoke\t噎着\t\tdental\t牙的\t\tcouncil\t委员会，理事会\t\tportion\t比例\t\tlodge\t旅馆\t\ttroop\t军队，一群\t\tvague\t模糊的\t\ttropical\t炎热的，热带的\t\tcoil\t一卷\t\tbenefit\t受益\t\ttroublesome\t麻烦的，讨厌的\t\tfemale\t女性的\t\tpose\t造型\t\ttruly\t真诚的\t\tpeculiar\t独特的\t\texport\t出口\t\tresume\t重新开始\t\tportrait\t肖像\t\tutter\t完全\t\tbacteria\t细菌\t\tidle\t闲逛\t\tpledge\t承诺\t\texchange\t交换\t\temotion\t情绪\t\tharsh\t刺耳的\t\texposure\t暴露\t\tsaving\t节约\t\treasonable\t通情达理的\t\ttrumpet\t唢呐\t\tapplause\t鼓掌\t\tnonsense\t废话\t\tfantasy\t幻想\t\tusage\t用处\t\tfinance\t财政\t\texaggerate\t夸大\t\ttrunk\t树桩\t\tgrocer\t杂货店\t\tcruise\t巡游\t\tinitial\t最初的\t\trailroad\t铁路\t\ttube\t管道\t\tattain\t达到\t\tdevise\t设计\t\tdensity\t密度\t\ttune\t调子\t\tsource\t源\t\tshrug\t耸肩\t\tdaylight\t日光\t\ttunnel\t隧道\t\tsite\t位置\t\tturbine\t涡轮机\t\thandy\t手边的\t\tbackground\t背景\t\ttutor\t导师\t\tsauce\t酱汁\t\tcombine\t组合\t\tpill\t药\t\tbay\t湾\t\tceremony\t典礼\t\tformula\t公式\t\treservior\t水库\t\tdelete\t删除\t\tpump\t泵\t\tbackward\t向后\t\ttwist\t缠绕\t\trange\t范围\t\tniece\t侄女\t\tprotest\t反对\t\tcentimetre\t厘米\t\tpredict\t预测\t\tacquaintance\t熟识\t\tlearning\t学识\t\tspider\t蜘蛛\t\tcounsel\t忠告\t\tcommit\t犯罪\t\ttypewriter\t打字机\t\tsin\t罪过\t\tsow\t播种\t\tcompanion\t伙伴\t\tdestination\t目的地\t\ttypical\t典型的\t\tcorresponding\t相关的\t\tdonkey\t驴子\t\tfrontier\t前线\t\toutlook\t展望，前景\t\ttypist\t打字员\t\tapart\t分开\t\tadditional\t另外的\t\tconsequence\t结果\t\tnevertheless\t然而\t\tdirt\t污秽\t\tlobby\t前厅\t\toccasional\t偶然的\t\tdoubtful\t怀疑的\t\tcommittee\t委员会\t\ttyre\t轮胎\t\tugly\t丑陋的\t\tparallel\t平行的\t\tcooperate\t合作\t\tappetite\t食欲\t\timpose\t强迫\t\tinvade\t侵略\t\tcontroversy\t争论\t\tconfident\t自信的\t\tnursery\t育婴房\t\tfraction\t部分\t\tcabinet\t橱\t\tamid\t在...之中\t\tmanufacturer\t制造商\t\tindependence\t独立\t\tacademic\t学院的\t\tevolve\t进化\t\texception\t例外\t\tdictation\t听写\t\tprofession\t职业\t\tauthority\t权利\t\tdeposit\t积累\t\tenquiry\t询问\t\tdiffer\t区别于\t\targument\t争论\t\tmemorial\t纪念碑\t\tfaculty\t系，学科\t\tdim\t昏暗的\t\tmoreover\t而且\t\tearnest\t郑重其事地\t\theroic\t行英雄的\t\tumbrella\t雨伞\t\torchestra\t管弦乐队\t\tarithmetic\t算数\t\tbasically\t基本地\t\tbattery\t电池\t\theel\t脚后跟\t\toblige\t迫使\t\tconvict\t判罪\t\trespond\t负责\t\tcite\t引用，举例\t\tdiscard\t丢弃\t\tgrab\t抢劫\t\tdeceive\t欺骗\t\tsenior\t高级的\t\tmodest\t谦虚的\t\tcontinuous\t连续不断的\t\tcomprise\t包括\t\trevolt\t反叛\t\texpense\t消耗\t\tcampus\t校园\t\tmold\t霉菌\t\tinsure\t保险\t\tcash\t现金\t\tvirtue\t优点\t\tviolent\t狂暴的\t\treact\t反应\t\todd\t奇怪的\t\tdiverse\t不同的\t\tmanual\t手工的\t\tuncover\t覆盖\t\tban\t禁止\t\tconfront\t直面\t\tundergo\t经历\t\tjournal\t杂志\t\temperor\t君王\t\tundergraduate\t大学肄业生\t\tcircular\t循环的\t\tdictate\t听写\t\tinform\t通知\t\tunderground\t地铁\t\thook\t钩\t\tunderline\t下划线\t\tmale\t雄性的\t\tproceed\t前进\t\thydrogen\t氢\t\tforce\t力\t\tfog\t雾\t\tfluid\t流体\t\tdrill\t钻机\t\tunderstanding\t理解的\t\tnitrogen\t氮\t\tcommission\t委员会\t\tjaw\t颌\t\tundertake\t承诺\t\tsalary\t工资\t\tskilled\t熟练地\t\tassembly\t集会\t\tmerry\t快乐\t\tundo\t解开扣子\t\tundoubtedly\t毫无疑问地\t\tglobe\t全球的\t\tuneasy\t不舒服\t\tprecious\t珍贵的\t\tmosquito\t蚊子\t\tpetroleum\t汽油\t\tfavourable\t赞同的\t\tsightseeing\t观光\t\teconomic\t经济的\t\tmultiple\t多重的\t\tpoverty\t贫困\t\trely\t依赖\t\teffort\t努力\t\taccumulate\t积累\t\tcheat\t欺骗\t\thumorous\t幽默的\t\trare\t罕见的\t\trival\t对手\t\techo\t回声\t\tinvestment\t投资\t\tcollapse\t倒塌\t\tcorridor\t走廊\t\tdespite\t不顾\t\tpit\t坑\t\tcounter\t柜台\t\tbalcony\t楼厅\t\tdiplomatic\t外交的\t\tcigar\t雪茄\t\tbathe\t洗澡\t\tconquer\t征服\t\tinflation\t膨胀\t\tthermometer\t寒暑表\t\tworthwhile\t值得\t\tscenery\t景色\t\tterror\t恐怖\t\taverage\t平均\t\tdemocracy\t共和\t\tslap\t掴\t\tobstacle\t障碍\t\toccur\t出现\t\tnuisance\t讨厌的人\t\tsignificance\t重要性\t\tup\t-\t\tto\t-\t\tdate\t最新的\t\tjustify\t证明...有理\t\tneglect\t无视\t\tmembership\t会员身份\t\tunion\t联合\t\troller\t辊压机\t\tformation\t形成\t\tpunctual\t守时的\t\trelieve\t减缓\t\tcandy\t糖果\t\tspokesman\t发言人\t\temployer\t雇主\t\tunique\t独特的\t\tmathematics\t数学\t\therd\t群\t\tcheerful\t鼓舞人心的\t\tadvertise\t打广告\t\treflexion\t反射\t\tunite\t联合\t\tsecure\t安全的\t\tmineral\t矿石\t\tuniversal\t普遍的\t\tlane\t小径\t\tbeloved\t亲爱的\t\tadapt\t适应\t\tmislead\t误导\t\tdrag\t拖\t\tflash\t闪\t\timmigrant\t移民\t\tremarkable\t令人惊叹的\t\tincreasingly\t越来越\t\tindoor\t室内的\t\tpalm\t手掌\t\texclusive\t奢侈的\t\tnamely\t即\t\tuniverse\t宇宙\t\tburst\t爆发\t\tpreferable\t更好的\t\tfilter\t滤过\t\tanyhow\t不管怎么样\t\tscore\t得分\t\tqualify\t满足条件\t\tglobal\t全球的\t\theave\t起伏，举\t\tunless\t除非\t\texcessive\t过分的\t\tmarine\t海军\t\tbehalf\t利益，方面\t\tadvanced\t高级的，领先的\t\tsoda\t苏打\t\tunlike\t不像\t\tadjust\t调整\t\tunload\t卸下\t\tleader\t领导\t\tspelling\t拼写\t\taccordingly\t一致\t\tanxiety\t焦躁\t\tridiculous\t荒谬的\t\tunusual\t不寻常的\t\tscholarship\t奖学金\t\tdivorce\t离婚\t\theadquarters\t总部\t\tcommerce\t商业\t\ttorture\t折磨\t\tfashion\t时尚\t\tincident\t小事\t\tupset\t失落\t\tunderneath\t在...下面\t\trecover\t恢复\t\ttheory\t理论\t\tevolution\t进化\t\tmyth\t神话\t\ttrim\t整洁的\t\tmud\t泥浆\t\tunfortunately\t不幸地\t\trelate\t联系，相关\t\textraordinary\t不凡的\t\tdebt\t债\t\turge\t急切做\t\turgent\t急切的\t\tqualification\t资格\t\tsatellite\t卫星\t\tpublication\t出版\t\tcliff\t峭壁\t\trestrain\t克制\t\tcommander\t指挥官\t\tcarpet\t地毯\t\tpeer\t凝视\t\thighway\t高速公路\t\tbreed\t饲养\t\tensure\t确保\t\trequirement\t要求\t\tattempt\t努力\t\tflock\t群\t\tlargely\t很大程度上\t\trestraint\t克制\t\tfocus\t集中\t\tprotective\t保护性的\t\tutility\t效用\t\tjet\t喷气飞机\t\tcoordinate\t协调\t\trestore\t恢复\t\treceipt\t收据\t\tcontrary\t相反方面\t\tchristian\t基督教徒\t\thardware\t硬件\t\tbloom\t开花\t\tdragon\t龙\t\tspecimen\t标本\t\tchew\t咀嚼\t\tutmost\t极度的\t\toriginal\t初始的\t\treligion\t宗教\t\tcommunication\t交流\t\tbeyond\t超出\t\tvacant\t空的\t\tconclude\t做结论\t\trestrict\t阻止\t\trespectively\t分别\t\tfairly\t公平\t\tsailor\t海员，水手\t\tremark\t评论\t\tassure\t使确信\t\tbalance\t平衡\t\tcampaign\t运动，战役\t\tpsychological\t心理学的\t\tcontradiction\t矛盾，否定\t\tdose\t一剂\t\tvacation\t假期\t\timmediately\t立即\t\tvacuum\t真空\t\tore\t矿石\t\tclause\t从句\t\tcattle\t牲口\t\tbarn\t牲口棚\t\tlaser\t激光\t\tinitiative\t主动性，首创精神\t\tcompel\t使屈服\t\tbasis\t基础\t\tcontact\t接触\t\tguarantee\t保证\t\tsemiconductor\t半导体\t\trib\t肋骨\t\tobvious\t明显的\t\tgeometry\t几何\t\tbutcher\t屠夫\t\ttriumph\t凯旋\t\tmaid\t女仆\t\teyesight\t视力\t\tinterview\t采访\t\tvain\t无劳\t\tpaste\t浆糊\t\tsoak\t浸泡\t\texceed\t超越\t\tboom\t激增\t\titem\t项目\t\thammer\t榔头\t\tmetric\t米制的\t\tjar\t罐头\t\tresource\t资源\t\tcompose\t创作\t\tmilitary\t军事\t\tpackage\t包裹\t\tvan\t货车，领导者，先驱\t\tbesides\t另外\t\tinjection\t注射\t\tlaboratory\t实验室\t\tvanish\t消失\t\texperimental\t实验的\t\tmysterious\t神秘的\t\tsake\t缘故\t\tkeen\t强烈的\t\tvapour\t蒸汽\t\thaste\t急忙\t\tmagic\t魔法\t\tpoisonous\t有毒的\t\taid\t援助\t\tcoach\t教练\t\tdecrease\t降低\t\trelief\t缓解\t\tcontinual\t连续的\t\tslight\t轻微的\t\tstare\t凝视\t\tgrace\t优雅\t\tband\t带，乐团\t\tmechanical\t力学的\t\tconsiderate\t体贴的\t\tditch\t沟渠\t\tignorance\t天真，无知\t\tballoon\t气球\t\tbrake\t刹车\t\tdata\t数据\t\tbake\t烘焙\t\tgear\t齿轮\t\tpatient\t耐心的\t\taltitude\t海拔\t\tinquiry\t询问\t\timplement\t贯彻，执行\t\tremind\t提醒\t\tpint\t品脱\t\tengine\t发动机\t\tbid\t叫价\t\tscout\t侦查\t\tmould\t霉菌\t\tavenue\t林荫道\t\tinstance\t例子\t\tcareer\t事业\t\tfountain\t喷泉\t\tformat\t格式\t\tcorrespond\t相关\t\tclarify\t澄清\t\tmercy\t恩惠\t\texpression\t表示\t\texact\t确实\t\tdecade\t十年\t\tdimension\t维度\t\tvision\t视\t\tunity\t统一\t\tvigorous\t活力的\t\tvia\t通过\t\tskim\t略读\t\tsevere\t严重的\t\tconquest\t征服\t\timprove\t提高\t\tvariety\t种类\t\telection\t选举\t\texpert\t专家\t\tdive\t跳水\t\tvarious\t多种多样的\t\trifle\t来福步枪\t\tstake\t刑柱，股份\t\tcorporation\t合作\t\tvary\t呈现不同\t\teagle\t山鹰\t\tfigure\t数字，人\t\tvast\t广阔的\t\tsimplify\t简化\t\tinstead\t替代\t\tshell\t贝壳\t\tdrawer\t抽屉\t\tquote\t引号，引用\t\tdepress\t使压抑\t\tschedule\t日程表\t\tlimitation\t限制\t\tdisturb\t打扰\t\tcancer\t癌症\t\taccord\t一致\t\tindustrial\t工业的\t\tpreference\t偏爱\t\tscreen\t屏幕\t\terror\t错误\t\tgratitude\t毕业\t\tslam\t关门\t\tevil\t邪恶的\t\taccent\t口音\t\timagination\t想象力\t\telsewhere\t其余地方\t\tchampion\t冠军\t\tframework\t框架\t\tsocial\t社会的\t\tendure\t忍受\t\tgradual\t逐渐的\t\tsleeve\t袖子\t\tconcession\t承认，许可\t\tvehicle\t交通工具\t\tregister\t注册\t\tapology\t道歉\t\tluggage\t行李\t\tdesperate\t极渴望的\t\tbillion\t十亿\t\tventure\t商业冒险\t\tqueue\t队列\t\taside\t一边\t\treflect\t反射\t\tbeneficial\t有益的\t\trepeatedly\t反复地\t\tkindergarten\t幼儿园\t\tverify\t核实\t\treduction\t减少\t\tversion\t版本\t\timplication\t暗示\t\taccustomed\t习惯的\t\thelicopter\t直升机\t\tnormal\t普通的\t\tshiver\t颤抖\t\tstadium\t体育馆\t\tgrasp\t抓住\t\teconomy\t经济\t\trotten\t腐烂的\t\tdash\t猛冲\t\trecently\t最近地\t\tconcept\t概念\t\trigid\t死板的\t\tentertain\t使娱乐\t\tvertical\t垂直的\t\tvessel\t管道\t\tevident\t明显的\t\tapologize\t道歉\t\tscholar\t学者\t\tcostly\t昂贵的\t\tveteran\t老士兵\t\tglimpse\t一瞥\t\tfinally\t最终\t\tapproval\t准许\t\tjudgement\t判断\t\tregulation\t管理，规章\t\tcord\t绳\t\tpowder\t粉末\t\timprovement\t提高\t\tremote\t遥远的\t\tprovide\t提供\t\trub\t揉搓\t\tfiction\t小说\t\toccurrence\t出现\t\tadopt\t接受\t\tnavigation\t航海\t\tadventure\t探险\t\tfloat\t漂浮\t\tdynamic\t动力学的\t\tvibrate\t振动\t\tindifferent\t冷漠的\t\tplot\t线索\t\thorror\t恶心的\t\tfatigue\t疲劳\t\tconsideration\t考虑\t\tvice\t堕落\t\tnotebook\t笔记本\t\tchop\t劈\t\trespect\t方面\t\tadmission\t准许\t\tdisease\t疾病\t\tignore\t忽视\t\tinfect\t影响\t\tconfirm\t证明\t\tharbour\t港口\t\tconcrete\t坚实的\t\torganic\t有机的\t\tphase\t相\t\tprevious\t预先的\t\thelpless\t无助的\t\tamaze\t使惊奇\t\tdespair\t绝望\t\tvictim\t受害者\t\tpossibility\t可能性\t\tvideo\t视频\t\tviewpoint\t观点\t\terect\t矗立\t\tobey\t遵守\t\trarely\t很少地\t\tvinegar\t醋\t\tapproach\t方式，达到\t\tviolate\t紫罗兰\t\tdistinction\t显著不同\t\tholy\t神圣的\t\tphilosophy\t哲学\t\tgolf\t高尔夫\t\toutward\t向外的\t\tsection\t部分\t\tpenalty\t惩罚\t\tdump\t倾销\t\tinternal\t内部的\t\tinstallation\t安装\t\tcharge\t掌管，电荷\t\tcriticize\t批评\t\tdisorder\t混乱\t\trocket\t火箭\t\tdessert\t甜点\t\tdispute\t辩论\t\tbutterfly\t蝴蝶\t\tcircuit\t环路\t\tfrequent\t频繁的\t\tdepart\t离开\t\tlens\t透镜\t\tsigh\t叹息\t\tviolence\t暴力\t\treserve\t保存\t\taluminium\t铝\t\thence\t所以\t\tpine\t松木\t\topening\t开门\t\tacid\t酸\t\then\t母鸡\t\tgiant\t巨大的\t\tcrystal\t水晶，晶体\t\toperational\t可执行的\t\tracial\t种族的\t\tconstruction\t结构\t\tplanet\t行星\t\timage\t图像\t\tblade\t刀刃\t\tphysicist\t物理学家\t\tsack\t麻袋\t\tbehave\t行为\t\torganism\t有机体\t\tshortly\t简短地\t\tinterval\t间隔\t\tviolet\t紫罗兰\t\tdraught\t拖拉\t\tappointment\t约定\t\tmeantime\t同时\t\tmurder\t谋杀\t\tviolin\t小提琴\t\tperspective\t远景，透视图\t\tlaundry\t洗衣房\t\tvirtual\t事实上\t\tvirtually\t事实上\t\tcalculate\t计算\t\tconfess\t承认\t\tappearance\t外貌\t\tvirus\t病毒\t\tambulance\t救护车，野战队\t\tliberty\t自由\t\tconsequently\t因此所以\t\tinsist\t坚持要求，认为\t\tsolar\t太阳的\t\tflourish\t装修\t\tcorrespondence\t联系\t\tpronoun\t代词\t\tproperty\t财产\t\tshave\t剃刮\t\tselection\t选举\t\tlimited\t限制的\t\tenormous\t大量的\t\timpact\t影响\t\tvisible\t可见的\t\tconceal\t隐藏\t\tearthquake\t地震\t\tcurriculum\t课程\t\tfeature\t特点\t\tloaf\t屋顶\t\tstain\t玷污\t\tdemand\t要求，需求\t\tmedia\t媒介\t\tcomparative\t相比的\t\tmassive\t重的\t\tultimate\t最终\t\textent\t面积，长度\t\temployment\t雇佣\t\tmedium\t居中的\t\turban\t城市的\t\tengineering\t工程\t\tmarvelous\t不可思议的\t\tevent\t大事\t\tresolve\t决心\t\tavoid\t避免\t\trespective\t分别\t\tboast\t自夸\t\tsew\t缝纫\t\tindicate\t暗示\t\tgovern\t掌控\t\tvisual\t可视的\t\tutilize\t利用\t\tchase\t追赶\t\tprevail\t说服\t\tpillow\t枕头\t\tpacket\t包\t\theap\t堆\t\tvariation\t多样性\t\tprimary\t初级的\t\tdense\t密集的\t\toutside\t外面\t\towe\t欠\t\tinterfere\t干涉\t\tburden\t压力\t\tscatter\t传播，分散\t\tstarve\t挨饿\t\tsimplicity\t简朴\t\tbare\t裸露的\t\tcompound\t化合物\t\torderly\t有序的\t\tresolution\t决心\t\tlearned\t有教养的\t\tshelter\t藏身之处\t\treporter\t记者\t\tprofile\t侧脸\t\tshed\t库棚\t\tnecessarily\t必要地\t\tvitamin\t维生素\t\treproduce\t再生产\t\tgrateful\t感激的\t\tconvenience\t方便\t\tvivid\t生动的\t\toutset\t开始\t\tdeserve\t值得\t\tassignment\t指派，分配\t\tprincipal\t校长\t\tenable\t使能够\t\trefrigerator\t冰箱\t\tkeyboard\t键盘\t\tpoison\t毒药\t\tmill\t磨坊\t\telectrical\t电的\t\tinstall\t安装\t\toutput\t产量\t\tally\t联盟\t\tvocabulary\t词汇\t\tathlete\t运动员\t\thonourable\t光荣的\t\tbrass\t黄铜\t\tmerely\t仅仅地\t\tengage\t花时间做，订婚\t\tsphere\t球，球状的\t\tpurple\t小学学生\t\tvolcano\t火山\t\tdecline\t下降\t\tclassic\t传统的\t\tstale\t腐烂的\t\tliberate\t自由，解放\t\tstandpoint\t立场\t\tactivity\t活动\t\tvolt\t伏特\t\tarrange\t安排\t\tcanal\t运河\t\tdevice\t装置\t\tvoltage\t电压\t\tangle\t角度\t\tvolume\t容量\t\tvoluntary\t志愿的\t\trhythm\t韵律\t\tbore\t使枯燥\t\tmarriage\t婚姻\t\tbet\t打赌\t\tspade\t铁锹\t\tofficial\t官方的\t\tbeast\t野兽\t\tdrum\t鼓\t\tcrash\t冲撞\t\tboot\t长筒靴\t\tcharm\t魅力\t\tliterature\t文学\t\thandbag\t手提包\t\tvolunteer\t志愿者\t\toval\t椭圆的\t\tglorious\t光荣的\t\tinspire\t使振奋精神\t\tprotection\t保护\t\targue\t争论\t\tcop\t警察\t\tgiven\t规定的，给定的\t\tchapter\t章节\t\tlikely\t有可能的\t\tomit\t省略，遗漏\t\tadequate\t充分的\t\tdeparture\t分开\t\taccording\t已知的\t\tshift\t改变\t\tsophisticated\t老于世故的\t\tdamp\t潮湿的\t\tfry\t炸\t\textension\t延伸\t\tinstruction\t说明，引荐\t\tassumption\t假定\t\tpotential\t潜在的\t\tpermanent\t永久的\t\tquit\t放弃\t\tregion\t地域\t\toverseas\t海外的\t\tvote\t选票\t\tfurnace\t装修\t\twagon\t四轮马车\t\tagriculture\t农业\t\toven\t电炉\t\twaist\t腰\t\teditor\t编辑\t\trepublican\t共和主义者\t\tfactor\t因素\t\thint\t暗示\t\twaken\t唤醒\t\tplunge\t骤降\t\tapplicable\t适当的\t\twander\t散步\t\tluxury\t奢侈品\t\tloosen\t松的\t\treadily\t乐意地\t\tdevil\t魔鬼\t\tborder\t国界\t\twarmth\t温暖\t\tcreative\t创造性的\t\twaterproof\t防水的\t\tcargo\t货物\t\tcomplaint\t抱怨\t\texplosion\t爆炸\t\teconomical\t节约的\t\tprogressive\t进步的\t\tresidence\t阻力的，抵抗的\t\tresemble\t类似于\t\tperception\t感知\t\tannoy\t扰乱\t\twhichever\t不管哪个\t\twhereas\t然而\t\trob\t打劫\t\trecommend\t推荐\t\tpitch\t场地\t\tperform\t表演\t\tconnect\t连接\t\tpilot\t飞行员\t\tvital\t必不可少的\t\tscold\t训斥\t\tintense\t强烈的\t\thorrible\t恶心的，可怕的\t\tedition\t版次\t\tspeculate\t猜想，投机\t\tmechanism\t机制，机理\t\tdumb\t哑的\t\thandwriting\t手写\t\teducate\t教育\t\tlandlord\t地主\t\tglove\t手套\t\tscope\t范围\t\trecovery\t恢复\t\tweaken\t使衰弱\t\trefusal\t拒绝\t\twealth\t财富\t\toverall\t整体上\t\treputation\t名声\t\tending\t结局\t\tspill\t溢出\t\tcharacter\t字母，特点\t\tnotify\t通知\t\tpollute\t污染\t\tpersist\t坚持\t\tprinciple\t原则\t\tpeak\t山峰\t\tmargin\t页边空白\t\tregarding\t关于\t\trepetition\t重复\t\tspectacular\t壮观的\t\thumour\t幽默感\t\tachievement\t成就\t\tsalad\t沙拉\t\tfare\t车费\t\tflame\t火焰\t\tconvention\t习俗\t\tnetwork\t网络\t\treservation\t保存\t\tribbon\t缎带\t\tplentiful\t丰富的\t\tclassify\t分类\t\tweapon\t武器\t\tdissolve\t溶解\t\tsplendid\t壮观的\t\tscarce\t少见的\t\tpolitics\t政治学\t\talphabet\t字母表\t\tperformance\t表演\t\tclumsy\t笨拙的\t\tax\t斧子\t\twealthy\t富裕的\t\tdetect\t发觉\t\tphysician\t物理学家\t\tguy\t家伙\t\tadministration\t政府\t\temphasize\t强调\t\tfrost\t冻坏\t\tcontribution\t贡献\t\tweave\t编织\t\tcrane\t起重机\t\tmuscle\t肌肉\t\tadmire\t羡慕，崇拜\t\texclude\t排除\t\tinquire\t询问\t\tdialect\t方言\t\tweed\t杂草\t\taccident\t事故\t\tnegro\t黑人\t\tidentify\t识别\t\tinstrument\t器具\t\tscratch\t抓\t\tdependent\t依靠的\t\tmoral\t道德的\t\tindividual\t单独的\t\tloan\t借出\t\tdivide\t分\t\tchin\t下巴\t\tshield\t盾牌\t\tminimum\t最小的\t\tlump\t肿块\t\tloose\t释放\t\tscissors\t剪刀\t\tdiameter\t直径\t\tsoar\t酸痛\t\tmolecule\t分子\t\tgaze\t凝视\t\trelationship\t关系\t\treality\t现实\t\trisk\t危险\t\tfee\t费\t\tmature\t成熟的\t\tprovided\t提供的\t\tcuriosity\t求知欲，好奇心\t\torgan\t器官\t\tgrind\t碾碎\t\tharmony\t和谐\t\tlamb\t羊羔\t\tcolumn\t栏目\t\tweekly\t每周\t\triot\t暴乱\t\tbeing\t人\t\tplus\t加\t\tnightmare\t梦魇\t\tbudget\t预算\t\tchart\t聊天，表格\t\tporter\t搬运工人\t\tdusk\t黄昏\t\tsomewhat\t有一点\t\tweep\t流泪\t\tweld\t焊接\t\tcompetition\t竞赛\t\tgallon\t加仑\t\tconvert\t皈依\t\tpublish\t出版\t\tmarket\t市场\t\tkneel\t跪\t\tpostpone\t延迟\t\tliter\t升\t\tclick\t点击\t\tlogical\t逻辑的\t\tconvince\t使相信\t\theadline\t提要\t\tdisaster\t灾难\t\twelfare\t福利\t\tpierce\t\t刺入"
  },
  article1: {
    name: '文章 1',
    value: 'article-1',
    type: ArticleType.article,
    content: "人生，怕的就是心累，痛的就是流泪。属于自己的风景，从来不曾错过，不是自己的风景，永远只是路过。天地太大，人太渺小，不是每一道亮丽的风景都能拥有。一辈子，只求有一道令自己流连忘返，不离不弃的风景就已足够。每一颗心，都有一份无法替代的情愫和某一道风景永远关联着，人生的风景，是物也是人。生在尘世，每个人，都不可避免的要经历一场寒风和苦雨。我们每走一段路，都会遇到一道坎，或高，或低。每经一件事，都会成长一次，或多，或少。每动一次情，都会受伤一回，或深，或浅。每听一首歌，都会动容一心，或忧，或喜。礁石阻拦不住江水东流，悲伤遮掩不住时光飞逝。我们的一生，究竟有多少沟坎要独自跨越，又有多少遗憾留给岁月。一路奔波追求，忙忙碌碌，相聚分离，过客匆匆；偶遇邂逅，进进出出，苦辣酸甜，喜喜忧忧。绚烂的花朵，成熟的身心，来自多年的磨砺，人放松，心放平，让生活轻松，让生命丰厚。活着就是一种修行，看开处处充满生机，看透天天都是春季。人生没有假设，没有如果，过去的是永远，当下才是全部。用一颗平常心，平凡的活着，梦自己所梦，想自己所想，爱自己所爱。珍惜身边的幸福，欣赏自己的拥有，背不动的就放下，伤不起的就看淡，想不通的就丢开，恨不过的就抚平。人生本来就不易，生命本来就不长，何必用无谓的烦恼，作践自己，伤害岁月。从容达观一些，轻松自在一些，豁达随意一些。"
  },
  article2: {
    name: '文章 2',
    value: 'article-2',
    type: ArticleType.article,
    content: "岁月中，人们奔波进取，于坎坷间洒满汗水，脸上身上全是疲惫。尘世间，人们期盼美好，憧憬美好，鲜有如愿以偿。累了悄悄藏在心底，痛了默默流泪，多少难言的苦楚，于泪中轻轻释放。生活，就是这样，想好的，不知不觉慢慢就变了，说好的，走着做着渐渐就改变了。尘埃落定，时过境迁，你才理解错失，感到痛惜。烟消云散，物是人非，你才明白过失，感到惋惜。原来，事到临头，所有的感叹都变成伤痕，情到尽头，所有的情绪都变成疼痛。命穿过四季，便体会了风霜雪雨，缘分经过聚散，便沉淀了真情实意，感情走过岁月，便领悟了人情冷暖。真爱你的人，会不离不弃，路过你的人，只是一时痴迷。许多的话，不要用耳朵听，而是用心听，许多的人，不要用眼睛看，而是用心看。热烈的未必长久，淡然的未必无心，陪你到最后的，才是真爱你的人。人生在世，谁都不易，生活在外，谁都有泪。即使身受挫折，蒙受不白，也不要轻易放弃。就算人受伤害，心受打击，也不要刻意报复。因为，放弃意味着屈服，报复说明还在嫉恨。人累了常常疲惫，心累了常常流泪，生活中那些累，半是自己，半是生活。生活不是用来对立的，人生不是用来争斗的，将心比心，都能想通，以情换情，谁也明白，要懂得理解才能心安，包容才会心宽。人生在世，难免不顺，难免委屈，难免被人误解，被人说三道四。"
  },
  article3: {
    name: '文章 3',
    value: 'article-3',
    type: ArticleType.article,
    content: "这一辈子，说来容易，听来简单，做起来很难。并不是每一片土地都生长希望，并不是每一次努力都能成功。有些事别人做起来容易，你未必能做的好，有些路别人走得很顺，你未必能行的通。与其效仿最精彩的别人，不如做最真实的自己，走好自己选择的路，做好自己份内的事，爱好自己想爱的人。于事不执，于心不著，简单自然，尽心随缘。生活是苦乐的堆积，苦中有乐，人生是悲喜的聚集，悲中有喜。平淡的日子里，我们都有自己的心事，平凡的人生中，我们都有自己的轨迹。不论欢乐还是悲喜，我们都在规划着自己的前程，探索着自己的未来。有时，生活就是一种妥协，一种忍让，一种迁就。并不是所有的事情，都适宜针锋相对，铿锵有力，多彩的生活，既有阳光明媚，也有倾盆大雨。命是自己的，生活也是自己的，不要把太多的时间浪费在和别人的对比上。妥协不一定全是软弱，忍让不一定就是无能，和为贵，有时，迁就忍让也是一种智慧。懂得欣赏自己的生活，才能让自己活得随心所欲。如果能用和自己赛跑，不要和别人比较的态度来面对生活，我们就会轻松许多，也更容易找到幸福的入口。日子匆匆忙忙，脚步跌跌撞撞，生活忙忙碌碌，我们总渴望如意，期盼完满。但是，生活中总有诸多遗憾，诸多失望，诸多不如意。活着、经历着、坚持着，只有心的强大，放下心中负累，没必要将苦涩强行咽下，也没必要怨天尤人。"
  },
  article4: {
    name: '文章 4',
    value: 'article-4',
    type: ArticleType.article,
    content: "有些事情，拿不起就选择放下，有些东西，要不得就把它放弃。有些理念，想不通就不去理会，有些过客，留不住就让其离开，有些感情，理不顺就忍痛割舍。过去的一页，能不翻就不要翻，翻落了灰尘会迷了眼。学会忘记，懂得放弃，别为昨天的事烦恼，别为无谓的事伤心。人活的就是一种心情，日子要的就是一种顺心。地之间，风有风的心情，云有云的心语。万物之中，蝶有蝶的舞蹈，蜂有蜂的歌谣，谁都不是谁的海岸，谁都不是谁的港湾。你有你的梦呓，我有我的故事，不管是悲是喜，是聚是离。生活的路，不通时学会拐弯，心情的结，不开时学会忘记。棘手的事，难做时学会放下，欲去的缘，渐远时选择随意。有些事，摆一摆就过去了，有些人，狠一狠就忘记了。有些情，淡一淡就释然了，有些累，停一停就休歇了。有些苦，笑一笑就冰释了，有颗心，伤一伤就坚强了。学会爱自己，学会独立，告别依赖，幸福是自己内心的感觉，而不是别人的给予。拥有健康的体魄，在快乐的心境中做自己，做自己喜欢做的事情，走自己选择的路，就是人生最大的幸福。活着就会有落寞，前行就会有坎坷，动心就会有情伤。一个人一生的成就，并不是你拥有多少财富，事业多么辉煌。而是你爱过多少人，善待过多少人，有多少人怀念你，有多少人记得你。"
  },
  article5: {
    name: '文章 5',
    value: 'article-5',
    type: ArticleType.article,
    content: "活着，不是为了缅怀昨天，而是为了憧憬明天，等待希望。既然活着，就要沉得住气，弯得下腰，抬得起头。活的自信，活的有尊严，活的踏实稳健，活的品味自然，活的气质不凡。活的可圈可点，活的诗意浪漫，活的轻松温婉，活的快乐康健，活的意义非凡。生活中，总有许多美好无法挽留，人生中，总有许多追求难以割舍。是你的走不了，不是你的留不住，想开看淡，放松。活着就该尽力活好，别让自己活的人累、心苦。生命太短，日子太忙，人生太累，该放的时候要舍得放下，该弃的时候要毅然决绝。别羡别人辉煌，别慕他人美好，别怪世态炎凉，别怨世人虚伪。事经历了，心就坚强，坎跨过了，心就敞亮其实，苦乐的根源是我们的心，一些事，想开了自然微笑，看透了肯定放下，人生的路上不是每轮艳阳都暖人，不是每片云彩都下雨，我们掌控不了命运的走向，从容地走过每一天，何必那么地执着，脚踏实地的走，坦荡快乐的活，难道不好吗？",
  }
}
// 按键记录
class KeyCount {
  constructor() {
    this.all        = 0;
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
}

class CETWord{
  constructor(word, translation) {
    this.word = word;
    this.translation = translation;
  }
}
// 跟打器参数
class Config {
  constructor() {
    this.chapter           = 1;                       // 当前段号
    this.chapterTotal      = 1;                       // 总段数
    this.isShuffle         = false;                   // 是否乱序模式
    this.isInEnglishMode   = false;                   // 是否处于英文打字状态
    this.count             = '15';                    // 单条数量
    this.articleName       = ARTICLE.top500.name;     // 文章名称
    this.articleIdentifier = 'top500';                // 文章标识
    this.article           = ARTICLE.top500.content;  // 文章内容
    this.darkMode          = false;                   // 暗黑模式
    this.articleType       = ArticleType.character;   // 文章类型
    this.localStorageLabel = {
      chapter             : 'type_pad_config_chapter',
      chapterTotal        : 'type_pad_config_chapter_total',
      isShuffle           : 'type_pad_config_is_shuffle',
      isInEnglishMode     : 'type_pad_config_is_in_english_mode',
      count               : 'type_pad_config_count',
      articleIdentifier   : 'type_pad_config_article_identifier',
      articleName         : 'type_pad_config_article_name',
      article             : 'type_pad_config_article',
      darkMode            : 'type_pad_config_dark_mode',
      articleType         : 'type_pad_config_article_type',
    }
  }

  save(){
    localStorage[this.localStorageLabel.chapter]              = this.chapter;
    localStorage[this.localStorageLabel.chapterTotal]         = this.chapterTotal;
    localStorage[this.localStorageLabel.isShuffle]            = this.isShuffle;
    localStorage[this.localStorageLabel.isInEnglishMode]      = this.isInEnglishMode;
    localStorage[this.localStorageLabel.count]                = this.count;
    localStorage[this.localStorageLabel.articleIdentifier]    = this.articleIdentifier;
    localStorage[this.localStorageLabel.articleName]          = this.articleName;
    localStorage[this.localStorageLabel.article]              = this.article;
    localStorage[this.localStorageLabel.darkMode]             = this.darkMode
    localStorage[this.localStorageLabel.articleType]          = this.articleType

  }
  get(){
    this.chapter            = Number(localStorage[this.localStorageLabel.chapter]);
    this.chapterTotal       = Number(localStorage[this.localStorageLabel.chapterTotal]);
    this.isShuffle          = Boolean(localStorage[this.localStorageLabel.isShuffle]  === 'true');
    this.isInEnglishMode    = Boolean(localStorage[this.localStorageLabel.isInEnglishMode]  === 'true');
    this.count              = localStorage[this.localStorageLabel.count];
    this.articleIdentifier  = localStorage[this.localStorageLabel.articleIdentifier];
    this.articleName        = localStorage[this.localStorageLabel.articleName];
    this.article            = localStorage[this.localStorageLabel.article];
    this.darkMode           = Boolean(localStorage[this.localStorageLabel.darkMode]  === 'true');
    this.articleType        = localStorage[this.localStorageLabel.articleType];
  }

  setWithCurrentConfig(){
    $('#mode').checked = this.isShuffle;
    let radios = document.querySelectorAll('input[name=count]');
    for (let i=0; i<radios.length; i++){

      if (this.count === 'ALL') {
        radios[i].checked = radios[i].value === this.count
      } else {
        radios[i].checked = radios[i].value === this.count
      }
    }
    $('#article').value = this.articleIdentifier;
    currentOriginWords = this.article.split('');


    // English Mode
    if (this.isInEnglishMode){
      engine.englishModeEnter()
    }

    // Dark Mode
    let body = $('body');
    if (this.darkMode){
      body.classList.add('black');
    } else {
      body.classList.remove('black');
    }
    let darkButton = $('#darkButton');
    darkButton.innerText = this.darkMode ? '白色' : '暗黑'
  }

  // 判断是否存储过配置信息
  hasSavedData(){
    return Boolean(localStorage[this.localStorageLabel.articleIdentifier]);
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
    if (config.chapter !== 1){
      if (config.articleType === ArticleType.word) {
        let tempSubArray = arrayWordAll.slice(config.count * (config.chapter - 2), config.count * (config.chapter - 1)); // 截取当前需要显示的数组段
        let arrayCurrentWord = tempSubArray.map(item => {
          return item.word
        }); // 取到英文，数组
        currentWords = arrayCurrentWord.join(' ');
      } else {
        currentWords = currentOriginWords.slice(config.count * (config.chapter - 2), config.count * (config.chapter - 1)).join('');
      }
      config.chapter--;
      engine.reset();
      config.save();
    }
  }

  // 下一段
  nextChapter(){
    if (config.chapter !== config.chapterTotal) {
      if (config.articleType === ArticleType.word) {
        let tempSubArray = arrayWordAll.slice(config.count * config.chapter, config.count * (config.chapter + 1)); // 截取当前需要显示的数组段
        let arrayCurrentWord = tempSubArray.map(item => {
          return item.word
        }); // 取到英文，数组
        currentWords = arrayCurrentWord.join(' ');
      } else {
        currentWords = currentOriginWords.slice(config.count * config.chapter, config.count * (config.chapter + 1)).join('');
      }

      config.chapter++;
      engine.reset();
      config.save();
    }
  }

  // 改变文章内容
  changeArticle() {
    let articleNameValue = $('#article').value;
    let article = ARTICLE[articleNameValue];
    config.articleIdentifier = articleNameValue;
    config.articleName = article.name;
    let content = article.content;
    config.articleType = article.type;
    switch (config.articleType) {
      case ArticleType.character:
        currentOriginWords = config.isShuffle ? shuffle(content.split('')) : content.split('');
        config.article = currentOriginWords.join('');
        engine.englishModeLeave();
        break;
      case ArticleType.article:
        config.article = content;
        currentOriginWords = config.article.split('');
        engine.englishModeLeave();
        break;
      case ArticleType.english:
        config.article = content;
        engine.englishModeEnter();
        currentOriginWords = config.article.split('');
        break;
      case ArticleType.word:
        config.article = content;
        engine.englishModeEnter();
        arrayWordAll = gettWordsArrayWith(content);
        currentOriginWords = config.article.split('');
        break;
      default: break;
    }
    this.changePerCount();
  }

  // 改变数字时
  changePerCount(){
    let originTol = 0;
    config.count = $('input[type=radio]:checked').value;

    if (config.articleType === ArticleType.word){ // CET 单词时，count 为单词数
      let count = config.count === 'ALL' ? arrayWordAll.length : config.count;
      let arrayCurrentWord = [];
      for (let i = 0; i< count; i++){
        arrayCurrentWord.push(arrayWordAll[i].word);
      }
      currentWords = arrayCurrentWord.join(' ');
      originTol = arrayWordAll.length / Number(config.count);

    } else {
      if (config.count === 'ALL'){
        currentWords = currentOriginWords.join('');
      } else {
        currentWords = currentOriginWords.slice(0, Number(config.count)).join('');
      }
      originTol = currentOriginWords.length / Number(config.count);

    }
    config.chapter = 1;
    let tempTol = Math.floor(originTol);
    if (config.count === 'ALL') {
      config.chapterTotal = 1
    } else {
      config.chapterTotal = originTol > tempTol ? tempTol + 1 : tempTol;
    }

    config.save(); // save config
    this.reset();
    this.updateInfo();
  }
  // 切换乱序模式
  shuffleCurrentArticle() {
    config.isShuffle = $('#mode').checked;
    if (config.articleType === ArticleType.english) {

    } else {
      currentOriginWords = config.isShuffle ? shuffle(ARTICLE[config.articleIdentifier].content.split('')) : ARTICLE[config.articleIdentifier].content.split('');
      config.article = currentOriginWords.join('');
      currentWords = currentOriginWords.slice(0, Number(config.count)).join('');
      config.chapter = 1;
    }

    config.save(); // save config
    this.reset();
    this.updateInfo();
  }

  // 对比上屏字
  compare(){
    correctWordsCount = 0;
    let typedWords = typingPad.value;
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
      origin = origin ? origin : ' '; // 当输入编码多于原字符串时，可能会出现 undefined 字符，这个用于消除它
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
    });
    let untypedString = currentWords.substring(arrayTyped.length)
    let untypedHtml = `<span class='${untypedStringClassName}'>${untypedString}</span>`;
    html = html.concat(untypedHtml)
    template.innerHTML = html;

    // 滚动对照区到当前所输入的位置
    let offsetTop = $('.' + untypedStringClassName).offsetTop;
    templateWrapper.scrollTo(0, offsetTop - HEIGHT_TEMPLATE / 2);
  }

  englishModeEnter(){
    typingPad.classList.add('english');
    template.classList.add('english');
    config.isInEnglishMode = true;
    config.save();
  }
  englishModeLeave(){
    typingPad.classList.remove('english');
    template.classList.remove('english');
    config.isInEnglishMode = false;
    config.save();
  }

  // 更新时间
  showTime(){
    if (this.isStarted){
      let secondAll = this.duration / 1000;
      let minute = Math.floor(secondAll / 60);
      let second = Math.floor(secondAll % 60);
      $('.minute').innerText = minute >= 10? minute : `0${minute}`;
      $('.btn-minute').innerText = minute >= 10? minute : `0${minute}`;
      $('.second').innerText = second >= 10? second : `0${second}`;
      $('.btn-second').innerText = second >= 10? second : `0${second}`;
    } else {
      $('.minute').innerText = '00';
      $('.btn-minute').innerText = '00';
      $('.second').innerText = '00';
      $('.btn-second').innerText = '00';
    }
  }

  // 暂停
  pause(){
    this.isPaused = true;
    typingPad.blur();
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
    if (config.articleType !== ArticleType.english) {
      let array = currentWords.split('');
      currentWords = shuffle(array).join('');
      template.innerText = currentWords;
      engine.reset();
      this.isFinished = false;
      this.updateInfo();
    }
  }

  // 重置计数器
  reset(){
    record = new Record();
    template.innerHTML = currentWords;
    this.isPaused = false;
    this.isStarted = false;
    this.isFinished = false;
    typingPad.value = '';
    keyCount.reset();
    this.updateInfo();
    this.stopRefresh();
    this.showTime();
    templateWrapper.scrollTo(0, 0);
  }

  // 当前段打完
  finish(){
    this.isStarted = false;
    this.isFinished = true;
    this.stopRefresh();
    this.timeEnd = (new Date()).getTime();
    this.duration = this.timeEnd - this.timeStart;
    // update record
    record.backspace = keyCount.backspace;
    record.timeStart = this.timeStart;
    record.duration = this.duration;
    record.wordCount = currentWords.length;
    this.updateInfo();
    database.insert(record);
  }

  // 更新界面信息
  updateInfo() {
    // COLOR
    if(engine.isStarted && !engine.isPaused){
      $('.time').classList.add('text-green');
    } else {
      $('.time').classList.remove('text-green');
    }

    // KEY COUNT
    for (let type in keyCount){
      $(`.word-${type} p`).innerText = keyCount[type];
    }
    $('.count-total').innerText = currentWords.length;
    $('.count-current').innerText = typingPad.value.length;

    //
    // SPEED
    //
    if (!engine.isStarted && !engine.isFinished) {
      $('.speed').innerText = '--';
      $('.btn-speed').innerText = '--';
      $('.count-key-rate').innerText = '--';
      $('.count-key-length').innerText = '--';
      $('.count-key-backspace').innerText = '--';

    } else {
      // speed
      record.speed = (correctWordsCount / engine.duration * 1000 * 60).toFixed(2);
      $('.speed').innerText = record.speed;
      $('.btn-speed').innerText = record.speed;

      // key count
      let allKeyCount = keyCount.all - keyCount.function;
      record.hitRate = (allKeyCount / engine.duration * 1000).toFixed(2);
      $('.count-key-rate').innerText = record.hitRate;

      // code length
      if (correctWordsCount) {
        record.codeLength = (allKeyCount / correctWordsCount).toFixed(2);
      } else {
        record.codeLength = 0;
      }
      $('.count-key-length').innerText = record.codeLength;

      // backspace count
      $('.count-key-backspace').innerText = keyCount.backspace;
    }

    //
    // OPTION
    //
    $('.chapter-current').innerText = config.chapter;
    $('.chapter-total').innerText = config.chapterTotal;
  }
}

// 成绩记录
class Record {
  constructor(speed, codeLength, hitRate, backspace, wordCount, articleName,  timeStart, duration) {
    let index = localStorage[localStorageIndexName];
    this.id = index? Number(index) : 1;
    localStorage[localStorageIndexName] = this.id;
    this.speed = speed;
    this.codeLength = codeLength;
    this.hitRate = hitRate;
    this.backspace = backspace;
    this.wordCount = wordCount;
    this.articleName = articleName
    this.timeStart = timeStart;
    this.duration = duration;
  }

  getHtml(){
    let level = Math.floor(this.speed/SPEED_GAP);
    level = level > 6 ? 6 : level; // 速度等级为 6+ 时按 6 处理
    let articleType = ArticleType.getTypeNameWith(config.articleType);
    let textClass = '';
    switch (config.articleType) {
      case ArticleType.character: textClass = 'text-orange';break;
      case ArticleType.english: textClass = 'text-green';break;
      case ArticleType.article: textClass = 'text-blue';break;
      case ArticleType.word: textClass = 'text-red';break;
      default: break;
    }
    return `<tr>  
              <td class="text-center roboto-mono">${this.id}</td> <!--id-->
              <td class="bold roboto-mono lv-${level}">${this.speed}</td> <!--速度-->
              <td>${this.codeLength}</td><!--码长-->
              <td>${this.hitRate}</td><!--击键-->
              <td>${this.backspace}</td><!--回退-->
              <td>${this.wordCount}</td><!--字数-->
              <td class="text-center ${textClass}">${articleType}</td><!--文章类型-->
              <td>${config.articleName}</td><!--文章名称-->
              <td class="hidden-sm">${dateFormatter(new Date(this.timeStart))}</td><!--开始时间-->
              <td class="time">${formatTimeLeft(this.duration)}</td><!--用时-->
              <td><button class="btn btn-danger btn-sm" onclick="database.delete(${this.id}, this)" type="button">删除</button></td>
            </tr>`;
  }
  getHtmlWithCursor(cursor){
    let level = Math.floor(cursor.value.speed/SPEED_GAP);
    level = level > 6 ? 6 : level;
    let articleType;
    let textClass = '';
    switch (cursor.value.articleType) {
      case ArticleType.character:articleType = '单字';textClass = 'text-orange';break;
      case ArticleType.english:articleType = '英文';textClass = 'text-green';break;
      case ArticleType.article:articleType = '文章';textClass = 'text-blue';break;
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
              <td><button class="btn btn-danger btn-sm" onclick="database.delete(${cursor.key}, this)" type="button">删除</button></td>
            </tr>`;
  }
}

// IndexDB
class Database {
  // 添加数据
  insert(record){
    let request = DB.transaction([OBJECT_NAME], 'readwrite')
      .objectStore(OBJECT_NAME)
      .add({
        id: record.id,
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
      localStorage[localStorageIndexName] = Number(localStorage[localStorageIndexName]) + 1;
      // 插入最后的数据到顶部
      let tr = document.createElement('tr');
      tr.innerHTML = record.getHtml();
      let tbody = $('tbody');
      tbody.insertBefore(tr, tbody.firstChild);
    }

    request.onerror = e => {
      show(e);
      show('insert data error')
    }
  }

  // 获取所有数据
  fetchAll(){
    let objectStore = DB.transaction([OBJECT_NAME], 'readwrite').objectStore(OBJECT_NAME);
    let html = '';
    let currentCursor = objectStore.openCursor(IDBKeyRange.upperBound(record.id), "prev").onsuccess = e => {
      let cursor = e.target.result;
      if (cursor) {
        html = html + record.getHtmlWithCursor(cursor);
        document.querySelector('tbody').innerHTML = html;
        cursor.continue(); // 移到下一个位置
      }
    }
  }

  // 删除一条数据
  delete(id, sender){
    let objectStore = DB.transaction([OBJECT_NAME], 'readwrite').objectStore(OBJECT_NAME);
    objectStore.delete(id).onsuccess = e => {
      show(`delete data ${id} success`);
      sender.parentElement.parentElement.remove();
      this.fetchAll();
    };
  }

  // 清除记录
  clear(sender){
    if (sender.innerText !== '确定清除'){
      sender.innerText = '确定清除';
      sender.classList.add('danger');
    } else {
      let objectStore = DB.transaction([OBJECT_NAME], 'readwrite').objectStore(OBJECT_NAME);
      let that = this;
      objectStore.clear().onsuccess = e => {
        localStorage[localStorageIndexName] = 1;
        that.fetchAll();
        location.reload();
      };
    }
  }
}

const template        = $('.template p'); // 对照区主 EL
const templateWrapper = $('.template');   // 对照区 容器
const SPEED_GAP       = 30;               // 速度阶梯，每增30新增一个颜色

let correctWordsCount = 0;
let currentWords = '';
let currentOriginWords = [];
let arrayWordAll = [];
let arrayWordCurrent = [];

const typingPad = $('#pad');
let keyCount = new KeyCount();
let engine = new Engine();
let config = new Config();
let record = new Record();


// database
let DB;
const DBName = "TypePad";
let database = new Database();
const OBJECT_NAME = 'TypingRecord';


// 初始化
window.onload = () => {
  // 载入文章选项列表
  loadArticleOptions();

  // 最开始的时候，如果没有检测到存储的数据，初始化
  if (config.hasSavedData()){
    config.get();
    config.setWithCurrentConfig();
  } else {
    config.save();
    config.get();
    config.setWithCurrentConfig();
    engine.changePerCount();
  }

  // init
  // CET 时
  if (config.articleType === ArticleType.word) {
    arrayWordAll = gettWordsArrayWith(config.article);
    let tempSubArray = arrayWordAll.slice(Number(config.count) * (config.chapter - 1), Number(config.count) * (config.chapter)); // 截取当前需要显示的数组段
    let arrayCurrentWord = tempSubArray.map(item => {return item.word}); // 取到英文，数组
    currentWords = arrayCurrentWord.join(' ');
  } else {
    currentWords = currentOriginWords.slice(Number(config.count) * (config.chapter - 1), Number(config.count) * (config.chapter)).join('');
  }
  template.innerText = currentWords;
  engine.updateInfo();

  typingPad.onblur = () => {
    if (engine.isStarted && !engine.isPaused){
      engine.pause();
    }
  }
  typingPad.onfocus = () => {
    if (engine.isStarted && engine.isPaused){
      engine.resume();
    }
  }

  // INDEX DB
  let request = window.indexedDB.open(DBName);
  request.onsuccess = e =>{
    if (e.returnValue){
      DB = request.result;
      database.fetchAll();
    } else {
    }
  }

  request.onerror = e => {
    show(e);
  }

  request.onupgradeneeded = e => {
    if (DB){
    } else {
      DB = request.result;
    }
    var objectStore = DB.createObjectStore(OBJECT_NAME, { keyPath: 'id' });
  }

  // 按键过滤器
  /****
   **** ⌘ + R: 重打当前段
   **** ⌘ + L: 打乱当前段
   **** ⌘ + N: 下一段
   **** ⌘ + P: 上一段
   **** ⌘ + H: 重新开始
   ****/
  typingPad.onkeydown = e => {
    if (e.key === 'Tab' || ((e.metaKey||e.ctrlKey) && (/[nqwefgplt]/.test(e.key))))
    {
      e.preventDefault();
    } else if ((e.metaKey||e.ctrlKey) && e.key === 'y') {
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
    } else if (e.key === 'Escape') {
      engine.pause();
      e.preventDefault();
    } else if (REG.az.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey && !engine.isStarted && !engine.isFinished){
      engine.start()
    }
  }
  typingPad.onkeyup = e => {
    e.preventDefault();
    if (!engine.isFinished && engine.isStarted){
      countKeys(e);
      engine.compare();
      // 末字时结束的时候
      if (typingPad.value.length >= currentWords.length){
        if (typingPad.value === currentWords) {
          engine.finish();
        }
      }
    }
  }
  typingPad.oninput = e => {
    if (!engine.isFinished && engine.isStarted){
      engine.compare();
      // 末字时结束的时候
      if (typingPad.value.length >= currentWords.length){
        if (typingPad.value === currentWords) {
          engine.finish();
        }
      }
    } else if (!engine.isFinished) {
      engine.start()
    }
  }
}
// Count Key
function countKeys(e) {
  for (let type in keyCount){
    if ( typeof(keyCount[type]) !== 'function' ){
      if (REG[type].test(e.key)){
        keyCount[type]++
      }
    }
  }
}

// 由文章获取所有单词数组
function gettWordsArrayWith(content){
  let tempArray = content.split('\t\t');
  let tempArrayAll = [];
  tempArray.forEach(item => {
    let wordArray = item.split('\t');
    tempArrayAll.push(new CETWord(wordArray[0], wordArray[1]));
  })
  return tempArrayAll
}

// 载入文章列表选项
function loadArticleOptions() {
  let optionHtml = '';
  for (let itemName in ARTICLE){
    let article = ARTICLE[itemName];
    let tempHtml = `<option value="${itemName}">${ArticleType.getTypeNameWith(article.type)} - ${article.name}</option>`;
    optionHtml += tempHtml;
  }
  $('#article').innerHTML = optionHtml;
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
/**
 * 格式化时间，输出字符串
 *
 * @param   date    要格式化的时间
 * @param   formatString    返回时间的格式：
 * @return  格式化后的时间字符串
 * */
function dateFormatter (date, formatString) {
  formatString = formatString? formatString : 'yyyy-MM-dd hh:mm:ss';
  let dateRegArray = {
    "M+": date.getMonth() + 1,                      // 月份
    "d+": date.getDate(),                           // 日
    "h+": date.getHours(),                          // 小时
    "m+": date.getMinutes(),                        // 分
    "s+": date.getSeconds(),                        // 秒
    "q+": Math.floor((date.getMonth() + 3) / 3), // 季度
    "S": date.getMilliseconds()                     // 毫秒
  };
  if (/(y+)/.test(formatString)) {
    formatString = formatString.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
  }
  for (let section in dateRegArray) {
    if (new RegExp("(" + section + ")").test(formatString)) {
      formatString = formatString.replace(RegExp.$1, (RegExp.$1.length === 1) ? (dateRegArray[section]) : (("00" + dateRegArray[section]).substr(("" + dateRegArray[section]).length)));
    }
  }
  return formatString;
}
/**
 * @param：timeLeft 倒计时秒数
 * @return：输出倒计时字符串 时时:分分:秒秒
 **/
function formatTimeLeft(timeLeft){
  timeLeft = Math.floor(timeLeft / 1000);
  let mins = Math.floor(timeLeft / 60);
  let seconds = timeLeft % 60;
  return `${mins.toString().padStart(2,'00')}:${seconds.toString().padStart(2,'00')}`;
}
function enterDarkMode(sender){
  let body = $('body');
  if (config.darkMode){
    body.classList.remove('black');
    config.darkMode = false;
    sender.innerText = "暗黑"
    config.save();
  } else {
    body.classList.add('black');
    config.darkMode = true;
    sender.innerText = "白色"
    config.save();
  }
}


// TODO: 移动端滚动，对照区高度大小定义