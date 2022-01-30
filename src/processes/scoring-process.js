const initDataUserScore = async(userId, timestamp) => {
  return {
    user_id: userId,
    F_score: 0.0,
    sum_BP_score: 0.0,
    sum_impr_score: 0.0,
    r_score: 1.0,
    age_score: 0.0,
    q_score: 1.0,
    y_score: 0.0,
    B_user_score: 0.0,
    u_user_score: 0.0,
    d_user_score: 0.0,
    u1_score: 0.0,
    user_score: 0.0,
    confirmed_acc: {
      edu_emails: [],
      non_private_email: [],
      twitter_acc: {
        acc_name: "",
        num_followers: 0,
      },
    },
    user_att: "",
    user_att_score: 1.0,
    created_at: timestamp,
    updated_at: timestamp,
  };
};

const initDataPostScore = async(feedId, timestamp) => {
  return {
    feed_id: feedId,
    impr_score: 0.0,
    domain_score: 1.0,
    longC_score: 0.0,
    p_longC_score: 1.0,
    W_score: 0.0,
    D_bench_score: 0.0,
    D_score: 0.0,
    downvote_point: 0.0,
    upvote_point: 0.0,
    s_updown_score: 0.0,
    BP_score: 0.0,
    WS_updown_score: 0.0,
    WS_nonBP_score: 1.0,
    p_perf_score: 1.0,
    p2_score: 0.0,
    p3_score: 1.0,
    post_score: 0.0,
    created_at: timestamp,
    updated_at: timestamp,
  };
};

const onCreateAccount = async(data) => {
  console.debug("scoring onCreateAccount");

};

const scoringProcessJob = async (job, done) => {
  const {
    EVENT_CREATE_ACCOUNT,
    EVENT_CREATE_POST,
    EVENT_UPVOTE_POST,
    EVENT_CANCEL_UPVOTE_POST,
    EVENT_DOWNVOTE_POST,
    EVENT_CANCEL_DOWNVOTE_POST
  } = require("./scoring-constant");
  
  console.log("scoringProcessJob: " + JSON.stringify(job.data));
  try {
    console.info('running job scoring with id: ' + job.id);
    const messageData = job.data;
    switch(messageData.event) {
      case EVENT_CREATE_ACCOUNT:
        onCreateAccount(messageData);
        break;
      case EVENT_CREATE_POST:
        break;
      case EVENT_UPVOTE_POST:
        break;
      case EVENT_CANCEL_UPVOTE_POST:
        break;
      case EVENT_DOWNVOTE_POST:
        break;
      case EVENT_CANCEL_DOWNVOTE_POST:
        break;
      default:
        throw Error("Unknown event");
    }
    const result = await saveNewsLink(data, name, info, job.data, logo, created_domain);
    console.info(result);
    done(null, result);
  } catch (error) {
    console.log(error);
    done(null, error);
  }
  */
}

module.exports = {
  scoringProcessJob
};
