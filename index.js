module.exports = process.env.SUBSET_COV
  ? require('./lib-cov/subset.js')
  : require('./lib/subset.js');
