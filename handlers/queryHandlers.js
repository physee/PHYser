const { DateTime } = require('luxon');
const mongoose = require('mongoose');
const { idFormatting, calculateDuration, defineScope, defineAttributes } = require('../handlers/rulesHandlers');
const { entryDb } = require('../handlers/dbConnections');
const Window = entryDb.model('Window');

exports.queryStats = async (scope, id, query) => {
  const Database = defineScope(scope);
  const nodeIds = (scope === 'window') ? getWindowIds(id) : await getNodeIds(Database, id);
  const { sd, ed } = getStartandEndDate(query);
  const checkedInterval = getInterval(query);
  const attributes = defineAttributes(query);
  // 2. start query
  const result = (scope === 'window') ? await getStatsWindow(nodeIds, sd, ed, checkedInterval, attributes) : await getStats(Database, nodeIds, sd, ed, checkedInterval, attributes);

  return result;
};

const getWindowIds = (id) => {
  // if we want to $match windows by their objectId, it should be the formate of:
  // $match: { _id: mongoose.Types.ObjectId('id') } so we need to make some change here
  const ids = idFormatting(id);
  const nodeIds = ids.map(id => mongoose.Types.ObjectId(id));
  return nodeIds;
}

const getNodeIds = async (Database, id) => {
  const ids = idFormatting(id);
  const sensors = await Database.find({ _id: { $in: ids }})
  .populate({
    path: 'windowIds',
    model: 'Window',
    populate: {
      path: 'sensorIds',
      model: 'Sensor',

    }
  })
  .exec();
  const nodeIds = [];
  sensors.forEach(sensor => {
    sensor.windowIds.forEach(win => {
      nodeIds.push(win.sensorIds.nodeId);
    })
  });

  return nodeIds;
}

const getStartandEndDate = (query) => {
  // 1. get duration
  // if there is interval supplied, use the duration according to interval for the start & endDate
  // else use default duration (day: 180 days)
  const duration = (query && query.interval) ? calculateDuration(query.interval) : calculateDuration();
  // 2. calculate start & end date
  const ed = (query && query.startDate) ? DateTime.fromMillis((parseInt(query.endDate))) : DateTime.fromMillis((new Date).getTime());
  const sd = (query && query.endDate) ?  DateTime.fromMillis((parseInt(query.startDate))) : DateTime.fromMillis((ed - duration));
  return { sd, ed };
}

const getInterval = (query) => {
  if (query && query.interval) {
    return query.interval;
  }
  return 'day';
};

const defineTime = (interval) => {
  // interval = year / month/ week/ day/ hour/ minute
  const year = { $year: '$entry.data.time' };
  const month = !(interval === 'year') ? { $month: '$entry.data.time' } : null;
  const week = (interval === 'year') || (interval === 'month') ? null : {  $week: '$entry.data.time' } ;
  const day = (interval === 'year') || (interval === 'month') || (interval === 'week') ? null : { $dayOfMonth: '$entry.data.time' };
  const hour = (interval === 'hour') || (interval === 'minute') || (interval === 'live') ? { $hour: '$entry.data.time' } : null;
  const minute = (interval === 'minute') || (interval === 'live') ? { $minute: '$entry.data.time' } : null;
  return { year, month, week, day, hour, minute };
}


const getStatsWindow = async (nodeIds, startDate, endDate, interval, attributes) => {
  const { year, month, week, day, hour, minute } = defineTime(interval);
  const [ solar, cons, temp, lux, volt ] = attributes;
  const dataset = await Window.aggregate([
    {
      // only get the windows with the correct nodeIds
      $match: {
        _id: { $in: nodeIds },
      },
    },
    {
      // populate sensor data here to get nodeIds
      $lookup: {
        from: 'sensors',
        localField: 'sensorIds',
        foreignField: '_id',
        as: 'sensor',
      }
    },
    {
      // separate sensor data to get nodeId
      $unwind: '$sensor'
    },

    {
      $lookup: {
        from: 'windowlocations',
        localField: 'windowLocationId',
        foreignField: '_id',
        as: 'location',
      }
    },
    {
      // populate entry data here matching nodeId
      $lookup: {
        from: 'entries',
        localField: 'sensor.nodeId',
        foreignField: 'node_id',
        as: 'entry',
      }
    },
    {
      // separate entry data
      $unwind: '$entry'
    },
    {
      // only get the data within startDate and endDate
      $match: {
        'entry.time': {
          $gt: startDate,
          $lte: endDate,
        },
      },
    },
    {
      // separate entry.data
      $unwind: '$entry.data'
    },
    {
      $group: {
        _id: {
          // group the data acccording to installation/project id
          id: '$_id',
          name: '$glassMerk',
          location:'$location.locationId',
          sensor: '$sensor.nodeId',
          year,
          month,
          week,
          day,
          hour,
          minute,
        },

        // push all the time and energy data (from entry db) into an array
        data: { $push :
          {
            solar: '$entry.data.solar',
            cons: '$entry.data.cons',
            temp: '$entry.data.temp',
            lux: '$entry.data.light.lux',
            volt: '$entry.data.volt',

          },
        },
      }
    },
    {
      $project: {
        _id: {
          id: '$_id.id',
          name: '$_id.name',
          locationId: '$_id.location',
          nodeID: '$_id.sensor',
        },
        time: {
          $cond: {
            // if interval = week, week has different operators than the rest
            if: { $and: [{$eq: ['$_id.day', null]}, {$ne: ['$_id.week', null]}] },
            then: {
                $dateFromParts: {
                  isoWeekYear: '$_id.year',
                  isoWeek: { $sum: ['$_id.week', 1]},
                  isoDayOfWeek: 1,
                  hour: 0,
                  minute: 0,
                  second: 0
                },
            },
            else: {
              $dateFromParts: {
                year: '$_id.year',
                month: {
                  $cond: {
                    if: { $ne: ['$_id.month', null] },
                    then: '$_id.month',
                    else: 1,
                  },
                },
                day: {
                  $cond: {
                    if: { $ne: ['$_id.day', null] },
                    then: '$_id.day',
                    else: 1,
                  },
                },
                hour: {
                  $cond: {
                    if: { $ne: ['$_id.hour', null] },
                    then: '$_id.hour',
                    else: 0,
                  },
                },
                minute: {
                  $cond: {
                   if: { $ne: ['$_id.minute', null] },
                   then: '$_id.minute',
                   else:  0,
                  },
                },
                second: 0,
              }
            },
          },
      },
      windows: '$win',
      solar: {
        sum: {
          $cond: {
            if: { $eq : [ solar, null ] },
            then: null,
            else: { $sum: solar }
           }
        },
      },
      cons: {
        sum: {
          $cond: {
            if: { $eq : [ cons, null ] },
            then: null,
            else: { $sum: cons }
          }
        },
      },
      temp: {
        avg: { $avg: temp },
        max: { $max: temp },
        min: { $min: temp },
      },
      lux: {
        avg: { $avg: lux },
        min: { $min: lux },
        max: { $max: lux },
      },
      volt: {
        avg: { $avg: volt },
        max: { $max: volt },
        min: { $min: volt },
      },

      },
    },
    {
      $project: {
        _id: {
          id: '$_id.id',
          name: '$_id.name',
          locationId: '$_id.location',
          nodeID: '$_id.sensor',
        },
        timestamp: { $subtract: [ '$time', new Date("1970-01-01")]},
        solar: {
          sum: '$solar.sum',
          unit: 'Wh',
        },
        cons: {
          sum: '$cons.sum',
          unit: 'Wh',
        },
        lux: {
          avg: '$lux.avg',
          max: '$lux.max',
          min: '$lux.min',
          unit: 'lx',
        },
        temp: {
          avg: '$temp.avg',
          max: '$temp.max',
          min: '$temp.min',
          unit: 'degree',
        },
        volt: {
          avg: '$volt.avg',
          max: '$volt.max',
          min: '$volt.min',
          unit: 'v',
        }

      }
    },

    {
      $redact: {
        $cond: [
          {
            $or: [
              { $eq: ['$sum', null] },
              { $eq: ['$avg', null] }
            ]
          },
          '$$PRUNE',
          '$$DESCEND'
        ]
      },
    },
    {
      $sort: { 'timestamp': 1 }
    },
    {
      $group: {
        _id: {
          id: '$_id.id',
          name: '$_id.locationId',
          glassMerk: '$_id.name',
          nodeId: '$_id.nodID',
        },
        data: {
          $push: {
            time: '$timestamp',
            windows: '$windows',
            solar: {
              sum: '$solar.sum',
              unit: 'Wh',
            },
            cons: {
              sum: '$cons.sum',
              unit: 'Wh',
            },
            lux: {
              avg: '$lux.avg',
              max: '$lux.max',
              min: '$lux.min',
              unit: 'lx',
            },
            temp: {
              avg: '$temp.avg',
              max: '$temp.max',
              min: '$temp.min',
              unit: 'degree',
            },
            volt: {
              avg: '$volt.avg',
              max: '$volt.max',
              min: '$volt.min',
              unit: 'v',
            }
          }
        }
      }
    },

  ]);
  return dataset;
}


const getStats = async (Database, nodeIds, startDate, endDate, interval, attributes) => {
  const { year, month, week, day, hour, minute } = defineTime(interval);
  const [ solar, cons, temp, lux, volt ] = attributes;
  const dataset = await Database.aggregate([{
    $lookup: {
      from: 'windows',
      localField: 'windowIds',
      foreignField: '_id',
      as: 'windows',
    }
  },
  {
    $unwind: '$windows',
  },
  {
    // populate sensor data here to get nodeIds
    $lookup: {
      from: 'sensors',
      localField: 'windows.sensorIds',
      foreignField: '_id',
      as: 'sensor',
    }
  },
  {
    // separate sensor data to get nodeId
    $unwind: '$sensor'
  },
  {
    // only get the windows with the correct nodeIds
    $match: {
      'sensor.nodeId': { $in: nodeIds },
    },
  },
  {
    // populate entry data here matching nodeId
    $lookup: {
      from: 'entries',
      localField: 'sensor.nodeId',
      foreignField: 'node_id',
      as: 'entry',
    }
  },
  {
    // separate entry data
    $unwind: '$entry'
  },
  {
    // only get the data within startDate and endDate
    $match: {
      'entry.time': {
        $gt: startDate,
        $lte: endDate,
      },
    },
  },
  {
    // separate entry.data
    $unwind: '$entry.data'
  },
  {
    $group: {
      _id: {
        // group the data acccording to installation/project id
        id: '$_id',
        name: '$name',
        year,
        month,
        week,
        day,
        hour,
        minute,
      },
      // push all the time and energy data (from entry db) into an array

      data: { $push:
        {
          solar: '$entry.data.solar',
          cons: '$entry.data.cons',
          temp: '$entry.data.temp',
          lux: '$entry.data.light.lux',
          volt: '$entry.data.volt',
        },

      },

      win: { $addToSet :
        {
          glassMerk: '$windows.glassMerk',
        },
      },
    },
  },
  {
    $project: {
      _id: {
        id: '$_id.id',
        name: '$_id.name',
      },
      time: {
        $cond: {
          // if interval = week, week has different operators than the rest
          if: { $and: [{$eq: ['$_id.day', null]}, {$ne: ['$_id.week', null]}] },
          then: {
              $dateFromParts: {
                isoWeekYear: '$_id.year',
                isoWeek: { $sum: ['$_id.week', 1]},
                isoDayOfWeek: 1,
                hour: 0,
                minute: 0,
                second: 0
              },
          },
          else: {
            $dateFromParts: {
              year: '$_id.year',
              month: {
                $cond: {
                  if: { $ne: ['$_id.month', null] },
                  then: '$_id.month',
                  else: 1,
                },
              },
              day: {
                $cond: {
                  if: { $ne: ['$_id.day', null] },
                  then: '$_id.day',
                  else: 1,
                },
              },
              hour: {
                $cond: {
                  if: { $ne: ['$_id.hour', null] },
                  then: '$_id.hour',
                  else: 0,
                },
              },
              minute: {
                $cond: {
                 if: { $ne: ['$_id.minute', null] },
                 then: '$_id.minute',
                 else:  0,
                },
              },
              second: 0,
            }
          },
        },
    },
    windows: '$win',
    solar: {
      sum: {
        $cond: {
          if: { $eq : [ solar, null ] },
          then: null,
          else: { $sum: solar }
         }
      },
    },
    cons: {
      sum: {
        $cond: {
          if: { $eq : [ cons, null ] },
          then: null,
          else: { $sum: cons }
        }
      },
    },
    temp: {
      avg: { $avg: temp },
      max: { $max: temp },
      min: { $min: temp },
    },
    lux: {
      avg: { $avg: lux },
      min: { $min: lux },
      max: { $max: lux },
    },
    volt: {
      avg: { $avg: volt },
      max: { $max: volt },
      min: { $min: volt },
    },

    },
  },
  {
    $project: {
      _id: {
        id: '$_id.id',
        name: '$_id.name',
      },

    timestamp: { $subtract: [ '$time', new Date("1970-01-01")] },
    windows: '$windows',
    solar: { sum: '$solar.sum'},
    cons: { sum: '$cons.sum' },
    lux: {
      avg: '$lux.avg',
      max: '$lux.max',
      min: '$lux.min',
    },
    temp: {
      avg: '$temp.avg',
      max: '$temp.max',
      min: '$temp.min',
    },
    volt: {
      avg: '$volt.avg',
      max: '$volt.max',
      min: '$volt.min',
    }
    }
  },

  {
    $redact: {
      $cond: [
        {
          $or: [
            { $eq: ['$sum', null] },
            { $eq: ['$avg', null] }
          ]
        },
        '$$PRUNE',
        '$$DESCEND'
      ]
    },
  },
  {
    $sort: { 'timestamp': 1 }
  },
  {
    $group: {
      _id: {
        id: '$_id.id',
        name: '$_id.name',
      },
      data: {
        $push: {
          time: '$timestamp',
          windows: '$windows',
          solar: {
            sum: '$solar.sum',
            unit: 'Wh',
          },
          cons: {
            sum: '$cons.sum',
            unit: 'Wh',
          },
          lux: {
            avg: '$lux.avg',
            max: '$lux.max',
            min: '$lux.min',
            unit: 'lx',
          },
          temp: {
            avg: '$temp.avg',
            max: '$temp.max',
            min: '$temp.min',
            unit: 'degree',
          },
          volt: {
            avg: '$volt.avg',
            max: '$volt.max',
            min: '$volt.min',
            unit: 'v',
          }
        }
      }
    }
   },

  ]);
  return dataset;
}
