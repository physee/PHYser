const mongoose = require('mongoose');


const installationSchema = new mongoose.Schema({
  name: String,
  location: {
    coordinates: [Number],
    floor: String,
    address: String,
  },
  description: String,
  installationDate: {
    type: Date,
    default: Date.now,
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
  },
  gatewayId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gateway',
  },
  gridId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Grid',
  },
  areaIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Area',
    },
  ],
  windowIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Window',
    },
  ],
  sensors: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sensor',
    },
  ],
  devices: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Device',
    },
  ],
  controllers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Controller',
    },
  ],
});

module.exports = mongoose.model('Installation', installationSchema);