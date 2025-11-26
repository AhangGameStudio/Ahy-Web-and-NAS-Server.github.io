// login.js - 登录页面的JavaScript代码

// 引入认证模块
function loadAuthModule() {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'auth.js';
        script.onload = () => resolve(window.authModule);
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

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

async function validateCredentials(username, password) {
    try {
        // 使用认证模块验证凭据
        const isAuthenticated = await validateCredentialsAsync(username, password);
        
        if (isAuthenticated) {
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
    } catch (error) {
        console.error('登录过程中发生错误:', error);
        alert('登录过程中发生错误，请重试。');
    }
}

// 异步验证凭据函数
async function validateCredentialsAsync(username, password) {
    try {
        // 直接使用auth.js模块中的函数
        if (typeof validateCredentials === 'function') {
            return await validateCredentials(username, password);
        }
        
        // 备用实现
        // 尝试从localStorage获取用户数据
        const userData = localStorage.getItem('userDatabase');
        if (userData) {
            const lines = userData.split('\n');
            
            for (const line of lines) {
                // 跳过注释行和空行
                if (line.trim() === '' || line.startsWith('#')) {
                    continue;
                }
                
                // 解析用户名和密码
                const [storedUsername, storedPassword] = line.split(':');
                
                if (storedUsername === username && storedPassword === password) {
                    return true;
                }
            }
            return false;
        }
        
        // 如果localStorage中没有数据，则从user.txt文件加载
        const response = await fetch('Login/user.txt');
        if (!response.ok) {
            throw new Error('无法加载用户数据');
        }
        
        const data = await response.text();
        // 保存到localStorage以便后续使用
        localStorage.setItem('userDatabase', data);
        
        const lines = data.split('\n');
        for (const line of lines) {
            // 跳过注释行和空行
            if (line.trim() === '' || line.startsWith('#')) {
                continue;
            }
            
            // 解析用户名和密码
            const [storedUsername, storedPassword] = line.split(':');
            
            if (storedUsername === username && storedPassword === password) {
                return true;
            }
        }
        
        return false;
    } catch (error) {
        console.error('验证用户凭据时出错:', error);
        return false;
    }
}

function createUserDirectory(username) {
    // 在实际应用中，这里会创建用户的专属目录
    // 由于这是一个前端应用，我们将用户信息保存到本地存储
    const userDirectories = JSON.parse(localStorage.getItem('userDirectories')) || {};
    userDirectories[username] = `Save-Fill/${username}`;
    localStorage.setItem('userDirectories', JSON.stringify(userDirectories));
}