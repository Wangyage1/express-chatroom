//服务器端代码

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
//用户信息,相当于数据库
const users = [{
    username: 'Eleanor',
    password: '123456'
}, {
    username: 'Ella',
    password: '123456'
}]

//存储在线用户
var onlineUsers = [];
app.set('views', 'views');
app.set('view engine', 'ejs');

//加载静态资源
app.use(express.static(__dirname + '/www'));

//渲染首页
app.use('/', (req, res) => {
    res.render('index');
});

//findUser，把用户提交上来的信息和数据库中代码做比对
function findUser(user) {
    return users.find((item) => {
        return item.username === user.username && item.password === user.password
    })
}

io.on('connection', (socket) => {
    console.log('连接到服务器端');
    //所有的事件都会写在connection里面，首先客户端要先连接到服务器端

    //显示在线用户
    io.emit('displayUser', onlineUsers)
    //监听客户端发送过来的登录事件
    socket.on('login', (user) => {
        if(findUser(user)) {
            //登录成功
            user.img = '/image/user'+ Math.floor(Math.random() * 4) + '.jpg';
            onlineUsers.push(user);
            socket.userInfo = user;

            socket.emit('loginSuccess');
            io.emit('displayUser', onlineUsers);
            //广播上线信息
            io.emit('system', {
                user: user.username,
                state: 0 //上线
            })
        } else {
            socket.emit('loginError', '用户名密码不匹配！');
        }
    });

    //监听客户端发送过来的消息，
    socket.on('sendMsg', (msg) => {
        
        //广播给自己
        socket.emit('receiveMsg', {
            user: socket.userInfo.username,
            userAvatar: socket.userInfo.img,
            msg: msg,
            type: 'text',
            isMe: true
        })

        //广播给除了自己以外的其他用户
        socket.broadcast.emit('receiveMsg', {
            user: socket.userInfo.username,
            userAvatar: socket.userInfo.img,
            msg: msg,
            type: 'text',
            isMe: false
        })
    })

    socket.on('disconnect', () => {
        io.emit('system', {
            user: socket.userInfo.username,
            state: 1 //下线
        })
    })


});


http.listen(9000, () => {
    console.log('listening on 9000');
})