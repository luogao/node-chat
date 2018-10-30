const express = require('express')
const app = express();

const server = require('http').Server(app);
const io = require('socket.io')(server);

const SYSTEM = 'System'

console.log("\33[2J")
// 设置静态文件夹
app.use(express.static(__dirname))

io.on('connection', socket => {
	// 监听客户端的消息
	let username
	socket.on('message', msg => {

		const createAt = new Date().toLocaleDateString()
		if (username) {
			// 就向所有人广播
			io.emit('message', {
				user: username,
				content: msg,
				createAt
			})
			
		} else {
			// 如果是第一次进入的话，就将输入的内容当做用户名
			username = msg

			// socket.broadcast.emit 向除了自己的所有人广播，毕竟进没进入自己是知道的，没必要跟自己再说一遍
			socket.broadcast.emit('message', {
				user: SYSTEM,
				content: `${username} 加入了聊天！`,
				createAt
			})

		}

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