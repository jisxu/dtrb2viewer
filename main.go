package main

import (
	"embed"
	"flag"
	"fmt"
	"io/fs"
	"log"
	"net/http"
	"os"
	"os/exec"
	"runtime"
	"strconv"
	"time"
)

//go:embed static/*
var staticFiles embed.FS

func openBrowser(url string) {
	var cmd *exec.Cmd
	switch runtime.GOOS {
	case "windows":
		cmd = exec.Command("cmd", "/c", "start", url)
	case "darwin":
		cmd = exec.Command("open", url)
	default:
		cmd = exec.Command("xdg-open", url)
	}
	_ = cmd.Start()
}

func main() {
	// 命令行参数
	port := flag.Int("port", 0, "监听端口 (默认 8080)")
	flag.Parse()

	// 如果命令行没有指定端口，检查环境变量
	if *port == 0 {
		if envPort := os.Getenv("PORT"); envPort != "" {
			if p, err := strconv.Atoi(envPort); err == nil {
				*port = p
			}
		}
	}

	// 如果还是没有，使用默认端口
	if *port == 0 {
		*port = 8080
	}

	// 获取嵌入的文件系统
	staticFS, err := fs.Sub(staticFiles, "static")
	if err != nil {
		log.Fatal(err)
	}

	// 创建文件服务器
	fileServer := http.FileServer(http.FS(staticFS))

	// 路由处理
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// 如果访问根路径，重定向到进化查看器
		if r.URL.Path == "/" {
			http.Redirect(w, r, "/evolution_viewer.html", http.StatusFound)
			return
		}
		fileServer.ServeHTTP(w, r)
	})

	url := fmt.Sprintf("http://localhost:%d", *port)

	fmt.Printf("========================================\n")
	fmt.Printf("  DTRB2 数码兽进化路线查询\n")
	fmt.Printf("========================================\n")
	fmt.Printf("  服务已启动: %s\n", url)
	fmt.Printf("  按 Ctrl+C 停止服务\n")
	fmt.Printf("========================================\n")

	// 延迟打开浏览器
	go func() {
		time.Sleep(500 * time.Millisecond)
		openBrowser(url)
	}()

	// 启动HTTP服务器
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", *port), nil))
}
