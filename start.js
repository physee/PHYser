// import environmental variables from our variables.env file
require('dotenv').config({ path: 'variables.env' });


// TODO

// Require the models
require('./models/Entry');
require('./models/NodeId');
require('./models/Project');
require('./models/Installation');
require('./models/Area');
require('./models/Window');
require('./models/Sensor');


// Start our app
const app = require('./app');

app.set('port', process.env.PORT || 8080);
const server = app.listen(app.get('port'), () => {
  console.log(`Express running → PORT ${server.address().port}`);
});
