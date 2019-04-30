const { queryStats } = require('../handlers/queryHandlers');
const { getDefaultIds } = require('../handlers/rulesHandlers');

exports.getLiveStatsById = async(req, res) => {
  const query = { interval: 'live' };
  const ids = await getDefaultIds(req.user, req.params.scope);
  const result = await queryStats(req.params.scope, ids, query);
  res.send(result);
}

exports.getStatsById = async(req, res) => {
  
  const ids = await getDefaultIds(req.user, req.params.scope);
  const result = await queryStats(req.params.scope, ids, req.query);
  res.send(result);
}



