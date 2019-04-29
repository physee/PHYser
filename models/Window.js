const mongoose = require('mongoose');
const { entryDb } = require('../handlers/dbConnections');
mongoose.Promise = global.Promise;

const windowSchema = new mongoose.Schema({
  name: String,
  glassMerk: String,
  RFID: String,
  windowLocationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WindowLocation',
  },
  type: {
    type: mongoose.Schema.ObjectId,
    ref: 'WindowType',
  },
  dimension: {
    width: Number,
    height: Number,
  },
  installationDate: {
    type: Date,
    default: Date.now,
  },
  manufacturedDate: {
    type: Date,
    default: Date.now,
  },
  sensorIds: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sensor',
    },

}, {
    toObject: {
      virtuals: true,
    },
    toJSON: {
      virtuals: true,
    },
});
// windowSchema.virtual('type.windowType').get(() => this.type.name);

module.exports = entryDb.model('Window', windowSchema);
