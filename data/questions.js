/**
 * 题库：32 题（每维度 8 题），每次随机抽 10 题
 *
 * 字段说明：
 *   id        题目唯一标识
 *   dimension 所属维度：EI / SN / TF / JP
 *   positive  选「完全就是我」时加分的那一极（E I S N T F J P）
 *   scene     情境小标题（展示在题号旁）
 *   title     题干，必须为陈述句
 *   wolf      true = 隐藏狼题，额外计入狼性指数（外观与其他题完全一致）
 */

/** 5 级量表共用文案（下标 0-4 对应分值 -2 -1 0 +1 +2；文案对齐 2026-10-19 新版原型） */
const SCALE = ['完全不像', '不太像', '一般', '比较像', '非常像']

const QUESTIONS = [
  // ——— E / I：精力来源 ———
  { id: 'ei1', dimension: 'EI', positive: 'E', scene: '森林入口', title: '走进森林时，我更想和同行的人一路聊天。' },
  { id: 'ei2', dimension: 'EI', positive: 'E', scene: '岔路口', title: '遇到岔路口，我会先找人商量再决定往哪走。' },
  { id: 'ei3', dimension: 'EI', positive: 'I', scene: '独行', title: '一个人的森林徒步，让我觉得自在又充电。' },
  { id: 'ei4', dimension: 'EI', positive: 'I', scene: '树洞', title: '我更喜欢独自想清楚，再说出自己的想法。' },
  { id: 'ei5', dimension: 'EI', positive: 'E', scene: '营地', title: '在陌生的林间营地，我会主动去认识新朋友。' },
  { id: 'ei6', dimension: 'EI', positive: 'E', scene: '篝火', title: '热闹的林间篝火晚会让我精力充沛。' },
  { id: 'ei7', dimension: 'EI', positive: 'I', scene: '线索', wolf: true, title: '在森林里，我更愿意独自掌握全部线索。' },
  { id: 'ei8', dimension: 'EI', positive: 'I', scene: '夜色', title: '和人群待久了，我需要躲进树洞一个人待着。' },

  // ——— S / N：信息获取 ———
  { id: 'sn1', dimension: 'SN', positive: 'S', scene: '地图', title: '我更相信地图上标注过的路线。' },
  { id: 'sn2', dimension: 'SN', positive: 'S', scene: '松针', title: '我会先留意脚下松针的纹路与气味。' },
  { id: 'sn3', dimension: 'SN', positive: 'N', scene: '直觉', title: '我常凭直觉判断这条路通向哪里。' },
  { id: 'sn4', dimension: 'SN', positive: 'N', scene: '追踪', wolf: true, title: '我能从蛛丝马迹里推算出猎物会走哪条路。' },
  { id: 'sn5', dimension: 'SN', positive: 'S', scene: '记路', title: '我记路靠的是具体的树、石头和坡地。' },
  { id: 'sn6', dimension: 'SN', positive: 'S', scene: '经验', title: '我习惯照着前辈留下的经验走这片森林。' },
  { id: 'sn7', dimension: 'SN', positive: 'N', scene: '月亮', title: '看见月亮，我会联想到一整个故事。' },
  { id: 'sn8', dimension: 'SN', positive: 'N', scene: '可能', title: '比起发生过什么，我更好奇可能发生什么。' },

  // ——— T / F：决策方式 ———
  { id: 'tf1', dimension: 'TF', positive: 'T', scene: '道理', title: '判断一件事时，我先讲道理，再讲感情。' },
  { id: 'tf2', dimension: 'TF', positive: 'T', scene: '同伴', title: '同伴哭了，我第一反应是找出问题出在哪。' },
  { id: 'tf3', dimension: 'TF', positive: 'F', scene: '安慰', title: '同伴哭了，我第一反应是先抱抱他。' },
  { id: 'tf4', dimension: 'TF', positive: 'F', scene: '拒绝', title: '我很难对别人的请求说不。' },
  { id: 'tf5', dimension: 'TF', positive: 'T', scene: '目的', wolf: true, title: '为了达到目的，我可以把情绪完全收起来。' },
  { id: 'tf6', dimension: 'TF', positive: 'F', scene: '代价', title: '我更在意这个决定有没有伤害到谁。' },
  { id: 'tf7', dimension: 'TF', positive: 'T', scene: '伪装', wolf: true, title: '我享受让别人猜不透我在想什么。' },
  { id: 'tf8', dimension: 'TF', positive: 'F', scene: '生灵', title: '森林里的每一个生灵，我都想温柔对待。' },

  // ——— J / P：生活方式 ———
  { id: 'jp1', dimension: 'JP', positive: 'J', scene: '出发', title: '出发前，我一定会列好清单。' },
  { id: 'jp2', dimension: 'JP', positive: 'J', scene: '计划', title: '计划被打乱会让我很烦躁。' },
  { id: 'jp3', dimension: 'JP', positive: 'P', scene: '随性', title: '我更享受临时起意、边走边看。' },
  { id: 'jp4', dimension: 'JP', positive: 'P', scene: '拖延', title: '我习惯把事情留到最后一刻再决定。' },
  { id: 'jp5', dimension: 'JP', positive: 'J', scene: '布局', wolf: true, title: '我习惯先布好局，等对方自己走进来。' },
  { id: 'jp6', dimension: 'JP', positive: 'J', scene: '扎营', title: '走到哪儿，我都要先定好今晚在哪扎营。' },
  { id: 'jp7', dimension: 'JP', positive: 'P', scene: '规矩', wolf: true, title: '规则是给猎物定的，我更喜欢自己定规矩。' },
  { id: 'jp8', dimension: 'JP', positive: 'P', scene: '野花', title: '路上遇到一片野花，我可以临时改路线。' }
]

module.exports = {
  SCALE,
  QUESTIONS
}
