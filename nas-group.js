// NAS组功能实现

// 创建NAS组（模拟）
async function createNASGroup(username) {
    try {
        // 在实际应用中，这里应该向服务器发送请求来创建用户目录
        // 这里我们只是模拟这个过程
        
        // 将NAS组信息保存到localStorage中
        let nasGroups = JSON.parse(localStorage.getItem('nasGroups') || '{}');
        if (!nasGroups[username]) {
            nasGroups[username] = {
                path: `Save-Fill/${username}`,
                createdAt: new Date().toISOString()
            };
            localStorage.setItem('nasGroups', JSON.stringify(nasGroups));
            console.log(`Created NAS group for user: ${username}`);
            return true;
        } else {
            console.log(`NAS group already exists for user: ${username}`);
            return false;
        }
    } catch (error) {
        console.error('Error creating NAS group:', error);
        return false;
    }
}

// 获取用户NAS组路径
function getUserNASGroupPath(username) {
    try {
        let nasGroups = JSON.parse(localStorage.getItem('nasGroups') || '{}');
        return nasGroups[username] ? nasGroups[username].path : null;
    } catch (error) {
        console.error('Error getting NAS group path:', error);
        return null;
    }
}

// 检查用户是否有NAS组
function hasNASGroup(username) {
    try {
        let nasGroups = JSON.parse(localStorage.getItem('nasGroups') || '{}');
        return !!nasGroups[username];
    } catch (error) {
        console.error('Error checking NAS group:', error);
        return false;
    }
}

// 初始化NAS组功能
async function initNASGroupFeature() {
    // 检查用户是否已登录
    const username = localStorage.getItem('username');
    if (username) {
        // 检查用户是否有NAS组，如果没有则创建
        if (!hasNASGroup(username)) {
            await createNASGroup(username);
        }
        
        // 显示用户NAS组信息
        displayNASGroupInfo(username);
    }
}

// 显示NAS组信息
function displayNASGroupInfo(username) {
    const nasGroupPath = getUserNASGroupPath(username);
    if (nasGroupPath) {
        // 如果页面中有显示NAS组信息的元素，则更新它
        const nasGroupInfoElement = document.getElementById('nasGroupInfo');
        if (nasGroupInfoElement) {
            nasGroupInfoElement.textContent = `NAS组: ${username}`;
            // 添加title属性显示完整路径
            nasGroupInfoElement.title = `路径: ${nasGroupPath}`;
        }
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initNASGroupFeature();
});