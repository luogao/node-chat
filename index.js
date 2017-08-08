var app = require('express')();
var express = require('express')
var http = require('http').Server(app);
var io = require('socket.io')(http);
var count = 0;
app.use(express.static(__dirname))


io.on('connection', function(socket) {
	console.log('a user connected');
	socket.on('disconnect', function() {
		console.log('user disconnected');
	});
});

http.listen(4000, function() {
	console.log('listening on:4000');
});

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});

app.get('/room1', function(req, res) {
	res.sendFile(__dirname + '/room1.html');
});

io.emit('some event', {
	for: 'everyone'
});

io.on('connection', function(socket) {
	socket.broadcast.emit('hi');
});

io.on('connection', function(socket) {
	count++;
	console.log('User connected' + count + 'user(s) present');
	socket.emit('chat message', '你上线了')
	socket.emit('users', {
		number: count
	})
	socket.broadcast.emit('users', {
		number: count
	});
	socket.on('chat message', function(msg) {
		io.emit('chat message', msg);
	});
	socket.on('disconnect', function() {
		count--;
		console.log('User disconnected');
		socket.broadcast.emit('users', {
			number: count
		});
		socket.emit('users', {
			number: count
		});
	});
});