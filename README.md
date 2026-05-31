# DTRB2 数码兽进化路线查看器

基于Go语言的独立可执行文件，所有资源已内嵌。

## 下载

直接从 [Releases](https://github.com/jisxu/dtrb2viewer/releases) 页面下载预编译版本。

## 快速开始

### Windows用户
双击运行 `start.bat` 即可（首次运行会自动编译）

### Linux/Mac用户
```bash
./start.sh
```

启动后浏览器会自动打开，如未打开请访问 http://localhost:8080

## 端口配置

默认端口为 8080，可通过以下方式修改：

```bash
# Windows
start.bat 9090

# Linux/Mac
./start.sh 9090
```

## 构建

### 使用构建脚本

```bash
# Windows
build.bat

# Linux/Mac
./build.sh
```

构建产物输出到 `build/` 目录：
- `build/dtrb2-viewer.exe` (Windows版本)
- `build/dtrb2-viewer-linux` (Linux版本)

### 手动构建

```bash
# 安装依赖
go mod tidy

# 构建当前平台版本
go build -o build/dtrb2-viewer .

# 交叉编译
GOOS=windows GOARCH=amd64 go build -o build/dtrb2-viewer.exe .
GOOS=linux GOARCH=amd64 go build -o build/dtrb2-viewer-linux .
```

## 功能

- 网状图展示数码兽进化路线
- 支持搜索和筛选
- 显示数码兽图片
- 点击查看详情和进化关系
- 收藏系统（本地存储）

## 发布新版本

```bash
# 创建tag并推送，会自动触发GitHub Actions构建并发布Release
git tag v1.0.0
git push origin v1.0.0
```