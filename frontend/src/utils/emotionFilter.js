const criticalKeywords = [
  '想不開', '放棄', '絕望', '結束', '去死', '好累', '救我',
  '不想活', '消失', '撐不住', '撐不下去', '沒有意義', '活不下去',
];

const positiveKeywords = [
  '開心', '快樂', '好棒', '很棒', '感謝', '謝謝', '幸福', '滿足',
];

export function detectEmotion(text) {
  const critical = criticalKeywords.find((k) => text.includes(k));
  if (critical) {
    return {
      type: 'critical',
      message: '感受到你現在真的很辛苦... ❤️ 給自己一個擁抱，先深呼吸三次，好嗎？你不是一個人。',
      helpText: '需要有人聊聊嗎？',
      helpLink: 'https://www.1925.org.tw/',
      helpLabel: '安心專線 1925',
    };
  }

  const positive = positiveKeywords.find((k) => text.includes(k));
  if (positive) {
    return {
      type: 'positive',
      message: '聽起來今天有一些美好的事發生，這很珍貴 ✨',
    };
  }

  return { type: null };
}
