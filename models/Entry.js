const mongoose = require('mongoose');
const dbConnections = require('../handlers/dbConnections');

const dataSchema = new mongoose.Schema({
  time: Date,
  solar: Number,
  cons: Number,
  volt: Number,
  temp: Number,
  hum: Number,
  press: Number,
  light: {
    ir: Number,
    full: Number,
    lux: Number
  },
  pv_power: {
    left: Number,
    bottom: Number,
    right: Number
  }
}, { _id: false });

const entrySchema = new mongoose.Schema({
  node_id: String,
  time: Date,
  data: [dataSchema],
  count: Number,
  sum: {
    solar: Number,
    cons: Number,
    volt: Number,
    temp: Number,
    hum: Number,
    lux: Number,
    press: Number
  }
});

module.exports = dbConnections.entryDb.model('Entry', entrySchema);
