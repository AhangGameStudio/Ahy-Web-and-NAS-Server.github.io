// init-users.js - 初始化用户数据库
(function() {
    // 默认用户数据
    const defaultUsers = `# 用户登录信息文件
# 格式: username:password
# 示例:
admin:123456
user:password`;

    // 初始化用户数据库到localStorage
    if (!localStorage.getItem('userDatabase')) {
        localStorage.setItem('userDatabase', defaultUsers);
        console.log('用户数据库已初始化');
    }
})();