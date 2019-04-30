const { queryStats } = require('../handlers/queryHandlers');

exports.getLiveStatsById = async(req, res) => {
  const query = { interval: 'live' };
  const result = await queryStats(req.params.scope, req.params.id, query);
  res.send(result);
}

exports.getStatsById = async(req, res) => {
  const result = await queryStats(req.params.scope, req.params.id, req.query);
  res.send(result);
}

