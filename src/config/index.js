module.exports = {
  ...require('./database'),
  ...require('./redis'),
  ...require('./mongodb_conn')
}
