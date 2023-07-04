var socketIO = require('socket.io');
var adminMessage = require('./models/adminMessage');
var project = require('./models/project');
var hacker = require('./models/hacker');
var admin = require('./models/admin');
var client = require('./models/client');
var developer = require('./models/developer');
var io = socketIO();
var socket = {};
socket.io = io;
var users = {};
var id = 0;
var room = '';
var name='';
io.on('connection', function(socket){
	var session = socket.request.session;
	users[session.idl] = socket.id;
	console.log(session.idl);
	if(session.identity == 3){
		hacker.find({hackerid:session.idl}, function(error, results){
			if(error) throw error;
			else{
				name = results[0].name;
			}
		});
	}
	if(session.identity == 2){
		developer.find({developerid:session.idl}, function(error, results){
			if(error) throw error;
			else{
				name = results[0].name;
			}
		});
	}
	else if(session.identity == 1){
		client.find({clientid:session.idl}, function(error, results){
			if(error) throw error;
			else{
				name = results[0].name;
			}
		});
	}
	console.log('c');
	socket.on('disconnect', function(){
		console.log('Disconnected!');
	});
	socket.on('usersConnect', function(){
		project.find({projectid:session.project}, function(error, results){
			if(error) throw error;
			else{
				if(users[results[0].adminid]!==undefined || users[results[0].hackerid]!==undefined || users[results[0].developerid]!==undefined || users[results[0].clientid]!==undefined){
					socket.join(results[0].room);
				}
				room = results[0].room;
				adminMessage.find({roomID:room}, function(error, results){
					if(error) throw error;
					else{
						var data = results;
						io.in(room).emit('connectionConfirm', results);
					}
				});
			}
		});
	});
	socket.on('startChat', function(data){
		console.log(data);
	});
	socket.on('adminChat', function(data){
		var dataOB = {
			'id':session.idl,
			'identity':session.identity,
			'roomID':room,
			'message':data,
			'name':name
		};
		adminMessage.create(dataOB, function(error, results){
			if(error) throw error;
			else{
				console.log(results);
				io.in(room).emit('chating', dataOB);
			}
		});
	});
	socket.on('closeAdminSession', function(data){
		project.find({projectid:socket.request.session.project}, function(error, results){
			if(error) throw error;
			else{
				io.in(results[0].room).clients(function(error, clients){
					if(error) throw error;
					else{
						clients.forEach(function(socket_id){
							io.sockets.sockets[users[session.idl]].leave(results[0].room);
						});
					}
				});
			}
		});
	});
});
module.exports = socket;