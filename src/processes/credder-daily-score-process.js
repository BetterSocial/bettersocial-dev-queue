const {Op} = require('sequelize');

const moment = require('moment');

const Bull = require('bull');
const {DomainPage} = require('../databases/models');

const {QUEUE_CREDDER_INTERVAL_IN_DAYS} = require('../utils/constant');

require('dotenv').config();

const credderDailyScoreProcess = async (job, done, queueInjection) => {
  const checkDate = moment().subtract(QUEUE_CREDDER_INTERVAL_IN_DAYS, 'days').format('YYYY-MM-DD');
  const domains = await DomainPage.findAll({
    where: {
      [Op.or]: [
        {credder_last_checked: null},
        {
          credder_last_checked: {
            [Op.lte]: checkDate
          }
        }
      ]
    },
    raw: true
  });

  const queueOptions = {
    limiter: {
      max: 300,
      duration: 60 * 1000 // 60k ms = 1 minute
    }
  };

  if (domains.length === 0) console.log('======= No domain to check =========');
  for (const index in domains) {
    const domain = domains[index];
    queueInjection?.add(
      {
        domainName: domain.domain_name
      },
      queueOptions
    );
  }

  return done(null, 'ok');
};

module.exports = {
  credderDailyScoreProcess
};
