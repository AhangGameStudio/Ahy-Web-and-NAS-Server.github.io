// 文件数据存储在本地存储中
// 上传的文件将显示在"Save-Fill"文件夹中
const FILES_KEY = 'nas_files';
let uploadedFiles = JSON.parse(localStorage.getItem(FILES_KEY)) || [];

// DOM元素
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const filesGrid = document.getElementById('filesGrid');
const filterButtons = document.querySelectorAll('.filter-btn');

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    renderFiles();
    
    // 事件监听器
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    fileInput.addEventListener('change', handleFileSelect);
    uploadBtn.addEventListener('click', uploadFiles);
    
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
    
    // 初始化上传按钮状态
    uploadBtn.disabled = true;
});

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
    handleFiles(files);
}

function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
        handleFiles(files);
    } else {
        // 如果用户取消了文件选择，恢复原始提示
        resetUploadArea();
    }
}

function handleFiles(files) {
    // 在这里我们可以预览选中的文件
    console.log('Selected files:', files);
    
    // 如果选择了文件，启用上传按钮
    if (files.length > 0) {
        uploadBtn.disabled = false;
        // 显示选中的文件数量
        const fileCount = files.length;
        const totalSize = Array.from(files).reduce((acc, file) => acc + file.size, 0);
        uploadArea.querySelector('.upload-placeholder p').innerHTML = 
            `已选择 ${fileCount} 个文件，总大小: ${formatFileSize(totalSize)}<br>点击"开始上传"按钮上传文件`;
    } else {
        // 如果没有选择文件，重置上传区域
        resetUploadArea();
    }
}

// 重置上传区域到初始状态
function resetUploadArea() {
    uploadArea.querySelector('.upload-placeholder p').innerHTML = 
        '点击选择文件或拖拽文件到此处<br><span class="file-types">支持视频、图片、音频、文档等各类文件</span>';
    uploadBtn.disabled = true;
}

// 上传文件函数
function uploadFiles() {
    const files = Array.from(fileInput.files);
    
    if (files.length === 0) {
        alert('请选择要上传的文件');
        return;
    }
    
    // 验证文件
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.name || file.size <= 0) {
            alert('检测到无效文件，请重新选择文件');
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
                alert(`成功上传 ${files.length} 个文件！`);
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
                
                // 清空文件输入
                fileInput.value = '';
                
                // 重置上传区域
                resetUploadArea();
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
    
    // 保存到本地存储
    localStorage.setItem(FILES_KEY, JSON.stringify(uploadedFiles));
    
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
        } else {
            // 文件图标
            let iconClass = '📁';
            if (file.type.startsWith('video/')) iconClass = '🎬';
            if (file.type.startsWith('audio/')) iconClass = '🎵';
            if (file.type.includes('pdf')) iconClass = '📄';
            if (file.type.includes('zip') || file.type.includes('rar')) iconClass = '📦';
            
            previewHTML = `<div class="file-preview"><div class="file-icon">${iconClass}</div></div>`;
        }
        
        fileCard.innerHTML = `
            ${previewHTML}
            <div class="file-info">
                <div class="file-name" title="${file.name}">${file.name}</div>
                <div class="file-size">${formatFileSize(file.size)}</div>
                <div class="file-actions">
                    <button class="action-btn download-btn" onclick="downloadFile('${file.id}')">下载</button>
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
    
    // 更新本地存储
    localStorage.setItem(FILES_KEY, JSON.stringify(uploadedFiles));
    
    // 重新渲染
    renderFiles(document.querySelector('.filter-btn.active').dataset.filter);
}