# DTRB2 数码兽进化路线查看器

基于Go语言的独立可执行文件，所有资源已内嵌。

## 下载

直接从 [Releases](https://github.com/jisxu/dtrb2viewer/releases) 页面下载预编译版本。

## 运行

下载对应平台的可执行文件，直接运行即可启动服务，浏览器会自动打开。

```bash
# Windows
dtrb2-viewer.exe

# Linux
./dtrb2-viewer-linux
```

## 端口配置

默认端口为 8080，可通过以下方式修改：

```bash
# 使用命令行参数
./dtrb2-viewer -port 9090

# 使用环境变量 (Linux/Mac)
PORT=9090 ./dtrb2-viewer

# 使用环境变量 (Windows)
set PORT=9090 && dtrb2-viewer.exe
```

## 使用PM2部署（Linux）

```bash
# 使用ecosystem配置文件启动（推荐）
cd deploy
pm2 start ecosystem.config.js

# 常用命令
pm2 list                    # 查看进程列表
pm2 logs dtrb2-viewer       # 查看日志
pm2 restart dtrb2-viewer    # 重启
pm2 stop dtrb2-viewer       # 停止
pm2 save                    # 保存进程列表
pm2 startup                 # 设置开机自启
```

## 构建

### 使用构建脚本

```bash
# Windows
scripts\build.bat

# Linux/Mac
./scripts/build.sh
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
