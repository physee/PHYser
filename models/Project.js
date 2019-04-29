const mongoose = require('mongoose');
const { entryDb } = require('../handlers/dbConnections');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: 'Please enter a project name',
  },
  installationDate: {
    type: Date,
    default: Date.now,
  },
  stage: {
    type: String,
  },
  type: {
    type: String,
  },
  location: {
    type: {
      type: String,
      default: 'Point',
    },
    coordinates: [
      {
        type: Number,
      },
    ],
    address: String,
    city: String,
    country: String,
  },
  installationIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Installation',
    },
  ],
  gatewayIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gateway',
    },
  ],
  gridIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Grid',
    },
  ],
  windowIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Window',
    },
  ],
  windowLocationIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WindowLocation',
    },
  ],
  sensorIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sensor',
    },
  ],

});

module.exports = entryDb.model('Project', projectSchema);