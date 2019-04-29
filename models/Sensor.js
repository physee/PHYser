const mongoose = require('mongoose');

const { entryDb } = require('../handlers/dbConnections');

const sensorSchema = new mongoose.Schema({
  name: String,
  nodeId: String,
  type: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SensorType',
  },
  installationDate: {
    type: Date,
    default: Date.now,
  },
  manufacturedDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = entryDb.model('Sensor', sensorSchema);
