const mongoose = require('mongoose');
const { entryDb } = require('../handlers/dbConnections');

const nodeSchema = new mongoose.Schema({
  node_id: String,
  name: String,
  state: String,
  last_seen: Date,
  firmware_version: String,
  sensors: [String]
});

module.exports = entryDb.model('NodeId', nodeSchema);
