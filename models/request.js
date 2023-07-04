var mongoose = require('mongoose');

var fileSchema = new mongoose.Schema({
	filename:String,
	multer_name:String,
	Date:{
		type:Date,
		default:Date.now()
	},
	originalname:String
});

var requestSchema = new mongoose.Schema({
	who:String,
	name:String,
	email:String,
	approved:{
		type: String,
		default: 'no'
	},
	title:String,
	description:String,
	skills:String,
	fileUp:[fileSchema]
});

module.exports = mongoose.model('request',requestSchema,'requests');