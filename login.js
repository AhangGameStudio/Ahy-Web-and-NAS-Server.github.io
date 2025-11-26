// login.js - 登录页面的JavaScript代码

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // 验证用户凭据
        validateCredentials(username, password);
    });
});

function validateCredentials(username, password) {
    // 读取用户文件
    fetch('Login/user.txt')
        .then(response => response.text())
        .then(data => {
            // 解析用户数据
            const lines = data.split('\n');
            let authenticated = false;
            
            for (const line of lines) {
                // 跳过注释行和空行
                if (line.trim() === '' || line.startsWith('#')) {
                    continue;
                }
                
                // 解析用户名和密码
                const [storedUsername, storedPassword] = line.split(':');
                
                if (storedUsername === username && storedPassword === password) {
                    authenticated = true;
                    break;
                }
            }
            
            if (authenticated) {
                // 保存登录状态到本地存储
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('currentUser', username);
                
                // 创建用户专属目录
                createUserDirectory(username);
                
                // 跳转到主页面
                alert('登录成功！');
                window.location.href = 'index.html';
            } else {
                alert('用户名或密码错误，请重试。');
            }
        })
        .catch(error => {
            console.error('Error reading user file:', error);
            alert('登录过程中发生错误，请重试。');
        });
}

function createUserDirectory(username) {
    // 在实际应用中，这里会创建用户的专属目录
    // 由于这是一个前端应用，我们将用户信息保存到本地存储
    const userDirectories = JSON.parse(localStorage.getItem('userDirectories')) || {};
    userDirectories[username] = `Save-Fill/${username}`;
    localStorage.setItem('userDirectories', JSON.stringify(userDirectories));
}