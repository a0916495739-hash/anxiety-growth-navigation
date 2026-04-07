const criticalKeywords = [
  '想不開', '放棄', '絕望', '結束', '去死', '好累', '救我',
  '不想活', '消失', '撐不住', '撐不下去', '沒有意義', '活不下去',
];

const positiveKeywords = [
  '開心', '快樂', '好棒', '很棒', '感謝', '謝謝', '幸福', '滿足',
];

const criticalMessages = [
  '先喝口水，深呼吸三次。你不需要一個人扛著這些。❤️',
  '世界很大，我們陪你慢慢來。現在這一刻，你做得很好了。',
  '能把這些說出來，已經很勇敢了。你不是一個人在面對這些。',
  '有時候累了就是累了，不需要解釋。先讓自己喘口氣，好嗎？',
  '你願意寫下來，代表你還在試著理解自己。這很重要。我們在這裡。',
];

const positiveMessages = [
  '聽起來今天有一些美好的事發生，這很珍貴 ✨',
  '把開心的事記下來，它就會留得更久一點 🌿',
  '這種感覺值得被好好記住 ☀️',
  '謝謝你願意分享這份美好 ❤️',
  '今天的你，有一刻是輕盈的 🌸',
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function detectEmotion(text) {
  const critical = criticalKeywords.find((k) => text.includes(k));
  if (critical) {
    return {
      type: 'critical',
      message: pick(criticalMessages),
      helpLink: 'https://www.1925.org.tw/',
      helpLabel: '安心專線 1925',
    };
  }

  const positive = positiveKeywords.find((k) => text.includes(k));
  if (positive) {
    return {
      type: 'positive',
      message: pick(positiveMessages),
    };
  }

  return { type: null };
}
