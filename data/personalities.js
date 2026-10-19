/**
 * 人格库：16 型文案与配色 + 隐藏结局 WOLF
 *
 * 阵营规则（见 REQUIREMENTS.md 5.1）：类型第 3 个字母 T → 大灰狼型；F → 小红帽型。
 * 首批完整文案（INFP / ENTJ / ISFP / ESTP）已按「每段 2-3 句」产出；
 * 其余 12 型为 M3a 阶段的基础文案，M3b 会按同一风格补全。
 */

const PERSONALITIES = {
  // ————— 小红帽型（F 阵营） —————
  INFP: {
    type: 'INFP',
    camp: 'hood',
    role: '林间诗人',
    subtitle: '温柔的引路人',
    slogan: '你给森林里迷路的每一个人都唱过一首歌',
    gradient: ['#2E6F52', '#7FC8A9'],
    rarity: 4.3,
    image: '/pkg-result/assets/character/infp.png',
    tags: ['共情力强', '理想主义', '敏锐洞察', '温柔坚定'],
    forest: [
      '你走进森林，不是为了找到狼，而是为了确认每一个迷路的人都平安到家。别人的情绪在你心里会生根，哪怕对方只是沉默了一秒，你也能听见那声没说出口的叹息。',
      '你习惯把感受写成句子，把善意藏在细节里——一条多带的手帕、一盏留给夜路人的灯。你不是不害怕，只是觉得，总得有人在黑森林里先温柔起来。'
    ]
  },
  INFJ: {
    type: 'INFJ',
    camp: 'hood',
    role: '守林人',
    subtitle: '不说破的守夜者',
    slogan: '你早就知道狼在哪，只是不说',
    gradient: ['#1E4636', '#4E9E7A'],
    rarity: 1.5,
    image: '/pkg-result/assets/character/infj.png',
    tags: ['洞察深刻', '安静克制', '有原则', '护短'],
    forest: [
      '你站在林子边缘很久了，谁走过、谁回来了、谁还没回来，你心里都有一本账。你很少把判断说出口，因为你知道有些事说出来就收不回。',
      '一旦有人踏进你划定的那条线，你会是第一个挡在前面的人。你守护的方式从来不大声，但很稳。'
    ]
  },
  ENFJ: {
    type: 'ENFJ',
    camp: 'hood',
    role: '提灯人',
    subtitle: '举灯带路的人',
    slogan: '你举着灯，要把所有人安全带出森林',
    gradient: ['#35735A', '#9BD8B0'],
    rarity: 2.4,
    image: '/pkg-result/assets/character/enfj.png',
    tags: ['凝聚力强', '善鼓舞', '责任感重', '外向温暖'],
    forest: [
      '你天生会照顾队伍里落在最后的那个人。你记得谁怕黑、谁走不动、谁只是嘴硬，然后把灯往他们那边偏一偏。',
      '你也会累，但从不承认。对你来说，让别人先出去，比自己先出去更重要。'
    ]
  },
  ENFP: {
    type: 'ENFP',
    camp: 'hood',
    role: '野餐篮',
    subtitle: '装满惊喜的旅人',
    slogan: '你路上捡满了有趣的东西，差点忘了找狼',
    gradient: ['#3C7A5E', '#F5C451'],
    rarity: 6.8,
    image: '/pkg-result/assets/character/enfp.png',
    tags: ['好奇心强', '热情洋溢', '点子多', '容易分心'],
    forest: [
      '你进森林时带的是好奇心，不是地图。一片奇怪的叶子、一段模糊的歌声，都能让你偏离原定路线半小时。',
      '你让人觉得，哪怕迷路也挺好玩。只是别忘了，天黑之前要记得回营地。'
    ]
  },
  ISFJ: {
    type: 'ISFJ',
    camp: 'hood',
    role: '提篮的人',
    subtitle: '揣着热汤的人',
    slogan: '你的篮子里永远有一碗还热着的汤',
    gradient: ['#2A5F49', '#8FCF9E'],
    rarity: 9.1,
    image: '/pkg-result/assets/character/isfj.png',
    tags: ['细致体贴', '记性好', '默默付出', '怕麻烦人'],
    forest: [
      '你记得每个人的口味、忌口和习惯，然后把这些装进篮子带上路。你不善言辞，但你的照顾从来不掉链子。',
      '你很少提自己的需要，久了别人会以为你没有。偶尔也该让别人给你留一碗汤。'
    ]
  },
  ESFJ: {
    type: 'ESFJ',
    camp: 'hood',
    role: '茶会主人',
    subtitle: '不让任何人缺席的人',
    slogan: '森林茶会谁都不能缺席，包括狼',
    gradient: ['#33735A', '#F0B64A'],
    rarity: 8.2,
    image: '/pkg-result/assets/character/esfj.png',
    tags: ['热络周到', '重视关系', '行动力强', '在意评价'],
    forest: [
      '你是那个把所有人聚到篝火边的人。谁闹别扭、谁被冷落，你都会第一时间端着杯子过去坐下。',
      '你害怕有人掉队，也害怕气氛冷掉。偶尔允许聚会散场，关系也不会因此变淡。'
    ]
  },
  ISFP: {
    type: 'ISFP',
    camp: 'hood',
    role: '采花人',
    subtitle: '为花停留的人',
    slogan: '你会为一朵路边的花，在狼窝前停下来',
    gradient: ['#2C6B57', '#C9E265'],
    rarity: 5.6,
    image: '/pkg-result/assets/character/isfp.png',
    tags: ['感受细腻', '审美在线', '温和慢热', '活在当下'],
    forest: [
      '你走路很慢，因为路边的东西都在跟你打招呼：一片被露水压弯的草、一块被月光洗白的石头。你会蹲下来看好久，哪怕同伴已经走远。',
      '你不太会讲大道理，却总能用一件小事安慰到人——一朵花、一块糖、一次安静的陪伴。你的温柔不喧哗，但很准确。',
      '只是有时候，你会为了不扫兴而把自己真实的想法咽回去。试着说一次「我不想」，世界不会因此塌掉。'
    ]
  },
  ESFP: {
    type: 'ESFP',
    camp: 'hood',
    role: '篝火中心',
    subtitle: '走到哪儿都开派对的人',
    slogan: '你走到哪儿，哪儿就开起派对',
    gradient: ['#3A7F63', '#F5A451'],
    rarity: 7.4,
    image: '/pkg-result/assets/character/esfp.png',
    tags: ['感染力满格', '享受当下', '真诚直接', '怕冷场'],
    forest: [
      '只要有你在，篝火就不会灭。你第一个唱歌，第一个拉人跳舞，也第一个发现谁在角落里不开心。',
      '热闹散场后你会格外安静。别忘了给自己留一点不用表演的时间。'
    ]
  },

  // ————— 大灰狼型（T 阵营） —————
  INTJ: {
    type: 'INTJ',
    camp: 'wolf',
    role: '制图师',
    subtitle: '沉默的布局者',
    slogan: '你早就画好了整片森林的地图，包括狼穴',
    gradient: ['#1E3A32', '#3E5C6B'],
    rarity: 2.1,
    image: '/pkg-result/assets/character/intj.png',
    tags: ['全局视角', '独立判断', '长期主义', '不善寒暄'],
    forest: [
      '你出发前已经把路线、天气和退路都想清楚了。别人还在讨论走哪条路，你已经在算几点天黑。',
      '你很少解释自己的判断，因为你觉得结果会说话。只是有些时候，把地图摊开给别人看一眼，队伍会走得更齐。'
    ]
  },
  INTP: {
    type: 'INTP',
    camp: 'wolf',
    role: '谜语猫头鹰',
    subtitle: '月光下的解谜者',
    slogan: '你把狼的脚印当成一道谜题来解',
    gradient: ['#233B44', '#4E7C8A'],
    rarity: 3.2,
    image: '/pkg-result/assets/character/intp.png',
    tags: ['逻辑至上', '好奇成瘾', '慢启动', '讨厌敷衍'],
    forest: [
      '比起抓住狼，你更想知道它为什么走这条路。你会为一个细节翻来覆去想一整夜，直到把线索串成一条线。',
      '你在自己的世界里很自由，在外面的世界里常常忘记回消息。'
    ]
  },
  ENTJ: {
    type: 'ENTJ',
    camp: 'wolf',
    role: '狩猎队长',
    subtitle: '天生的指挥者',
    slogan: '你直接组队，把狼逼进死角',
    gradient: ['#1E3A32', '#2F6B7A'],
    rarity: 1.8,
    image: '/pkg-result/assets/character/entj.png',
    tags: ['目标驱动', '决断迅速', '调度有方', '容易强势'],
    forest: [
      '你一进森林就开始分活：谁探路、谁守后方、谁负责收尾。你不是喜欢指挥，而是受不了明明有办法却没人拍板。',
      '你把效率当成一种礼貌——把事情做成，才算对得起同行的人。你冲得太快时会丢下一些情绪，记得回头看一眼队伍里的人。',
      '你真正的对手从来不是那只狼，而是你自己那句「再快一点」。偶尔慢下来，你会发现有些路是要一起走才走得完的。'
    ]
  },
  ENTP: {
    type: 'ENTP',
    camp: 'wolf',
    role: '变装艺人',
    subtitle: '笑着掀桌的人',
    slogan: '你披上狼皮，反而把狼骗得团团转',
    gradient: ['#2A3F52', '#6B8FA3'],
    rarity: 3.4,
    image: '/pkg-result/assets/character/entp.png',
    tags: ['脑洞清奇', '反应极快', '爱辩论', '三分钟热度'],
    forest: [
      '你最擅长的事，是把别人认定的规则翻过来再看一遍。大家都往东走时，你会认真问一句：西边真的不行吗。',
      '你的点子总比计划多。挑一个走到底，你会比现在更难被拦住。'
    ]
  },
  ISTJ: {
    type: 'ISTJ',
    camp: 'wolf',
    role: '守门人',
    subtitle: '一丝不苟的守门人',
    slogan: '你按清单一项项检查外婆家的门锁',
    gradient: ['#22333D', '#5A7A8A'],
    rarity: 8.9,
    image: '/pkg-result/assets/character/istj.png',
    tags: ['靠谱到底', '流程清晰', '记性强', '抗拒突变'],
    forest: [
      '你相信的是清单、门锁和一条条被验证过的经验。别人凭感觉，你凭记录。',
      '计划临时改动时你会难受，但也正是因为你，队伍才没在黑森林里丢过东西。'
    ]
  },
  ESTJ: {
    type: 'ESTJ',
    camp: 'wolf',
    role: '巡逻队长',
    subtitle: '给森林立规矩的人',
    slogan: '你给整片森林立了规矩，狼也得排队',
    gradient: ['#1F3A3A', '#4A7A6B'],
    rarity: 7.1,
    image: '/pkg-result/assets/character/estj.png',
    tags: ['执行强', '讲秩序', '敢担责', '语气偏硬'],
    forest: [
      '你受不了没人负责的场面，于是你先站出来把规矩讲清楚。你说的话不一定好听，但一定算数。',
      '有些人不习惯你的直接。把语气放软一点，你的规矩会更容易被遵守。'
    ]
  },
  ISTP: {
    type: 'ISTP',
    camp: 'wolf',
    role: '刀具匠',
    subtitle: '不动声色的拆解者',
    slogan: '你不动声色地拆掉了所有陷阱',
    gradient: ['#253B39', '#5E8577'],
    rarity: 5.2,
    image: '/pkg-result/assets/character/istp.png',
    tags: ['动手能力', '临场冷静', '话少活好', '讨厌束缚'],
    forest: [
      '别人慌张的时候你在看结构：绳子怎么绑的、机关怎么触发的、往哪边用力能解开。',
      '你不太说安慰的话，但你会把危险先处理掉，再回头看人。'
    ]
  },
  ESTP: {
    type: 'ESTP',
    camp: 'wolf',
    role: '先冲进去的人',
    subtitle: '不看地图就出发的人',
    slogan: '不看地图，你第一个跑进了森林深处',
    gradient: ['#2A3A2F', '#6B8F5E'],
    rarity: 4.6,
    image: '/pkg-result/assets/character/estp.png',
    tags: ['行动第一', '临场应变', '胆子大', '耐性不足'],
    forest: [
      '你不等方案完美，先跑进去看一眼再说。别人还在地图上比划，你已经带着一身泥回来了——而且确实带回了有用的消息。',
      '你的勇气是队伍的破冰器，也是你最容易受伤的地方。冲之前花三秒看一眼地形，你会走得更远。',
      '你不擅长长线的等待，那就把它拆成一个个能立刻动手的小目标。你适合开路，也要学会等人跟上。'
    ]
  }
}

/** 隐藏结局：你就是那只大灰狼 */
const WOLF = {
  type: 'WOLF',
  camp: 'wolf',
  role: '大灰狼',
  subtitle: '你一直在找的那一个',
  slogan: '你找了整片森林，最后发现要找的是自己',
  gradient: ['#2B2B2F', '#8E2B2B'],
  image: '/pkg-result/assets/character/wolf-king.png',
  monologue: [
    '你以为自己是提着篮子穿过森林的那个人，可你比谁都清楚狼会从哪里出现——因为你曾经就在那里站着。',
    '你学会了在人群里披上温和的外衣，也学会了在关键时刻冷静地收起情绪。这不是坏，是你的生存方式。'
  ],
  reason:
    '你在几道关于「掌控、伪装与独行」的题目上给出了很高的认同，狼性指数达到了触发线。这意味着你身上同时住着小红帽的温柔和大灰狼的清醒。'
}

/** 兜底：未知类型时返回的配置（保证页面不白屏） */
const FALLBACK = {
  type: 'UNKNOWN',
  camp: 'hood',
  role: '旅人',
  subtitle: '还在路上的人',
  slogan: '你已经在森林里了，这就够了',
  gradient: ['#1E3A32', '#30A46E'],
  rarity: 0,
  image: '/assets/character/red-riding-hood.jpg',
  tags: ['尚未定义'],
  forest: ['你的森林人格正在生成，再测一次会有更准确的结果。']
}

function getPersonality(type) {
  if (type === 'WOLF') return WOLF
  return PERSONALITIES[type] || FALLBACK
}

module.exports = {
  PERSONALITIES,
  WOLF,
  FALLBACK,
  getPersonality
}
