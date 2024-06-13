const crypto = require('crypto');
const BetterSocialColorList = require('./color');
const BetterSocialEmojiList = require('./emoji');

const BetterSocialConstantListUtils = {
  getRandomColor() {
    const random = crypto.randomInt(BetterSocialColorList.length);
    return BetterSocialColorList[random];
  },

  getRandomEmoji() {
    const random = crypto.randomInt(BetterSocialEmojiList.length);
    return BetterSocialEmojiList[random];
  }
};

module.exports = BetterSocialConstantListUtils;
