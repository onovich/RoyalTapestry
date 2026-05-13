export const LANGUAGES = {
  en: 'EN',
  zh: '中文'
};

export function getSystemLanguage() {
  const languages = typeof navigator === 'undefined'
    ? []
    : [navigator.language, ...(navigator.languages || [])].filter(Boolean);

  return languages.some((language) => language.toLowerCase().startsWith('zh')) ? 'zh' : 'en';
}

export const TEXT = {
  en: {
    appName: '♥ Poker Grid',
    newGame: 'New Game',
    undo: 'Undo',
    rules: '❓ Rules',
    surrender: 'Surrender',
    level: 'Level',
    target: 'Target Score',
    score: 'Current Score',
    remaining: 'Remaining',
    scoreUnit: 'pts',
    finalScore: 'Final Score',
    scoring: 'Scoring Rules',
    howToPlay: 'Make poker hands across any full row, column, or diagonal.',
    closeRules: 'Close rules',
    selectDestination: 'Select a destination',
    statusDefault: 'Drag cards into place. Use the page tabs to browse your hand.',
    statusNeedAdjust: 'Score is below target. Drag cards inside the grid to keep adjusting.',
    statusSurrendered: 'Surrendered. This layout reaches the target, but the round is failed. Restart to play again.',
    emptyHand: 'Hand is empty. Refine the board if the target is not met.',
    levelComplete: 'Level Complete',
    levelCompleteBody: 'You solved the theoretical target for level {level}.',
    nextLevel: 'Next Level',
    boardLabel: 'Poker grid board',
    handLabel: 'Hand',
    boardCellLabel: 'Board cell {row}, {column}',
    cardLabel: '{rank} of {suit}',
    hands: {
      ROYAL_FLUSH: { name: 'Royal Flush', short: 'Royal', description: 'A, K, Q, J, 10 in one suit.' },
      STRAIGHT_FLUSH: { name: 'Straight Flush', short: 'S Flush', description: 'Five sequential cards in one suit.' },
      FOUR_KIND: { name: 'Four of a Kind', short: 'Quads', description: 'Four cards of the same rank.' },
      FULL_HOUSE: { name: 'Full House', short: 'House', description: 'Three of one rank plus a pair.' },
      FLUSH: { name: 'Flush', short: 'Flush', description: 'Five cards in one suit.' },
      STRAIGHT: { name: 'Straight', short: 'Run', description: 'Five sequential ranks.' },
      THREE_KIND: { name: 'Three of a Kind', short: 'Trips', description: 'Three cards of the same rank.' },
      TWO_PAIR: { name: 'Two Pair', short: '2 Pair', description: 'Two different pairs.' },
      ONE_PAIR: { name: 'One Pair', short: 'Pair', description: 'Two cards of the same rank.' },
      HIGH_CARD: { name: 'High Card', short: 'High', description: 'No scoring poker pattern.' }
    }
  },
  zh: {
    appName: '♥ 扑克方块',
    newGame: '重新开始',
    undo: '撤销',
    rules: '❓ 规则',
    surrender: '投降',
    level: '关卡',
    target: '目标分数',
    score: '当前得分',
    remaining: '剩余手牌',
    scoreUnit: '分',
    finalScore: '您的最终得分',
    scoring: '牌型规则',
    howToPlay: '任意完整的行、列、斜线都可以组成牌型得分。',
    closeRules: '关闭规则',
    selectDestination: '请选择目标位置',
    statusDefault: '拖拽卡牌放置。点击底部标签翻页查看手牌。',
    statusNeedAdjust: '分数未达标，请在网格内拖拽互换卡牌继续调整！',
    statusSurrendered: '已投降：这里展示可达到目标分的摆法，本局失败。点击重新开始再玩。',
    emptyHand: '手牌已空，若未达标可继续调整棋盘。',
    levelComplete: '恭喜过关！',
    levelCompleteBody: '您成功破解了第 {level} 关的理论最高分。',
    nextLevel: '进入下一关',
    boardLabel: '扑克方块棋盘',
    handLabel: '手牌',
    boardCellLabel: '棋格 {row}，{column}',
    cardLabel: '{rank}{suit}',
    hands: {
      ROYAL_FLUSH: { name: '皇家同花顺', short: '皇顺', description: '同花色的 A、K、Q、J、10。' },
      STRAIGHT_FLUSH: { name: '同花顺', short: '同顺', description: '五张同花色且点数连续的牌。' },
      FOUR_KIND: { name: '四条', short: '四条', description: '四张相同点数的牌。' },
      FULL_HOUSE: { name: '葫芦', short: '葫芦', description: '三条加上一对。' },
      FLUSH: { name: '同花', short: '同花', description: '五张同花色的牌。' },
      STRAIGHT: { name: '顺子', short: '顺子', description: '五张点数连续的牌。' },
      THREE_KIND: { name: '三条', short: '三条', description: '三张相同点数的牌。' },
      TWO_PAIR: { name: '两对', short: '两对', description: '两个不同点数的一对。' },
      ONE_PAIR: { name: '一对', short: '一对', description: '两张相同点数的牌。' },
      HIGH_CARD: { name: '高牌', short: '高牌', description: '不符合其他任何牌型。' }
    }
  }
};

export function formatText(template, values = {}) {
  return Object.entries(values).reduce(
    (message, [key, value]) => message.replace(`{${key}}`, String(value)),
    template
  );
}
