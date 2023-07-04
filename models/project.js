var mongoose = require('mongoose');
var fileSchema = new mongoose.Schema({
	file_name:String,
	multer_name:String,
	who:String,
	horid:String,//hacker aur developer id
	Date:{
		type:Date,
		default:Date.now()
	}
});
var ProjectSchema = new mongoose.Schema({
	projectid:String,
	name:String,
	hackerid:String,
	clientid:String,
	adminid:String,
	developerid:String,
	room:String,
	experience:Number,
	developerskillset:String,
	hackerskillset:String,
	isapproved:Boolean,
	Date:{
		type:Date,
		default:Date.now()
	},
	files:[fileSchema],
	completed:{
		type:String,
		default:'no',
	},
	progress:{
		type:Number,
		default:0,
	},
	projectdays:Number
});
module.exports = mongoose.model('project',ProjectSchema,'projects');