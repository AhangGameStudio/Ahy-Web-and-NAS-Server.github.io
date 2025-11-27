// 文件数据存储在本地存储中
// 上传的文件将显示在"Save-Fill"文件夹中
let currentUserIPPrefix = null;
let currentStorageKey = null;

// 初始化用户系统
async function initializeUser() {
    try {
        // 获取用户IP前缀
        const ipPrefix = await getUserIPPrefx();
        
        // 设置当前存储键
        currentStorageKey = `nas_files_${ipPrefix}`;
        
        // 创建存储文件夹
        createStorageFolder(ipPrefix);
        
        // 在UI中显示用户识别号
        const currentUserElement = document.getElementById('currentUser');
        if (currentUserElement) {
            currentUserElement.textContent = `欢迎, ${ipPrefix}!`;
        }
        
        console.log(`用户 ${ipPrefix} 初始化完成，存储键: ${currentStorageKey}`);
        
        // 加载用户的文件
        loadUserFiles();
        
        // 初始化界面
        renderFiles();
    } catch (error) {
        console.error('用户初始化失败:', error);
        // 使用默认值
        currentUserIPPrefix = 'guest';
        currentStorageKey = 'nas_files_guest';
        const currentUserElement = document.getElementById('currentUser');
        if (currentUserElement) {
            currentUserElement.textContent = '欢迎, 访客!';
        }
        
        // 加载默认用户的文件
        loadUserFiles();
        
        // 初始化界面
        renderFiles();
    }
}

// 获取用户IP前缀
async function getUserIPPrefx() {
    // 首先检查是否有用户手动输入的识别号
    const manualId = localStorage.getItem('manual_user_id');
    if (manualId) {
        console.log('使用用户手动输入的识别号:', manualId);
        return manualId;
    }
    
    // 尝试多个IP获取服务
    const ipServices = [
        'https://api.ipify.org?format=json',
        'https://ipinfo.io/json',
        'https://api.my-ip.io/ip.json'
    ];
    
    for (const service of ipServices) {
        try {
            // 设置超时时间
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超时
            
            const response = await fetch(service, {
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            const data = await response.json();
            
            // 根据不同服务的响应格式提取IP
            let ip;
            if (data.ip) {
                ip = data.ip;
            } else if (data.query) {
                ip = data.query;
            }
            
            if (ip) {
                // 提取IP地址的第一段作为识别号
                const ipPrefix = ip.split('.')[0];
                // 保存到localStorage以便后续使用
                localStorage.setItem('user_ip_prefix', ipPrefix);
                return ipPrefix;
            }
        } catch (error) {
            console.error(`通过 ${service} 获取IP地址失败:`, error);
            // 继续尝试下一个服务
        }
    }
    
    // 如果所有服务都失败，使用本地存储的IP或默认值
    const storedIP = localStorage.getItem('user_ip_prefix');
    if (storedIP) {
        console.log('使用本地存储的IP前缀:', storedIP);
        return storedIP;
    }
    
    // 如果都没有，生成一个随机数作为用户标识
    const randomId = Math.floor(Math.random() * 1000);
    const randomPrefix = `user${randomId}`;
    localStorage.setItem('user_ip_prefix', randomPrefix);
    console.log('使用随机生成的用户标识:', randomPrefix);
    return randomPrefix;
}

// 创建存储文件夹（在localStorage中模拟）
function createStorageFolder(ipPrefix) {
    // 在localStorage中创建一个标识，表示该IP前缀的用户已存在
    const userExistsKey = `user_${ipPrefix}_exists`;
    if (!localStorage.getItem(userExistsKey)) {
        localStorage.setItem(userExistsKey, 'true');
        console.log(`为用户 ${ipPrefix} 创建存储空间`);
    }
    
    // 保存IP前缀到localStorage，以便在无法获取真实IP时使用
    localStorage.setItem('user_ip_prefix', ipPrefix);
}

// 加载用户文件
function loadUserFiles() {
    uploadedFiles = JSON.parse(localStorage.getItem(currentStorageKey)) || [];
}

let uploadedFiles = [];

// DOM元素
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const filesGrid = document.getElementById('filesGrid');
const filterButtons = document.querySelectorAll('.filter-btn');

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化用户
    initializeUser();
    
    // 事件监听器
    uploadArea.addEventListener('click', handleUploadAreaClick);
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    fileInput.addEventListener('change', handleFileSelect);
    
    // 过滤按钮事件
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // 更新活动按钮
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // 过滤文件
            const filterType = btn.dataset.filter;
            renderFiles(filterType);
        });
    });
    
    // 识别号输入框事件
    const userIdInput = document.getElementById('userIdInput');
    const saveUserIdBtn = document.getElementById('saveUserId');
    
    // 如果localStorage中有保存的识别号，则填充到输入框
    const savedManualId = localStorage.getItem('manual_user_id');
    if (savedManualId && userIdInput) {
        userIdInput.value = savedManualId;
    }
    
    // 保存识别号按钮事件
    if (saveUserIdBtn) {
        saveUserIdBtn.addEventListener('click', function() {
            const userId = userIdInput ? userIdInput.value.trim() : '';
            
            if (userId) {
                // 保存用户手动输入的识别号
                localStorage.setItem('manual_user_id', userId);
                localStorage.setItem('user_ip_prefix', userId);
                alert(`识别号 "${userId}" 已保存！页面将重新加载以应用更改。`);
                
                // 重新初始化用户系统
                location.reload();
            } else {
                // 如果输入为空，清除手动设置的识别号
                localStorage.removeItem('manual_user_id');
                alert('已清除手动识别号，将使用自动生成的识别号。页面将重新加载。');
                
                // 重新初始化用户系统
                location.reload();
            }
        });
    }
});

// 处理上传区域点击事件
function handleUploadAreaClick() {
    // 只有当上传区域可用时才触发文件选择
    if (uploadArea.style.pointerEvents !== 'none') {
        fileInput.click();
    }
}



// 拖拽事件处理
function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
        // 检查是否有NCM文件需要转换
        checkAndConvertNCMFiles(files).then(processedFiles => {
            uploadFilesAuto(processedFiles);
        });
    }
}

function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
        // 检查是否有NCM文件需要转换
        checkAndConvertNCMFiles(files).then(processedFiles => {
            // 禁用上传区域点击事件，防止重复选择
            uploadArea.style.pointerEvents = 'none';
            uploadArea.style.opacity = '0.8';
            
            // 直接调用自动上传函数
            uploadFilesAuto(processedFiles);
        });
    }
}



// 重置上传区域到初始状态
function resetUploadArea() {
    uploadArea.querySelector('.upload-placeholder p').innerHTML = 
        '点击选择文件或拖拽文件到此处<br><span class="file-types">支持视频、图片、音频、文档等各类文件</span>';
    // 重新启用上传区域点击事件
    uploadArea.style.pointerEvents = 'auto';
    uploadArea.style.opacity = '1';
}



// 自动上传文件函数（选择文件后自动上传）
function uploadFilesAuto(files) {
    // 验证文件
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.name || file.size <= 0) {
            alert('检测到无效文件，请重新选择文件');
            resetUploadArea();
            return;
        }
    }
    
    // 显示进度条
    progressContainer.style.display = 'block';
    
    // 模拟上传过程
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            
            // 上传完成后保存文件信息
            try {
                saveFiles(files);
            } catch (error) {
                console.error('上传失败:', error);
                alert('文件上传过程中发生错误，请重试');
            }
            
            // 隐藏进度条
            setTimeout(() => {
                progressContainer.style.display = 'none';
                // 重置进度
                progressBar.style.width = '0%';
                progressText.textContent = '0%';
                
                // 重置上传区域
                resetUploadArea();
                // 清空文件输入框
                fileInput.value = '';
            }, 500);
        }
        
        // 更新进度条
        progressBar.style.width = progress + '%';
        progressText.textContent = Math.round(progress) + '%';
    }, 200);
}

// 保存文件信息到本地存储
function saveFiles(files) {
    files.forEach(file => {
        // 创建文件对象
        const fileObj = {
            id: Date.now() + Math.random(), // 简单的ID生成
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified,
            // 在实际应用中，这里会是文件的URL
            // 但在纯前端应用中，我们只能保存文件信息
            url: URL.createObjectURL(file)
        };
        
        uploadedFiles.push(fileObj);
    });
    
    // 保存到本地存储，使用基于IP的存储键
    if (currentStorageKey) {
        localStorage.setItem(currentStorageKey, JSON.stringify(uploadedFiles));
    }
    
    // 重新渲染文件列表
    renderFiles();
    
    alert(`成功上传 ${files.length} 个文件！`);
}

// 获取文件类型
function getFileType(fileType) {
    if (fileType.startsWith('image/')) return 'image';
    if (fileType.startsWith('video/')) return 'video';
    if (fileType.startsWith('audio/')) return 'audio';
    return 'document';
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 渲染文件列表
function renderFiles(filterType = 'all') {
    // 清空文件网格
    filesGrid.innerHTML = '';
    
    // 过滤文件
    let filteredFiles = uploadedFiles;
    if (filterType !== 'all') {
        filteredFiles = uploadedFiles.filter(file => getFileType(file.type) === filterType);
    }
    
    // 如果没有文件，显示空状态
    if (filteredFiles.length === 0) {
        filesGrid.innerHTML = '<div class="empty-state"><p>' + 
            (uploadedFiles.length === 0 ? '暂无文件，请先上传文件' : '没有找到匹配的文件') + 
            '</p></div>';
        return;
    }
    
    // 渲染文件卡片
    filteredFiles.forEach(file => {
        const fileCard = document.createElement('div');
        fileCard.className = 'file-card';
        
        // 根据文件类型显示不同的预览
        let previewHTML = '';
        if (file.type.startsWith('image/')) {
            previewHTML = `<div class="file-preview"><img src="${file.url}" alt="${file.name}"></div>`;
        } else if (file.type.startsWith('video/')) {
            // 视频预览
            previewHTML = `
                <div class="file-preview">
                    <video controls width="100%" height="150">
                        <source src="${file.url}" type="${file.type}">
                        您的浏览器不支持视频播放。
                    </video>
                </div>
            `;
        } else if (file.type.startsWith('audio/')) {
            // 音频预览
            previewHTML = `
                <div class="file-preview">
                    <audio controls style="width: 100%; margin-top: 10px;">
                        <source src="${file.url}" type="${file.type}">
                        您的浏览器不支持音频播放。
                    </audio>
                </div>
            `;
        } else {
            // 文件图标
            let iconClass = '📁';
            if (file.type.includes('pdf')) iconClass = '📄';
            if (file.type.includes('zip') || file.type.includes('rar')) iconClass = '📦';
            
            previewHTML = `<div class="file-preview"><div class="file-icon">${iconClass}</div></div>`;
        }
        
        // 为视频文件添加转码按钮
        let extraActions = '';
        if (file.type.startsWith('video/')) {
            extraActions = `
                <button class="action-btn transcode-btn" onclick="transcodeVideo('${file.id}', '1080P')">转码1080P</button>
                <button class="action-btn transcode-btn" onclick="transcodeVideo('${file.id}', '4K')">转码4K</button>
            `;
        }

        fileCard.innerHTML = `
            ${previewHTML}
            <div class="file-info">
                <div class="file-name" title="${file.name}">${file.name}</div>
                <div class="file-size">${formatFileSize(file.size)}</div>
                <div class="file-actions">
                    <button class="action-btn download-btn" onclick="downloadFile('${file.id}')">下载</button>
                    ${extraActions}
                    <button class="action-btn delete-btn" onclick="deleteFile('${file.id}')">删除</button>
                </div>
            </div>
        `;
        
        filesGrid.appendChild(fileCard);
    });
}

// 下载文件
// 用户可以从"Save-Fill"文件夹中下载任何已上传的文件
function downloadFile(fileId) {
    const file = uploadedFiles.find(f => f.id == fileId);
    if (!file) return;
    
    // 创建临时下载链接
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 删除文件
function deleteFile(fileId) {
    if (!confirm('确定要删除这个文件吗？')) return;
    
    // 从数组中移除
    uploadedFiles = uploadedFiles.filter(file => file.id != fileId);
    
    // 更新本地存储，使用基于IP的存储键
    if (currentStorageKey) {
        localStorage.setItem(currentStorageKey, JSON.stringify(uploadedFiles));
    }
    
    // 重新渲染
    renderFiles(document.querySelector('.filter-btn.active').dataset.filter);
}

// 转码视频
async function transcodeVideo(fileId, resolution) {
    const file = uploadedFiles.find(f => f.id == fileId);
    if (!file) return;
    
    try {
        // 显示转码提示
        alert(`开始转码视频 ${file.name} 到 ${resolution}...`);
        
        // 获取原始文件（需要从localStorage或其他地方获取原始文件blob）
        // 这里我们模拟转码过程
        const transcodedFile = await videoTranscoder[`transcodeTo${resolution}`](new Blob(), file);
        
        // 添加转码后的文件到文件列表
        const fileObj = {
            id: Date.now() + Math.random(),
            name: transcodedFile.name,
            size: transcodedFile.size,
            type: transcodedFile.type,
            lastModified: Date.now(),
            url: URL.createObjectURL(transcodedFile)
        };
        
        uploadedFiles.push(fileObj);
        
        // 保存到本地存储
        if (currentStorageKey) {
            localStorage.setItem(currentStorageKey, JSON.stringify(uploadedFiles));
        }
        
        // 重新渲染文件列表
        renderFiles();
        
        alert(`视频 ${file.name} 已成功转码到 ${resolution}!`);
    } catch (error) {
        console.error('视频转码失败:', error);
        alert(`视频转码失败: ${error.message}`);
    }
}

// 检测NCM文件并转换
async function checkAndConvertNCMFiles(files) {
    // 检查是否在本地环境运行
    const isLocalhost = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1' ||
                        window.location.hostname === '[::1]' ||
                        window.location.protocol === 'file:';
    
    if (!isLocalhost) {
        // 在GitHub Pages等远程环境中，显示提示信息
        console.log('NCM转换功能在静态托管环境下功能受限');
        return files; // 直接返回原文件
    }
    
    const processedFiles = [];
    
    for (const file of files) {
        // 检查文件是否为NCM格式（通过文件头检测）
        const isNCM = await detectNCMFile(file);
        
        if (isNCM) {
            try {
                // 显示转换提示
                alert(`检测到NCM格式文件: ${file.name}\n正在尝试转换为MP3格式...`);
                
                // 对于NCM文件，我们只做模拟转换
                // 在实际应用中，这里需要实现真正的NCM解密和转换逻辑
                // 但由于浏览器安全限制，纯前端无法实现NCM解密
                
                // 模拟转换过程
                const convertedFileName = file.name.replace(/\.ncm$/i, '.mp3');
                
                // 创建一个新的Blob对象模拟转换后的文件
                const convertedFile = new File([file], convertedFileName, {
                    type: 'audio/mpeg',
                    lastModified: Date.now()
                });
                
                processedFiles.push(convertedFile);
                
                // 显示转换完成提示
                alert(`${file.name} 已模拟转换为 ${convertedFileName}`);
            } catch (error) {
                console.error('NCM转换失败:', error);
                alert(`NCM文件 ${file.name} 转换失败: ${error.message}`);
                // 如果转换失败，仍然添加原始文件
                processedFiles.push(file);
            }
        } else if (file.name.toLowerCase().endsWith('.ncm')) {
            // 如果文件扩展名是.ncm但文件头不匹配，显示警告但仍然尝试处理
            alert(`检测到.ncm扩展名文件: ${file.name}\n注意：该文件可能不是有效的NCM格式，将作为普通文件处理。`);
            // 直接添加原始文件
            processedFiles.push(file);
        } else {
            // 非NCM文件直接添加
            processedFiles.push(file);
        }
    }
    
    return processedFiles;
}

// 检测NCM文件（通过文件头）
async function detectNCMFile(file) {
    // NCM文件头为 "CTENFDAM"
    const ncmHeader = "4354454e4644414d"; // "CTENFDAM" 的十六进制表示
    
    try {
        // 确保文件大小足够
        if (file.size < 8) {
            return false;
        }
        
        const arrayBuffer = await file.slice(0, 8).arrayBuffer();
        const header = Array.from(new Uint8Array(arrayBuffer))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
        
        console.log(`文件 ${file.name} 的文件头: ${header}`);
        return header === ncmHeader;
    } catch (error) {
        console.error('检测NCM文件时出错:', error);
        return false;
    }
}