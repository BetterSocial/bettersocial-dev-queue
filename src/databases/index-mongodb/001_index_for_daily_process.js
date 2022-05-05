const { getDb, closeConn } = require("../../config/mongodb_conn");
const {
  DB_COLLECTION_USER_SCORE,
  DB_COLLECTION_POST_SCORE,
  DB_COLLECTION_USER_POST_SCORE
} = require("../../processes/scoring-constant");

async function exec() {
  console.log("Start");
  try {
    const db = await getDb();

    const postScoreCol = db.collection(DB_COLLECTION_POST_SCORE);
    await postScoreCol.createIndex(
      { author_id: 1, time: 1},
      { unique: false, sparse: false, name: "post_score_author_time" }
    );

    const userPostScoreCol = db.collection(DB_COLLECTION_USER_POST_SCORE);
    await userPostScoreCol.createIndex(
      { user_id: 1, last_updown: 1},
      { unique: false, sparse: false, name: "user_post_score_user_last_updown" }
    );
    await userPostScoreCol.createIndex(
      { user_id: 1, last_block: 1},
      { unique: false, sparse: false, name: "user_post_score_user_last_block" }
    );

  } finally {
    await closeConn();
  }

  console.log("done");
};

exec().catch(console.dir);
