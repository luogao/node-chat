const app = require('express')();
const express = require('express')
const server = require('http').Server(app);
const io = require('socket.io')(server);

let count = 0;

// 设置静态文件夹
app.use(express.static(__dirname))

io.on('connection', function (socket) {
	console.log("\33[2J");
	console.log('a user connected');

	// send 方法来给客户端发消息
	socket.send('hello world')

	socket.on('message', function (msg) {
		console.log(msg)
		socket.send('nice to meet you')
	});

});

server.listen(4000, function () {
	console.log('listening on:4000');
});

// app.get('/', function(req, res) {
// 	res.sendFile(__dirname + '/index.html');
// });

// app.get('/room1', function(req, res) {
// 	res.sendFile(__dirname + '/room1.html');
// });

// io.emit('some event', {
// 	for: 'everyone'
// });

// io.on('connection', function(socket) {
// 	socket.broadcast.emit('hi');
// });

// io.on('connection', function(socket) {
// 	count++;
// 	console.log('User connected' + count + 'user(s) present');
// 	socket.emit('chat message', '你上线了')
// 	socket.emit('users', {
// 		number: count
// 	})
// 	socket.broadcast.emit('users', {
// 		number: count
// 	});
// 	socket.on('chat message', function(msg) {
// 		io.emit('chat message', msg);
// 	});
// 	socket.on('disconnect', function() {
// 		count--;
// 		console.log('User disconnected');
// 		socket.broadcast.emit('users', {
// 			number: count
// 		});
// 		socket.emit('users', {
// 			number: count
// 		});
// 	});
// });