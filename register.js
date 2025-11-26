// register.js - 注册页面的JavaScript代码

document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('regUsername').value;
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // 验证密码确认
        if (password !== confirmPassword) {
            alert('密码和确认密码不匹配，请重试。');
            return;
        }
        
        // 注册新用户
        registerUser(username, password);
    });
});

function registerUser(username, password) {
    // 检查用户是否已存在
    fetch('Login/user.txt')
        .then(response => response.text())
        .then(data => {
            const lines = data.split('\n');
            let userExists = false;
            
            for (const line of lines) {
                if (line.trim() === '' || line.startsWith('#')) {
                    continue;
                }
                
                const [storedUsername, storedPassword] = line.split(':');
                
                if (storedUsername === username) {
                    userExists = true;
                    break;
                }
            }
            
            if (userExists) {
                alert('用户名已存在，请选择其他用户名。');
            } else {
                // 保存新用户到user.txt文件
                saveNewUser(username, password);
            }
        })
        .catch(error => {
            console.error('Error reading user file:', error);
            alert('注册过程中发生错误，请重试。');
        });
}

function saveNewUser(username, password) {
    // 在实际应用中，这里会将新用户保存到服务器
    // 由于这是一个前端应用，我们将用户信息保存到本地存储
    
    // 获取现有的用户数据
    fetch('Login/user.txt')
        .then(response => response.text())
        .then(data => {
            // 添加新用户
            const newUserEntry = `\n${username}:${password}`;
            const updatedData = data + newUserEntry;
            
            // 保存更新后的数据（在实际应用中，这里会发送到服务器）
            // 对于前端演示，我们将数据保存到localStorage
            localStorage.setItem('userDatabase', updatedData);
            
            // 创建用户专属目录
            createUserDirectory(username);
            
            alert('注册成功！现在您可以登录了。');
            window.location.href = 'login.html';
        })
        .catch(error => {
            console.error('Error saving user:', error);
            alert('注册过程中发生错误，请重试。');
        });
}

function createUserDirectory(username) {
    // 创建用户专属目录信息
    const userDirectories = JSON.parse(localStorage.getItem('userDirectories')) || {};
    userDirectories[username] = `Save-Fill/${username}`;
    localStorage.setItem('userDirectories', JSON.stringify(userDirectories));
}