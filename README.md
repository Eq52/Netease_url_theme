# Netease_url_theme

基于 [Suxiaoqinx/Netease_url](https://github.com/Suxiaoqinx/Netease_url) 的二次开发项目。

> **声明**：本项目核心代码来源于 [Suxiaoqinx/Netease_url](https://github.com/Suxiaoqinx/Netease_url)（原作），本仓库仅对 `main.py` 及 `templates/` 下的前端文件进行了重新设计与改动，使用了 Next.js + Tailwind CSS 重写了前端界面。

## 目录结构

```
├── Netease_url/     # Flask 后端（基于原项目，修改了 main.py）
│   ├── main.py          # 主程序（已修改：适配静态文件直连）
│   ├── music_api.py     # 音乐 API
│   ├── music_downloader.py
│   ├── cookie_manager.py
│   ├── qr_login.py
│   ├── templates/       # 前端静态文件目录
│   ├── requirements.txt
│   └── ...
│
├── Theme/           # Next.js 前端源码（全新重写）
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   └── lib/
│   ├── public/
│   └── package.json
│
└── README.md
```

## 主要改动

1. **前端完全重写**：使用 Next.js 16 + Tailwind CSS 4 + shadcn/ui 构建全新的深色主题 UI
2. **main.py 适配**：修改 Flask 静态文件路由，支持 Next.js 静态导出文件直连
3. **集成 APlayer**：内嵌在线播放器，支持歌词滚动显示（原文+翻译合并）
4. **功能覆盖**：歌曲搜索、单曲解析、歌单解析、专辑解析、音乐下载

## 使用方法

1. 将 `Theme/` 目录构建为静态文件（`npm run build`），将 `out/` 目录的内容放入 `Netease_url/templates/`
2. 启动 Flask 后端：`cd Netease_url && python main.py`

## 致谢

- 原项目：[Suxiaoqinx/Netease_url](https://github.com/Suxiaoqinx/Netease_url)
