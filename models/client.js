var mongoose = require('mongoose');

var clientSchema = new mongoose.Schema({
	name:String,
	clientid:String,
	email:String,
	rating:{
		type: Number,
		default: 0
	},
	noPeople:{
		type: Number,
		default: 0
	},
	password:String,
	
});

module.exports = mongoose.model('client',clientSchema,'clients');