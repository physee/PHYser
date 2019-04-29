const mongoose = require('mongoose');

const mongoOptions = {
  sslValidate: false,
  useMongoClient: true
};
mongoose.Promise = global.Promise; // Tell Mongoose to use ES6 promises

// connecting to two databases here
const entryDb = mongoose.createConnection(process.env.MONGODBENTRY, mongoOptions);
entryDb.on('error', (err) => {
  console.error(`🙅 🚫 🙅 🚫 🙅 🚫 🙅 🚫 → ${err.message}`);
});


module.exports.entryDb = entryDb;
