var mongoose = require('mongoose');

var projectSchema = new mongoose.Schema({
	name:String,
	projectid:String
});

var HackerSchema = new mongoose.Schema({
	name:String,
	projectid:String,
	password:String,
	hackerid:String,
	email:String,
	skillset:String,
	rating:{
		type: Number,
		default: 0
	},
	projects:[projectSchema],
});

module.exports = mongoose.model('hacker',HackerSchema,'hackers');