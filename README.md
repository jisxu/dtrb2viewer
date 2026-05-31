# DTRB2 数码兽进化路线查看器

基于Go语言的独立可执行文件，所有资源已内嵌。

## 运行

直接双击 `dtrb2-viewer.exe` 即可启动服务，浏览器会自动打开。

## 构建

```bash
# 安装依赖
go mod tidy

# 编译
go build -o dtrb2-viewer.exe .

# 或者运行 build.bat
```

## 访问

启动后访问: http://localhost:8080

## 功能

- 网状图展示数码兽进化路线
- 支持搜索和筛选
- 显示数码兽图片
- 点击查看详情和进化关系
