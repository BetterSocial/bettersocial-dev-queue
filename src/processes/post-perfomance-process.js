const { postPerformanceScore } = require("../utils")

const postPerformanceScoreProcess = () => {
  const WW_NON_BP = process.env.WW_NON_BP;
  const WW_D = process.env.WW_D;
  const WW_UP_DOWN = process.env.WW_UP_DOWN;
  const result = postPerformanceScore(1, 1, WW_NON_BP,1, WW_D, 1, WW_UP_DOWN);
  console.info(result)
}

postPerformanceScoreProcess();
