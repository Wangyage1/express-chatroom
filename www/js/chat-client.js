//客户端代码

(function() {
    var socket = io();


    //点击登录
    $('#login-btn').click(() => {
        var username = $('#username').val().trim();
        var password = $('#password').val().trim();
        if (username && password) {
            socket.emit('login', {
                username: username,
                password: password
            })
        }
        return false;
    });

    //客户端监听登录的结果，成功或是失败
    socket.on('loginSuccess', () => {
        //登录成功
        $('.login').hide();
    });
    socket.on('loginError', (msg) => {
        //登录成功
        alert(msg);
    })

    //显示用户信息
    socket.on('displayUser', (onlineUser) => {
        if(onlineUser.length)  {
            $('.contacts p').hide();
            $('#num').html(onlineUser.length);
        }
        $('#users').html('');
        
        onlineUser.map((item) => {
            var userItem = '<li><img src="'+ item.img +'" /><span>'+ item.username +'</span></li>';
            $('#users').append(userItem)
        })
        
    })

    var color;
    $('#color').change((e) => {
        color =  e.target.value;
    })

    $('#sendMsg').click(() => {
        var sendMsg = $('#input-area').val().trim();
        if (sendMsg) {
            socket.emit('sendMsg', sendMsg);
            $('#input-area').val('');
        }
        return false;
        
    })

    socket.on('receiveMsg', (data) => {
        
        var pos = data.isMe ? 'right' : 'left';
        var item =  `
            <li class='${pos}'>
            <img src="${data.userAvatar}">
            <div>
                <span>${data.user}</span>
                <p style="color: ${color}">${data.msg}</p>
            </div>
        </li>`;
        $('#messages').append(item)
    
    });

    socket.on('system', (data) => {
        //
        var time = new Date().toTimeString().substr(0, 5);
        var state = data.state ? '已下线' : '已上线';
        var info = `<p class='system'><span>${time} ${data.user}${state}</span></p>`;
        $('#messages').append(info)
    })

   

})();