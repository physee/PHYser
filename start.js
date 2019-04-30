const mongoose = require('mongoose');
require('dotenv').config({ path: 'variables.env' });



const mongoOptions = {
  sslValidate: false,
  useMongoClient: true
};


// connecting to two databases here
mongoose.connect(process.env.MONGODBENTRY, mongoOptions);
mongoose.Promise = global.Promise; 
mongoose.connection.on('error', (err) => {
  console.error(`🙅 🚫 🙅 🚫 🙅 🚫 🙅 🚫 → ${err.message}`);
});

// Require the models
require('./models/Entry');
require('./models/NodeId');
require('./models/Project');
require('./models/Installation');
require('./models/Area');
require('./models/Window');
require('./models/Sensor');
require('./models/User');


// Start our app
const app = require('./app');

app.set('port', process.env.PORT || 7777);
const server = app.listen(app.get('port'), () => {
  console.log(`Express running → PORT ${server.address().port}`);
});
