// auth.js - 用户认证功能模块

// 从user.txt文件加载用户数据
function loadUserData() {
    // 在纯前端环境中，我们不能直接读取文件系统中的文件
    // 因此我们使用localStorage作为替代方案
    const userData = localStorage.getItem('userDatabase');
    if (userData) {
        return userData;
    }
    
    // 如果localStorage中没有用户数据，则从user.txt文件加载
    // 注意：这在纯前端环境中可能不工作，除非文件通过HTTP服务器提供
    return fetch('Login/user.txt')
        .then(response => {
            if (!response.ok) {
                throw new Error('无法加载用户数据');
            }
            return response.text();
        })
        .then(data => {
            // 将数据保存到localStorage以便后续使用
            localStorage.setItem('userDatabase', data);
            return data;
        })
        .catch(error => {
            console.error('加载用户数据失败:', error);
            // 返回默认的用户数据
            const defaultUsers = 'admin:123456\nuser:password';
            localStorage.setItem('userDatabase', defaultUsers);
            return defaultUsers;
        });
}

// 验证用户凭据
async function validateCredentials(username, password) {
    try {
        const userData = await loadUserData();
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
    } catch (error) {
        console.error('验证用户凭据时出错:', error);
        return false;
    }
}

// 检查用户名是否已存在
async function checkUserExists(newUsername) {
    try {
        const userData = await loadUserData();
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
    } catch (error) {
        console.error('检查用户是否存在时出错:', error);
        return false;
    }
}

// 添加新用户到数据库
async function addUser(username, password) {
    try {
        // 先加载现有数据
        const userData = await loadUserData();
        
        // 检查用户是否已存在
        if (await checkUserExists(username)) {
            throw new Error('用户名已存在');
        }
        
        // 添加新用户
        const newUserEntry = `\n${username}:${password}`;
        const updatedData = userData + newUserEntry;
        
        // 保存更新后的数据到localStorage
        localStorage.setItem('userDatabase', updatedData);
        
        return true;
    } catch (error) {
        console.error('添加用户时出错:', error);
        throw error;
    }
}

// 创建用户目录
function createUserDirectory(username) {
    // 在实际应用中，这里会创建用户的专属目录
    // 由于这是一个前端应用，我们将用户信息保存到本地存储
    const userDirectories = JSON.parse(localStorage.getItem('userDirectories')) || {};
    userDirectories[username] = `Save-Fill/${username}`;
    localStorage.setItem('userDirectories', JSON.stringify(userDirectories));
}