const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;

// Make sure we are running node 7.6+
const [major, minor] = process.versions.node.split('.').map(parseFloat);
if (major < 7 || (major === 7 && minor <= 5)) {
  console.log('🛑 🌮 🐶 💪 💩\nHey You! \n\t ya you! \n\t\tBuster! \n\tYou\'re on an older version of node that doesn\'t support the latest and greatest things we are learning (Async + Await)! Please go to nodejs.org and download version 7.6 or greater. 👌\n ');
  process.exit();
}

// import environmental variables from our variables.env file
require('dotenv').config({ path: 'variables.env' });


const config = {
  autoIndex: false,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
};
// Connect to our Database and handle any bad connections

mongoose.connect(process.env.DATABASE,config);

mongoose.Promise = global.Promise; // Tell Mongoose to use ES6 promises

mongoose.connection.on('error', (err) => {
  console.error(`🙅 🚫 🙅 🚫 🙅 🚫 🙅 🚫 → ${err.message}`);
});

// READY?! Let's go! 

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_cloud_name, 
    api_key: process.env.CLOUDINARY_api_key, 
    api_secret: process.env.CLOUDINARY_api_secret,
    folder: process.env.CLOUDINARY_folder
  }); 

// import Models
require('./models/Store');
require('./models/User');
require('./models/Review');


// Start our app!
const app = require('./app');
app.set('port', process.env.PORT || 7777);
const server = app.listen(app.get('port'), () => {
  console.log(`Express running → PORT ${server.address().port}`);
});

// Temp test
//require('./handlers/mail');