const mongoose = require('mongoose');
const dbConnections = require('../handlers/dbConnections');

const nodeSchema = new mongoose.Schema({
  node_id: String,
  name: String,
  state: String,
  last_seen: Date,
  firmware_version: String,
  sensors: [String]
});

module.exports = dbConnections.entryDb.model('NodeId', nodeSchema);
