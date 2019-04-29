const { Duration } = require('luxon');
const { entryDb } = require('../handlers/dbConnections');
const Installation = entryDb.model('Installation');
const Project = entryDb.model('Project');
const Window = entryDb.model('Window');
const Area = entryDb.model('Area');
const User = entryDb.model('User');

// some setting/rules

exports.defineScope = (scope) => {
  let db;
  switch(scope) {
    case 'project':
      db = Project;
      break;
    case 'installation':
      db = Installation;
      break;
    case 'window':
      db = Window;
      break;
    case 'area':
      db = Area;
      break;
    case 'user':
      db = User;
      break;
    default:
      db = Installation;
  }
  return db;
};

exports.defineAttributes = (query) => {
  const validAttributes = ['solar', 'cons', 'temp', 'lux', 'volt'];
  // if there is no attributes in the query, assign them all
  const createdAttr = query && (query.attributes) || query && !(query.attributes) === undefined  ? query.attributes.split(','): validAttributes;
  // formulate the conditions used in $project stage
  const conditions = validAttributes.map(valid => {
   const attr = (createdAttr).includes(valid) ? `$data.${valid}` : null;
   return attr;
  });
  return conditions;
}

exports.calculateDuration = (interval) => {
  let duration;
  switch(interval) {
    case 'year':
      duration = Duration.fromObject({ years: 5 });
      break;
    case 'month':
      duration = Duration.fromObject({ months: 24 });
      break;
    case 'week':
      duration = Duration.fromObject({ months: 12 });
      break;
    case 'day':
      duration = Duration.fromObject({ days: 180 });
      break;
    case 'hour':
      duration =  Duration.fromObject({ days: 31 });
      break;
    case 'minute':
      duration = Duration.fromObject({ days: 31 });
      break;
    case 'live':
      duration = Duration.fromObject({ minutes: 10 });
      break;
    default:
      duration = Duration.fromObject({ days: 180 });
  }
  return duration;
}
  

exports.idFormatting = (id) => {
  if (!Array.isArray(id)) {
    return id.split(',')
  }
  return id;
};
  