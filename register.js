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

async function registerUser(username, password) {
    try {
        // 检查用户是否已存在
        const userExists = await checkUserExistsAsync(username);
        
        if (userExists) {
            alert('用户名已存在，请选择其他用户名。');
        } else {
            // 保存新用户
            await saveNewUserAsync(username, password);
        }
    } catch (error) {
        console.error('注册过程中发生错误:', error);
        alert('注册过程中发生错误，请重试。');
    }
}

// 异步检查用户是否存在
async function checkUserExistsAsync(newUsername) {
    try {
        // 直接使用auth.js模块中的函数
        if (typeof checkUserExists === 'function') {
            return await checkUserExists(newUsername);
        }
        
        // 备用实现
        // 尝试从localStorage获取用户数据
        const userData = localStorage.getItem('userDatabase');
        if (userData) {
            const lines = userData.split('\n');
            
            for (const line of lines) {
                if (line.trim() === '' || line.startsWith('#')) {
                    continue;
                }
                
                const [storedUsername, storedPassword] = line.split(':');
                
                if (storedUsername === newUsername) {
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
            if (line.trim() === '' || line.startsWith('#')) {
                continue;
            }
            
            const [storedUsername, storedPassword] = line.split(':');
            
            if (storedUsername === newUsername) {
                return true;
            }
        }
        
        return false;
    } catch (error) {
        console.error('检查用户是否存在时出错:', error);
        return false;
    }
}

// 异步保存新用户
async function saveNewUserAsync(username, password) {
    try {
        // 直接使用auth.js模块中的函数
        if (typeof addUser === 'function') {
            await addUser(username, password);
        } else {
            // 备用实现
            // 获取现有的用户数据
            let userData = '';
            try {
                const response = await fetch('Login/user.txt');
                if (response.ok) {
                    userData = await response.text();
                    // 保存到localStorage以便后续使用
                    localStorage.setItem('userDatabase', userData);
                }
            } catch (error) {
                // 如果无法从文件加载，则从localStorage获取
                userData = localStorage.getItem('userDatabase') || '';
            }
            
            // 添加新用户
            const newUserEntry = `\n${username}:${password}`;
            const updatedData = userData + newUserEntry;
            
            // 保存更新后的数据到localStorage
            localStorage.setItem('userDatabase', updatedData);
        }
        
        // 创建用户专属目录
        createUserDirectory(username);
        
        alert('注册成功！现在您可以登录了。');
        window.location.href = 'login.html';
    } catch (error) {
        console.error('保存新用户时出错:', error);
        alert('注册过程中发生错误，请重试。');
    }
}

function createUserDirectory(username) {
    // 创建用户专属目录信息
    const userDirectories = JSON.parse(localStorage.getItem('userDirectories')) || {};
    userDirectories[username] = `Save-Fill/${username}`;
    localStorage.setItem('userDirectories', JSON.stringify(userDirectories));
}