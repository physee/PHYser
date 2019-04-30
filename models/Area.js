const mongoose = require('mongoose');


const areaSchema = new mongoose.Schema({
    name: String,
    location: {
      floor: Number,
    },
    description: String,
    userIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    windowIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Window',
      },
    ],
    sensorIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sensor',
      },
    ],
    deviceIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Device',
      },
    ],
    controllerIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Controller',
      },
    ],
  });

module.exports = mongoose.model('Area', areaSchema);