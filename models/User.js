const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
const md5 = require('md5');
const validator = require('validator');
const mongodbErrorHandler = require('mongoose-mongodb-errors');
const passportLocalMongoose = require('passport-local-mongoose');


const userSchema = new Schema({
  userType: {
    type: Number,
    requried: 'Please choose user type.'
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: validator.isEmail,
      message: 'Invalid Email Address',
      isAsync: false,
    },
    required: 'Please Supply an email address'
  },
  name: {
    type: String,
    required: 'Please supply a name',
    trim: true,
  },

  resetPasswordToken: String,
  resetPasswordExpires: Date,
  projectIds: [
    { 
      type: mongoose.Schema.ObjectId, 
      ref: 'Project'
    }
  ],
  installationIds: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Installation',
    },
  ],
});


userSchema.plugin(passportLocalMongoose, { usernameField: 'email' });
userSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model('User', userSchema);
