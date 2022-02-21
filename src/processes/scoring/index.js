module.exports = {
  ...require("./calc-score-on-create-account"),
  ...require("./calc-score-on-create-post"),
//  ...require("./calc-score-on-create-comment"),
  ...require("./calc-score-on-upvote-post"),
  ...require("./calc-score-on-cancel-upvote-post"),
  ...require("./calc-score-on-downvote-post"),
  ...require("./calc-score-on-cancel-downvote-post"),
  ...require("./calc-score-on-block-user-post"),
};
