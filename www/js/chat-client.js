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

    //发送消息
    $('#sendMsg').click(() => {
        var sendMsg = $('#input-area').val().trim();
        if (sendMsg) {
            socket.emit('sendMsg', {
                msg: sendMsg,
                type: 'text'
            });
            $('#input-area').val('');
        }
        return false;
        
    })

    //客户端监听接受到的消息
    socket.on('receiveMsg', (data) => {
        
        //显示的时候对文字和图片进行区分
        var pos = data.isMe ? 'right' : 'left';
        var item;
        if (data.type === 'text') {
            //监测是否包含表情
            var msg = data.msg;
            if(msg.indexOf('[emoji') > -1) {
                //包含小表情
                while(msg.indexOf('[emoji') > -1) {
                    start = msg.indexOf('[emoji');
                    end = msg.indexOf(']');
                    msg = msg.substring(0, start) + `<img src="/image/emoji/emoji (${msg.substring(start + 6, end)}).png" />` + msg.substring(end + 1);
                }
            }
            item =  `
                <li class='${pos}'>
                <img src="${data.userAvatar}">
                <div>
                    <span>${data.user}</span>
                    <p style="color: ${color}">${msg}</p>
                </div>
            </li>`;
        } else if (data.type === 'img') {
            item =  `
            <li class='${pos}'>
                <img src="${data.userAvatar}">
                <div>
                    <span>${data.user}</span>
                    <p > <img class='sendImg' src='${data.src}' /></p>
                </div>
            </li>`;
        }
        $('#messages').append(item);

        $("#messages").scrollTop($("#messages")[0].scrollHeight);
    });

    //客户端监听用户上线、下线问题
    socket.on('system', (data) => {
        //
        var time = new Date().toTimeString().substr(0, 5);
        var state = data.state ? '已下线' : '已上线';
        var info = `<p class='system'><span>${time} ${data.user}${state}</span></p>`;
        $('#messages').append(info)
    })

    //发送图片，
    //$('#upload-img').change(function() {});change里面函数不能写成箭头函数
    $('#upload-img').change(function() {

        var img = this.files[0];
        var read = new FileReader();

        read.onerror = () => {
            alert('上传图片失败');
        }
        read.readAsDataURL(img);
        //这里只能写成read.onload = function() {},不能写成read.onload = () => {}
        read.onload = function() {
            //拿到
            var src = this.result;
            socket.emit('sendMsg', {
                type: 'img',
                src: src
            })
        }
    })

   //展示小表情
    $('#smile').click(() => {
        $('.emoji').html('');
        for(var i = 1; i< 142; i++) {
            var src = '/image/emoji/emoji (' + i + ').png';
            var item = `<li class='emoji-item'><img src="${src}" /> </li>`;
            $('.emoji').append(item);
        } 
        if($('.selectBox').css('display') === 'none' ) {
            $('.selectBox').css('display', 'block')
        } else {
            $('.selectBox').css('display', 'none')
        }
    })
    
    //点选小表情
    $('.emoji').click((e) => {
        
        $('.selectBox').css('display', 'none');
        //获取点选小表情的src
        var src = e.target.src;
        if (src) {
            var pos1 = src.indexOf('(') + 1;
            var pos2 = src.indexOf(')');
            src = src.substring(pos1, pos2);
            var val = $('#input-area').val();
            $('#input-area').val(val + '[emoji'+ src +']');
        }
        
    })

})();