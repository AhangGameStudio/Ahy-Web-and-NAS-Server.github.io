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
}

// 异步验证凭据函数
async function validateCredentialsAsync(username, password) {
    try {
        // 直接使用auth.js模块中的函数
        if (typeof window.validateCredentialsFromAuth === 'function') {
            // 先尝试使用本地验证
            try {
                const localResult = await window.validateCredentialsFromAuth(username, password);
                if (localResult) {
                    return true;
                }
            } catch (localError) {
                // 如果本地验证失败，继续尝试API验证
                console.log('本地验证失败，尝试通过API验证');
            }
        }
        
        // 通过API验证用户凭据
        const response = await fetch('/www.ahangya.cyou/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        if (!response.ok) {
            // 如果响应不是OK，返回false表示验证失败
            return false;
        }
        
        const result = await response.json();
        return result.success || false;
    } catch (error) {
        console.error('验证用户凭据时出错:', error);
        // 即使出现错误，也要避免重复弹窗，只返回false
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