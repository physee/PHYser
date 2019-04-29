// import environmental variables from our variables.env file
require('dotenv').config({ path: 'variables.env' });

// Connect to multiple MongoDB
// TODO

// Require the models



// Start our app
const app = require('./app');

app.set('port', process.env.PORT || 8080);
const server = app.listen(app.get('port'), () => {
  console.log(`Express running → PORT ${server.address().port}`);
});
