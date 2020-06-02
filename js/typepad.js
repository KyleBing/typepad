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
  getTypeNameWith(type){
    switch (type) {
      case this.article    : return '文章';
      case this.english    : return '英文';
      case this.character  : return '单字';
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
    type: ArticleType.english,
    content: "sincere mood static senator hobby lad equip frown fasten software stir distribution flexible solution panel ministry supreme describe limb circumstance core assistant mess minus statistic pregnant sector detection statue bride cycle saucer skillful civilization overhead clash grant bond staff intermediate guitar comprehensive presence appliance cushion emergency solve label slim status steady include resistance prime ambassador derive sponsor proportion mental punch result client steamer option dormitory attitude steep agency steer scandal definite cautious prayer nest domestic chest airline rebel satisfactory stem render object gardener shrink parade rumour rug establish primarily kindness breast sticky boost fund incredible abroad detective stiff stimulate fame consume accelerate lightning sting bound rouse cultivate material personnel display particle frog impression biology drunk barrier stock fisherman politician royal barber stocking delegate highlight depression signature atmosphere evaluate rescue personality latter parliament input partial loyalty calendar overlook debate stoop cube submerge credit surrounding stove submit carrier imply strain consist strap efficient accommodation strategic layer exclaim representative forecast discipline neutral interpret knot desirable promote acceptance mayor equation routine ripe prove likewise chap explore overnight strategy straw bind stream bearing suppose access remain abstract stretch approximate striking abuse critic interpretation string illustrate helpful leak accountant crude product strip stripe communicate following hedge consumer emotional craft institute indispensable scheme scale replace bark gramme congress bump stroke ingredient arbitrary pinch exploit action ash rope bulk strengthen independent board recall studio grave eve formal absorb sensitive ability fairy talent comparison stuff brow infer invasion grand stress journalist supply penetrate subject pole raw embassy carpenter appropriate socialist protein enlarge inherit chemist conflict drain architecture charity entitle subsequent span pea instruct spite slender automobile behavior envy substance contest spit mutual dorm substantial meanwhile desire conviction interaction menu frustrate belief confusion civilize preface chemical horizontal invitation auto electric purse blank courtyard rural discourage reflection rainbow slide removal missing graph fortnight disgust offense allow proportional devote empire microphone subtract pace gesture loop sheer cupboard sore raid lower comment distress publicity spin museum outstanding rack rent housing complain evidently lung deny ownership rid harness acknowledge passion genuine imaginary prompt invention lucky confidence suburb industrialize fearful intelligence childhood crush intention finding subway magnet defect attribute release succession chip similar maintain advertisement privilege dull provoke function substitute extreme orbit correspondent fashionable allowance component interrupt successive external somehow declaration distribute specialist rotate rod suck negative suffer sufficient court curl bureau moist relative suggestion restless delivery claim suicide dip profit lease disposal appeal cart stable married reckon practically reception jury glory mist congratulate sum execute essay route merit local compromise rally feather characterize explode aware grain kettle summarize faulty highly summary conservation summit reward available specialize structure resident boundary radical leading rag prescribe demonstrate manner sunrise construct railway opportunity lag fade sunset singular broom beneath recreation procession tackle combination hell proof resort recruit contrast sunshine introduction ancestor split painful superb interest noticeable graduate glance bloody fierce paragraph enquire preparation justice drip emit superficial recommendation sole folk rank motor airport enclose bounce occasion determine advisable permission statement award bold so called superior sunlight alternative kingdom mobile damn storage supplement locate cabin majority receiver support bible assign episode fatal pad excursion ignorant county condense heal asset involve rear hollow charter leadership shallow procedure impressive controversial curve spiritual astonish fold alert condition segment cabbage condemn mild surgery leisure accomplish plug presentation surplus cassette surround private bulb meaning annual expansion eliminate horn responsibility dam challenge alike phenomenon survey curtain household survival medal invest survive awkward synthetic manufacture curse suspect suspend tide crossing tour barely cope gap oppose deadline automatic joint surrender rude faint conference issue swallow interior calculator analyse hazard miracle sway editorial recognition librarian analysis kid partner swear center tidy passport swell link brave swift prohibit approve swing ideal arrest landscape represent audience switch sword spot symbol sanction bucket poetry fibre pension beggar illustration liable bunch management sympathize session delicious breeze imitate infant sympathy advantage considerable spur religious banner nylon exceedingly symptom pillar outcome journey forehead conscience precise cable screw gang favour constitute squeeze system culture missile cast marxist prior dye graceful onion seal saint hesitate crawl contribute fascinating entertainment cigarette immense outer revolutionary fabric ridge mass competent conclusion bang curious pulse encounter concern preposition pond provision reinforce systematic al rail pat rational flee response executive tag means nephew motivate failure consistent nowhere sympathetic sketch calm tame cancel pray target camel technician setting technique tax emerge capable technology selfish definition per participate tedious anxious famine fundamental plural anticipate teenager compress pepper discharge telescope temper extensive amuse current mask musician temple decay criticism feedback accordance perceive scarcely clay intelligent conductor frequency attractive garlic temporary recognize puzzle elevator acquisition absolute frank hip polish democratic temptation disguise glue solemn tend democratic temptation disguise glue solemn tend observer retreat relevant precision admit jungle thoughtful apartment afterward entire carbon chamber realm ratio capture baseball boring crowd sample estate threat reliable constant sustain horsepower suspicion prospect conduct lawn transmit pollution slip influential handle threaten aircraft thrive harm similarly prominent signal encourage recession commitment monitor spark mug absence appreciate bean elastic presumably bargain significant throat extend comparable container chief instant thrust thumb honey enforce ease thunder living monument assess panic blanket drift normally dismiss deputy acre contract anniversary mainland expose policy machinery exert collection gasoline dispose arouse rage inward series roast timber reluctant license upright author mission growth attack furnish pretend concentrate institution flat tissue delicate upper gram crown title convey mount toast tolerance amongst slice dairy consultant multiply naked centigrade measurement precaution allocate certificate agenda electronic alongside conventional topic renew torch clap conservative copyright establishment layout auxiliary major legislation moisture nationality foundation gulf assistance combat exhibit donation fragment reverse apply reform generally electron distinct priority elementary towel opera digital artistic elderly crack christ evidence naturally mechanic trace expand laughter compass lean minister duration comprehension tractor tradition compete goodness tragedy offend instinct retire professional bullet trail prosperity pants minor shortage equality jealous dominate inspect generator lorry cue transfer farewell revenue transform hay advocate modify fantastic complicated historic specify translation prosperous baggage pour transmission obtain enthusiasm equivalent assemble slope secondary assume awful process lick overcome motion crucial priest transparent illegal fancy conscious transport contemporary chill breadth flood species necessity scare scientific transportation regardless create diagram valid copper estimate carriage mat cashier sensible faithful trap intensity remedy hearing decent historical confine gymnasium academy definitely recorder sour fruitful expectation disappear trash bleed carrot tray realistic retain fortunately comb reference treatment powerful positive owing appoint artificial project treaty emphasis select tremble attraction abundant faith mathematical navy tremendous dominant proposal magnetic harden trend elaborate bat triangle literary jail design script saddle lest creep afford trial inn choke dental council portion lodge troop vague tropical coil benefit troublesome female pose truly peculiar export resume portrait utter bacteria idle pledge exchange emotion harsh exposure saving reasonable trumpet applause nonsense fantasy usage finance exaggerate trunk grocer cruise initial railroad tube attain devise density tune source shrug daylight tunnel site turbine handy background tutor sauce combine pill bay ceremony formula reservior delete pump backward twist range niece protest centimetre predict acquaintance learning spider counsel commit typewriter sin sow companion destination typical corresponding donkey frontier outlook typist apart additional consequence nevertheless dirt lobby occasional doubtful committee tyre ugly parallel cooperate appetite impose invade controversy confident nursery fraction cabinet amid manufacturer independence academic evolve exception dictation profession authority deposit enquiry differ argument memorial faculty dim moreover earnest heroic umbrella orchestra arithmetic basically battery heel oblige convict respond cite discard grab deceive senior modest continuous comprise revolt expense campus mold insure cash virtue violent react odd diverse manual uncover ban confront undergo journal emperor undergraduate circular dictate inform underground hook underline male proceed hydrogen force fog fluid drill understanding nitrogen commission jaw undertake salary skilled assembly merry undo undoubtedly globe uneasy precious mosquito petroleum favourable sightseeing economic multiple poverty rely effort accumulate cheat humorous rare rival echo investment collapse corridor despite pit counter balcony diplomatic cigar bathe conquer inflation thermometer worthwhile scenery terror average democracy slap obstacle occur nuisance significance up to date justify neglect membership union roller formation punctual relieve candy spokesman employer unique mathematics herd cheerful advertise reflexion unite secure mineral universal lane beloved adapt mislead drag flash immigrant remarkable increasingly indoor palm exclusive namely universe burst preferable filter anyhow score qualify global heave unless excessive marine behalf advanced soda unlike adjust unload leader spelling accordingly anxiety ridiculous unusual scholarship divorce headquarters commerce torture fashion incident upset underneath recover theory evolution myth trim mud unfortunately relate extraordinary debt urge urgent qualification satellite publication cliff restrain commander carpet peer highway breed ensure requirement attempt flock largely restraint focus protective utility jet coordinate restore receipt contrary christian hardware bloom dragon specimen chew utmost original religion communication beyond vacant conclude restrict respectively fairly sailor remark assure balance campaign psychological contradiction dose vacation immediately vacuum ore clause cattle barn laser initiative compel basis contact guarantee semiconductor rib obvious geometry butcher triumph maid eyesight interview vain paste soak exceed boom item hammer metric jar resource compose military package van besides injection laboratory vanish experimental mysterious sake keen vapour haste magic poisonous aid coach decrease relief continual slight stare grace band mechanical considerate ditch ignorance balloon brake data bake gear patient altitude inquiry implement remind pint engine bid scout mould avenue instance career fountain format correspond clarify mercy expression exact decade dimension vision unity vigorous via skim severe conquest improve variety election expert dive various rifle stake corporation vary eagle figure vast simplify instead shell drawer quote depress schedule limitation disturb cancer accord industrial preference screen error gratitude slam evil accent imagination elsewhere champion framework social endure gradual sleeve concession vehicle register apology luggage desperate billion venture queue aside reflect beneficial repeatedly kindergarten verify reduction version implication accustomed helicopter normal shiver stadium grasp economy rotten dash recently concept rigid entertain vertical vessel evident apologize scholar costly veteran glimpse finally approval judgement regulation cord powder improvement remote provide rub fiction occurrence adopt navigation adventure float dynamic vibrate indifferent plot horror fatigue consideration vice notebook chop respect admission disease ignore infect confirm harbour concrete organic phase previous helpless amaze despair victim possibility video viewpoint erect obey rarely vinegar approach violate distinction holy philosophy golf outward section penalty dump internal installation charge criticize disorder rocket dessert dispute butterfly circuit frequent depart lens sigh violence reserve aluminium hence pine opening acid hen giant crystal operational racial construction planet image blade physicist sack behave organism shortly interval violet draught appointment meantime murder violin perspective laundry virtual virtually calculate confess appearance virus ambulance liberty consequently insist solar flourish correspondence pronoun property shave selection limited enormous impact visible conceal earthquake curriculum feature loaf stain demand media comparative massive ultimate extent employment medium urban engineering marvelous event resolve avoid respective boast sew indicate govern visual utilize chase prevail pillow packet heap variation primary dense outside owe interfere burden scatter starve simplicity bare compound orderly resolution learned shelter reporter profile shed necessarily vitamin reproduce grateful convenience vivid outset deserve assignment principal enable refrigerator keyboard poison mill electrical install output ally vocabulary athlete honourable brass merely engage sphere purple volcano decline classic stale liberate standpoint activity volt arrange canal device voltage angle volume voluntary rhythm bore marriage bet spade official beast drum crash boot charm literature handbag volunteer oval glorious inspire protection argue cop given chapter likely omit adequate departure according shift sophisticated damp fry extension instruction assumption potential permanent quit region overseas vote furnace wagon agriculture oven waist editor republican factor hint waken plunge applicable wander luxury loosen readily devil border warmth creative waterproof cargo complaint explosion economical progressive residence resemble perception annoy whichever whereas rob recommend pitch perform connect pilot vital scold intense horrible edition speculate mechanism dumb handwriting educate landlord glove scope recovery weaken refusal wealth overall reputation ending spill character notify pollute persist principle peak margin regarding repetition spectacular humour achievement salad fare flame convention network reservation ribbon plentiful classify weapon dissolve splendid scarce politics alphabet performance clumsy ax wealthy detect physician guy administration emphasize frost contribution weave crane muscle admire exclude inquire dialect weed accident negro identify instrument scratch dependent moral individual loan divide chin shield minimum lump loose scissors diameter soar molecule gaze relationship reality risk fee mature provided curiosity organ grind harmony lamb column weekly riot being plus nightmare budget chart porter dusk somewhat weep weld competition gallon convert publish market kneel postpone liter click logical convince headline disaster welfare pierce  刺入 "
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
      currentWords = currentOriginWords.slice(config.count * (config.chapter - 2), config.count * (config.chapter - 1)).join('');
      config.chapter--;
      engine.reset();
      config.save();
    }
  }

  // 下一段
  nextChapter(){
    if (config.chapter !== config.chapterTotal) {
      currentWords = currentOriginWords.slice(config.count * config.chapter, config.count * (config.chapter + 1)).join('');
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
      default: break;
    }
    this.changePerCount();
  }

  // 改变数字时
  changePerCount(){
    config.count = $('input[type=radio]:checked').value;
    if (config.count === 'ALL'){
      currentWords = currentOriginWords.join('');
    } else {
      currentWords = currentOriginWords.slice(0, Number(config.count)).join('');
    }
    config.chapter = 1;
    let originTol = currentOriginWords.length / Number(config.count);
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
    let articleType;
    let textClass = '';
    switch (config.articleType) {
      case ArticleType.character:articleType = '单字';textClass = 'text-orange';break;
      case ArticleType.english:articleType = '英文';textClass = 'text-green';break;
      case ArticleType.article:articleType = '文章';textClass = 'text-blue';break;
      default: break;
    }
    return `<tr>  
              <td class="text-center roboto-mono">${this.id}</td>
              <td class="bold roboto-mono lv-${level}">${this.speed}</td>
              <td>${this.codeLength}</td>
              <td>${this.hitRate}</td>
              <td>${this.backspace}</td>
              <td>${this.wordCount}</td>
              <td class="text-center ${textClass}">${articleType}</td>
              <td>${config.articleName}</td>
              <td class="hidden-sm">${dateFormatter(new Date(this.timeStart))}</td>
              <td class="time">${formatTimeLeft(this.duration)}</td>
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
  currentWords = currentOriginWords.slice(Number(config.count) * (config.chapter - 1), Number(config.count) * (config.chapter)).join('');
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