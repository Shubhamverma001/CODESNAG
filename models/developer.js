var mongoose = require('mongoose');
var developerSchema = new mongoose.Schema({
	name:String,
	projectid:String,
	developerid:String,
	password:String,
	email:String,
	experience:Number,
	skillset:String,
	rating:{
		type: Number,
		default: 0
	},
	assign:{
		type:String,
		default:'no',
	}
});

module.exports = mongoose.model('developer',developerSchema,'developers');