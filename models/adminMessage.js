var mongoose = require('mongoose');

var adminMessageSchema = new mongoose.Schema({
	id:String,
	identity:String,
	roomID:String,
	message:String,
	name:String,
});

module.exports = mongoose.model('adminMessage',adminMessageSchema,'adminMessages');