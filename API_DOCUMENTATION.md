# API 文档

本文档描述了前端应用程序需要与后端服务器交互的API接口。

## 注册接口

### 请求
- **URL**: `/api/register`
- **方法**: `POST`
- **头部**: 
  - `Content-Type: application/json`
- **请求体**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```

### 响应

#### 成功响应
- **状态码**: `200 OK`
- **响应体**:
  ```json
  {
    "success": true,
    "message": "用户注册成功"
  }
  ```

#### 错误响应
- **状态码**: `400 Bad Request` 或 `409 Conflict`
- **响应体**:
  ```json
  {
    "success": false,
    "message": "错误描述信息"
  }
  ```

## 登录接口

### 请求
- **URL**: `/api/login`
- **方法**: `POST`
- **头部**: 
  - `Content-Type: application/application/json`
- **请求体**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```

### 响应

#### 成功响应
- **状态码**: `200 OK`
- **响应体**:
  ```json
  {
    "success": true,
    "message": "登录成功"
  }
  ```

#### 错误响应
- **状态码**: `400 Bad Request` 或 `401 Unauthorized`
- **响应体**:
  ```json
  {
    "success": false,
    "message": "用户名或密码错误"
  }
  ```

## user.txt 文件格式

注册的用户信息应以以下格式追加到 `Login/user.txt` 文件中：

```
# 用户登录信息文件
# 格式: username:password
# 示例:
admin:123456
user:password
newuser:newpassword
```

每一行代表一个用户，用户名和密码之间用冒号分隔。

## 实现建议

后端实现应该：
1. 验证请求参数的有效性
2. 检查用户名是否已存在（对于注册接口）
3. 将新用户信息以正确的格式追加到 `Login/user.txt` 文件中
4. 对于登录接口，验证提供的凭据是否与文件中的记录匹配
5. 返回适当的响应状态码和消息

## 注意事项

本项目已修改为完全前端实现，不再依赖后端API：
- 用户认证信息存储在浏览器本地存储中
- 文件存储在浏览器本地存储中
- NCM格式音乐文件检测功能仅在本地开发环境中可完整体验
- 在GitHub Pages等静态托管服务上，NCM文件将作为普通文件处理