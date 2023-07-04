var mongoose = require('mongoose');

var projectSchema = new mongoose.Schema({
	name:String,
	projectid:String
});


var adminSchema = new mongoose.Schema({
	name:String,
	adminid:String,
	email:String,
	password:String,
	projects:[projectSchema],
});

module.exports = mongoose.model('admin',adminSchema,'admins');