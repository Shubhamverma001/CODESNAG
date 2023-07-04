var express = require('express');
var hacker = require('../models/hacker');
var admin = require('../models/admin');
var client = require('../models/client');
var developer = require('../models/developer');
var project = require('../models/project');
var request = require('../models/request');
var router = express.Router();
var multer = require('multer');
//var upload = multer({ dest: './temp/' });
var path = require('path')

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'temp/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)) //Appending extension
  }
})

var upload = multer({ storage: storage });
//Passport
var passport = require('passport');
require('express-validator');
var bcrypt = require('bcrypt');
var ObjectId = (require('mongoose').Types.ObjectId);
const saltRounds = 10;
//Passport
/* GET home page. */
router.get('/', function(req, res, next) {
	// console.log(req.session.passport.user['user_id']);
	if(req.session.identity == 4 && req.isAuthenticated()){
		res.render('home', { title: 'Admin' });
	}
	else if(req.session.identity == 3 && req.isAuthenticated()){
		res.render('hacker', { title: 'Hacker' });
	}
	else if(req.session.identity == 2 && req.isAuthenticated()){
		res.render('developer', { title: 'Developer' });
	}
	else if(req.session.identity == 1 && req.isAuthenticated()){
		res.render('client', { title: 'Client' });
	}
	else{
		res.render('login', {title:'Please Login!'});
	}

});
router.get('/register', function(req, res, next){
	res.render('register', {title: "Client Registration!"});
});
router.post('/registeration', upload.any(), function(req, res, next){
	var whois = '';
	if(req.body.identity == 1){
		whois = 'client';
		req.body.sk = '';
	}
	else if(req.body.identity == 2){
		whois = 'hacker';
		req.body.ps = '';
		req.body.dp = '';
	}
	else{
		whois = 'developer';
		req.body.ps = '';
		req.body.dp = '';
	}
	request.find({email:req.body.em}, function(error, results){
		if(error) throw error;
		else{
			for(var i in req.files){
				req.files[i].multer_name = req.files[i].filename;
				var ext = (req.files[i].originalname).substring((req.files[i].originalname).indexOf("."));
				req.files[i].filename=req.files[i].filename+ext;
			}
			if(!results.length){
				request.create({
					who:whois,
					name:req.body.n,
					email:req.body.em,
					title:req.body.ps,
					description: req.body.dp,
					skills:req.body.sk,
					fileUp: req.files
				}, function(error, results){
					if(error) throw error;
					else{
						res.redirect('/register');
					}
				});
			}
			else{
				res.json('Email already registered!');
			}
		}
	});
});
router.get('/home', function(req, res, next){
	console.log(req.session.identity);
	if(req.isAuthenticated() && req.session.identity == 4){
		request.find({approved:'no'}, function(error, results){
			if(error) throw error;
			else{
				var data = results;
				res.render('home', {title:'ADMIN || DASHBOARD', data:data});
			}
		});
	}
	else{
		res.json("Invalid!");
	}
});
router.post('/upload', upload.single('upload'), function(req, res, next){
	console.log(req.file);
	var a = '';
	var ext = (req.file.originalname).substring((req.file.originalname).indexOf("."));
	project.findOne({projectid:req.session.project},function(err,user){
		if(req.session.identity == 2){
			//dev
			developer.findById(req.session.passport.user['user_id'], function(error, results){
				if(error) throw error;
				else{
					var devid = results.developerid;
					a={
						file_name:req.file.originalname,
						multer_name:req.file.filename,
						who:'developer',
						horid:devid,
						Date:Date.now()
					};
					if(user.files==undefined){
						user.files=[];
						user.files.push(a);
					}
					else{
            			user.files.push(a);
					}
					user.save(function(err,ur){
						if(req.session.identity == 2){
							res.redirect('/developer');
						}
						else if(req.session.identity == 3){
							res.redirect('/hacker');
						}
					});
				}
			});
		}
		else if(req.session.identity == 3){
			//hacker
			hacker.findById(req.session.passport.user['user_id'], function(error, results){
				if(error) throw error;
				else{
					var hackerid = results.hackerid;
					a={
						file_name:req.file.originalname,
						multer_name:req.file.filename,
						who:'hacker',
						horid:hackerid,
						Date:Date.now()
					};
					if(user.files==undefined){
						user.files=[];
						user.files.push(a);
					}
					else{
            			user.files.push(a);
					}
					user.save(function(err,ur){
						if(req.session.identity == 2){
							res.redirect('/developer');
						}
						else if(req.session.identity == 3){
							res.redirect('/hacker');
						}
					});
				}
			});
		}
	});
});
router.get('/listall', function(req, res, next){
	if(req.isAuthenticated() && req.session.identity == 2){
		developer.findById(req.session.passport.user['user_id'], function(error, results){
			if(error) throw error;
			else{
				project.findOne({projectid:req.session.project}, function(err,user){
					if(!err && user){
						var temp = [];
						for(var i in user.files){
							if(user.files[i].who==='developer' && user.files[i].horid===results.developerid){
								temp.push(user.files);
							}
						}
						res.json(temp);
					}
					else{
						res.json("Empty!");
					}
				});
			}	
		});
	}
	else if(req.isAuthenticated() && req.session.identity == 3){
		hacker.findById(req.session.passport.user['user_id'], function(error, results){
			if(error) throw error;
			else{
				project.findOne({projectid:req.session.project}, function(err,user){
					if(!err && user){
						var temp = [];
						for(var i in user.files){
							if(user.files[i].who==='hacker' && user.files[i].horid===results.hackerid){
								temp.push(user.files[i]);
							}
						}
						res.json(temp);
					}
					else{
						res.json("Empty!");
					}
				});
			}
		});
	}
});
router.get('/download', function(req, res, next){
	var q = req.query.q;
	res.download('./temp/'+q);
});
router.post('/newHacker',function(req,res,next){
	hacker.findOne({ $or: [ { email: req.body.em }, { hackerid:req.body.wid } ] },function(error, results){
		if(error) throw error;
		else{
			if(results){
				res.status(200).json({succes : false,msg :'email or hackerid already exists'});
			}
			else{
				bcrypt.hash(req.body.pwd, saltRounds, function(error, hash){
					if(error) throw error;
					else{
						hacker.create({
							name :req.body.usr,
							email : req.body.em,
							hackerid:req.body.wid,
							password : hash,
							skillset : req.body.hackerskillset,
						},function(err,users){
							if(err){
								res.json({success : false,msg :'failed to Register'});
							}
							else{
								request.update({"email":req.body.em}, {$set:{"approved":"yes"}}, function(error, results){
									if(error) throw error;
									else{
										res.redirect('/home');
									}
								});
							}
						});
					}
				});
			}
		}
	});
});
router.post('/newDeveloper',function(req,res,next){
	developer.findOne({ $or: [ { email: req.body.em }, { developerid:req.body.wid } ] },function(error, results){
		if(error) throw error;
		else{
			if(results){
				res.status(200).json({succes : false,msg :'Email or Developerid already exists'});
			}
			else{
				bcrypt.hash(req.body.pwd, saltRounds, function(error, hash){
					if(error) throw error;
					else{
						developer.create({
							name :req.body.usr,
							email : req.body.em,
							developerid:req.body.wid,
							password : hash,
							skillset : req.body.developerskillset,
						},function(err,users){
							if(err){
								res.json({success : false,msg :'Failed to Register'});
							}
							else{
								request.update({"email":req.body.em}, {$set:{"approved":"yes"}}, function(error, results){
									if(error) throw error;
									else{
										res.redirect('/home');
									}
								});
							}
						});
					}
				});
			}
		}
	});
});
router.post('/newClient',function(req,res,next){
	client.findOne({ $or: [ { email: req.body.em }, { clientid:req.body.wid } ] },function(error, results){
		if(error) throw error;
		else{
			if(results){
				res.status(200).json({succes : false,msg :'email or developerid already exists'});
			}
			else{
				bcrypt.hash(req.body.pwd, saltRounds, function(error, hash){
					if(error) throw error;
					else{
						client.create({
							name :req.body.usr,
							email : req.body.em,
							clientid:req.body.wid,
							password : hash,
						},function(err,users){
							if(err){
								res.json({success : false,msg :'failed to Register'});
							}
							else{
								request.update({"email":req.body.em}, {$set:{"approved":"yes"}}, function(error, results){
									if(error) throw error;
									else{
										res.redirect('/home');
									}
								});
							}
						});
					}
				});
			}
		}
	});
});
router.post('/newadmin',function(req,res,next){
	bcrypt.hash(req.body.pwd, saltRounds, function(error, hash){
		if(error) throw error;
		else{
			admin.create({
				name :req.body.name,
				email : req.body.email,
				adminid:req.body.adminid,
				password : hash,
			},function(err,users){
				if(err){
					res.json({success : false,msg :'failed to Register'});
				}
				else{
					res.json({success : true,msg :'Admin registered'});
				}
			});
		}
	});
});
router.post('/addProject',function(req,res,next){
	developer.findOne({developerid:req.body.did},function(err,user){
		if(user){
			if(user.assign=='no'){
				developer.update({developerid:req.body.did},{$set:{projectid:req.body.projectid,assign:'yes'}},function(err,us){
					user.save();
				});
			}
			else{
				res.json({success : false,msg :'developer already assigned'});
			}
		}
		else{
			res.json({success : false,msg :'recheck developer id'});
		}		
	});
	hacker.findOne({hackerid:req.body.hid},function(err,hacker1){
		if(hacker1){
			var a={
				name:req.body.pn,
				projectid:req.body.projectid
			};
			if(hacker1.projects==undefined){
				hacker1.projects=[];
				hacker1.projects.push(a);
			}
			else{
				hacker1.projects.push(a);
			}
			hacker1.save();
		}
		else{
			res.json({success : false,msg :'recheck hacker id'});
		}
	});
	client.findOne({clientid:req.body.cid},function(err,clie){	
		if(clie){
			var a={
				name:req.body.pn,
				projectid:req.body.projectid
			};
			if(clie.projects==undefined){
				clie.projects=[];
				clie.projects.push(a);
			}
			else{
			    clie.projects.push(a);
			}
			clie.save();
		}
		else{
			res.json({success : false,msg :'recheck client id'});
		}
	});
	var roomidgen = req.body.pn+req.body.projectid;
	project.create({
		name :req.body.pn,
		projectid : req.body.projectid,
		adminid:req.session.passport.user['user_id'],
		hackerid:req.body.hid,
		developerid:req.body.did,
		clientid:req.body.cid,
		projectdays:req.body.days,
		room:roomidgen,
	},function(err,users){
		if(err){
			res.json({success : false,msg :'failed to Add project'});
		}
		else{
			admin.findById(req.session.passport.user['user_id'], function(err,dev){
					var a={
						name:req.body.pn,
						projectid:req.body.projectid
					};
					if(dev.projects==undefined){
						dev.projects=[];
						dev.projects.push(a);
					}
					else{
			            dev.projects.push(a);
					}
					dev.save();
			});
			res.redirect('/home');
		}
	});
});
router.post('/addProjectClient',async function(req,res,next){
	var roomidgen = req.body.pn+req.body.projectid;
	console.log("clientid",req.session.passport.user['user_id'])
	await client.findOne({_id:new ObjectId(`${req.session.passport.user['user_id']}`)},async function(err,clie){	
		if(clie){
			var a={
				name:req.body.pn,
				projectid:req.body.projectid,
				isapproved:false,
				hackerskillset:req.body.hackerskillset,
				developerskillset:req.body.developerskillset,
			};
			if(clie.projects==undefined){
				clie.projects=[];
				clie.projects.push(a);
			}
			else{
			    clie.projects.push(a);
			}
			await clie.save();
			let hacker1=await hacker.findOne({skillset:req.body.hackerskillset})
			let developer1=await developer.findOne({skillset:req.body.developerskillset,assign:"no"})
			let admin1=await admin.findOne({adminid:"1"})
			console.log(developer1)
			if(!hacker1 || !developer1){
				return res.render("client",{toast:true,toasthead:"Error",toastbody:"Cannot find matching Developer and/or Hacker" })
				//return res.json({success : false,msg :'Cannot find matching Developer and/or Hacker '});

			}
			if(hacker1.projects==undefined){
				hacker1.projects=[];
				hacker1.projects.push(a);
			}
			else{
			    hacker1.projects.push(a);
			}
			await hacker1.save();
			developer1.projectid=req.body.projectid;
			developer1.assign="yes";
			// await developer.update({developerid:developer1.developerid},{$set:{projectid:req.body.projectid,assign:'yes'}},function(err,us){
			// user.save();
			// });
			await developer1.save();
			if(admin1.projects==undefined){
				admin1.projects=[];
				admin1.projects.push(a);
			}
			else{
			    admin1.projects.push(a);
			}
			await admin1.save();
			await project.create({
				name :req.body.pn,
				projectid : req.body.projectid,
				adminid:admin1._id,
				clientid:clie.clientid,
				projectdays:req.body.days,
				isapproved:false,
				developerid:developer1.developerid,
				hackerid:hacker1.hackerid,
				hackerskillset:req.body.hackerskillset,
				developerskillset:req.body.developerskillset,
				room:roomidgen,
			},function(err,users){
				if(err){
					return res.json({success : false,msg :'failed to Add project'});
				}
				else{
					
					return res.render("client",{toast:true,toasthead:"Sucess",toastbody:"Project Created Sucessfully" });
				}
			});
		}
		else{
			return res.json({success : false,msg :'recheck client id'});
		}
	});
});
router.post('/updateStatus',function(req, res, next){
	if(req.isAuthenticated() && req.session.identity ==4){
		project.update({projectid : req.body.pid},{$set:{completed:'onreview',completed_date:Date.now(), progress:100}}, function(error, result){
			if(error) throw error;
			if(result){
				res.json({success:true,msg:'updated successfully'});
			}
		});
	}
});
router.get('/reqCom', function(req, res, next){
	if(req.isAuthenticated() && req.session.identity == 4){
		request.findById(req.query.q, function(error, results){
			if(error) throw error;
			else{
				res.json(results.fileUp);
			}
		});
	}
});
router.get('/updatestatus1',function(req, res, next){
	if(req.isAuthenticated() && req.session.identity == 1){
		project.update({projectid : req.query.pid},{$set:{completed:'yes'}}, function(error, result){
			if(error) throw error;
			if(result){
				res.render('rate', {client: 1, hacker: 0, developer: 0});
			}
		});
	}
});
router.get('/completedprojects', function(req, res, next){
	console.log(req.session.identity)
	if(req.isAuthenticated() && req.session.identity == 4){
		project.find({adminid:req.session.passport.user['user_id'], completed:'yes'}, function(error, results){
			if(error) throw error;
			else{
				res.json(results);
			}
		});
	}
	else if(req.isAuthenticated() && req.session.identity == 1){
		client.findById(req.session.passport.user['user_id'], function(error, results){
			if(error) throw error;
			else{
				project.find({clientid:results.clientid, completed:'yes'}, function(error, results){
					if(error) throw error;
					else{
						res.json(results);
					}
				});
			}
		})
	}
	else if(req.isAuthenticated() && req.session.identity == 3){
		hacker.findById(req.session.passport.user['user_id'], function(error, results){
			if(error) throw error;
			else{
				console.log(results);
				project.find({hackerid:results.hackerid, completed:'yes'}, function(error, results){
					if(error) throw error;
					else{
						res.json(results);
					}
				});
			}
		});
	}
	else if(req.isAuthenticated() && req.session.identity == 2){
		developer.findById(req.session.passport.user['user_id'], function(error, results){
			if(error) throw error;
			else{
				console.log(results);
				project.find({developerid:results.developerid, completed:'yes'}, function(error, results){
					if(error) throw error;
					else{
						res.json(results);
					}
				});
			}
		});
	}
	else{
		res.redirect('/');
	}
});
router.get('/rating',function(req, res, next){
	if(req.query.who == 'hacker'){
		//console.log(req.query.rate);
		
		res.json('success');
	}
	else if(req.query.who == 'developer'){
		console.log(req.query.rate);
		res.json('success');
	}
	else if(req.query.who == 'client'){
		console.log(req.query.rate);
		res.json('success');
	}
	else if(req.query.who == 'admin'){
		console.log(req.query.rate);
		res.json('success');
	}
});
router.get('/getProjects', function(req, res, next){
	console.log(req.session.identity)
	console.log(req.isAuthenticated())
	if(req.isAuthenticated() && req.session.identity == 4){
		project.find({adminid:req.session.passport.user['user_id'], completed:{$ne:"yes"}}, function(error, results){
			if(error) throw error;
			else{
				res.json(results);
			}
		});
	}
	else if(req.isAuthenticated() && req.session.identity == 1){
		client.findById(req.session.passport.user['user_id'], function(error, results){
			if(error) throw error;
			else{
				if(req.query.q == 1){
					project.find({clientid:results.clientid, completed:"no"}, function(error, results){
						if(error) throw error;
						else{
							for(var i in results){
								results[i].files = null;
							}
							res.json(results);
						}
					});
				}
				else if(req.query.q == 2){
					project.find({clientid:results.clientid, completed:"onreview"}, function(error, results){
						if(error) throw error;
						else{
							res.json(results);
						}
					});
				}
				else{
					project.find({clientid:results.clientid, completed:"yes"}, function(error, results){
						if(error) throw error;
						else{
							res.json(results);
						}
					});
				}
			}
		});
	}
	else if(req.isAuthenticated() && req.session.identity == 3){
		hacker.findById(req.session.passport.user['user_id'], function(error, results){
			if(error) throw error;
			else{
				project.find({hackerid:results.hackerid, completed:{$ne:"yes"}}, function(error, results){
					if(error) throw error;
					else{
						res.json(results);
					}
				});
			}
		});
	}
	else{
		res.redirect('/');
	}
});
router.get('/updateP', function(req, res, next){
	var pid = parseInt(req.query.pid);
	var x = req.query.x;
	project.find({adminid:req.session.passport.user['user_id'], progress:{$ne: 100}}, function(error, results){
		if(error) throw error;
		else{
			for(var i in results){
				if(parseInt(results[i].projectid) === pid){
					project.update({projectid:pid}, {$set:{progress:x}}, function(error, results){
						if(error) throw error;
						else{
							res.json('done');
						}
					});
				}
			}
		}
	});
});
router.get('/chat', function(req, res, next){
	req.session.project = req.query.pid;
	if(req.isAuthenticated() && req.session.identity==4){
		res.render('chat', {title:"Chat || Admin", admin:1});
	}
	else if(req.isAuthenticated()){
		res.render('chat', {title:"Chat", admin:0});
	}
});
router.get('/selectProject', function(req, res, next){
	if(req.isAuthenticated() && req.session.identity==4){
		var pid = parseInt(req.query.pid);
		project.find({adminid:req.session.passport.user['user_id']}, function(error, results){
			if(error) throw error;
			else{
				for(var i in results){
					if(parseInt(results[i].projectid) === pid){
						res.json(results[i]);
					}
				}
			}
		});
	}
	else if(req.isAuthenticated() && req.session.identity==3){
		req.session.project = req.query.pid;
		res.json('Done!');
	}
})
router.get('/client',function(req, res, next){
	if(req.isAuthenticated() && req.session.identity == 1){
		res.render('client', {title: 'Client Dashboard'});
	}
});
router.get('/getHackers', function(req, res, next){
    hacker.find({},function(err,user){
    	var a = {};
    	for(var i in user){
    		a[i] = user[i].hackerid;
    	}
        res.json(a);
    });
});
router.get('/getDevelopers', function(req, res, next){
    developer.find({'assign':'no'},function(err,user){
    	var a = {};
    	for(var i in user){
    		a[i] = user[i].developerid;
    	}
        res.json(a);
    });
});
router.get('/getClients', function(req, res, next){
    client.find({},function(err,user){
    	var a = {};
    	for(var i in user){
    		a[i] = user[i].clientid;
    	}
        res.json(a);
    });
});
router.post('/login', passport.authenticate('local', {
	failureRedirect: '/'
}), function(req, res){
	req.session.identity = req.body.identity;
	if(req.body.identity == 2){
		developer.findById(req.session.passport.user['user_id'], function(error, results){
			if(error) throw error;
			else{
				req.session.idl = results.developerid;
				res.redirect('/developer');
			}
		});
	}
	else if(req.body.identity == 3){
		hacker.findById(req.session.passport.user['user_id'], function(error, results){
			if(error) throw error;
			else{
				req.session.idl = results.hackerid;
				res.redirect('/hacker');
			}
		});
	}
	else if(req.body.identity == 4){
		admin.findById(req.session.passport.user['user_id'], function(error, results){
			if(error) throw error;
			else{
				req.session.idl = results.adminid;
				res.redirect('/home');
			}
		});
	}
	else if(req.body.identity == 1){
		client.findById(req.session.passport.user['user_id'], function(error, results){
			if(error) throw error;
			else{
				req.session.idl = results.clientid;
				res.redirect('/client');
			}
		});
	}
	else{
		res.redirect('/');
	}
});
router.get('/developer', function(req, res, next){
	if(req.isAuthenticated() && (req.session.identity == 2)){
		developer.findById(req.session.passport.user['user_id'], function(error, results){
			if(error) throw error;
			else{
				if(results.assign==='no'){
					res.render('developer',{title:"Dashboard!", assign:0});
				
				}
				else{
					req.session.project = results.projectid;
					res.render('developer', {title: 'Dashboard!', assign:1, id:results.projectid});
				}
			}
		});
	}
});
router.get('/hacker', function(req, res, next){
	if(req.isAuthenticated() && (req.session.identity == 3)){
		res.render('hacker', {title: 'Dashboard!'});
	}
})
router.get('/logout', function(req, res){
	req.logout();
	req.session.destroy();
	res.redirect('/');
});
passport.serializeUser(function(user_id, done){
	done(null, user_id);
});
passport.deserializeUser(function(user_id, done){
	done(null, user_id);
});
function authenticationMiddleware () {  
	return (req, res, next) => {
		console.log(`req.session.passport.user: ${JSON.stringify(req.session.passport)}`);

	    if (req.isAuthenticated()) return next();
	    res.redirect('/login')
	}
}
module.exports = router;