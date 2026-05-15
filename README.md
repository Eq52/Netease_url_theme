# Aural

## 注：v2.0仍在测试，它是v1.4及以前的前端重构版，在新版发布前建议使用v1.4版本。

基于 [Suxiaoqinx/Netease_url](https://github.com/Suxiaoqinx/Netease_url) 的二次开发项目，重构前端，打造沉浸式音乐体验。

> **声明**：本项目核心后端代码来源于 [Suxiaoqinx/Netease_url](https://github.com/Suxiaoqinx/Netease_url)（原作），本仓库对 `main.py` 进行了适配修改，并使用 Next.js + Tailwind CSS 全新重写了前端界面。

## 目录结构

```
├── Netease_url/     # Flask 后端（基于原项目，修改了 main.py）
│   ├── main.py          # 主程序（已修改：适配静态文件直连 / PyInstaller 打包）
│   ├── music_api.py     # 音乐 API
│   ├── music_downloader.py
│   ├── cookie_manager.py
│   ├── qr_login.py
│   ├── templates/       # 前端静态文件目录
│   ├── requirements.txt
│   └── ...
│
├── Theme/           # Next.js 前端源码（Aural）
│   ├── src/
│   │   ├── app/           # 页面入口 + 全局样式
│   │   ├── components/
│   │   │   ├── layout/    # 布局组件（Sidebar, TabBar, AppShell）
│   │   │   ├── player/    # 播放器组件（MiniPlayer, FullPlayer, APlayerWrapper）
│   │   │   ├── shared/    # 通用组件（SongCard, SongRow）
│   │   │   ├── views/     # 视图组件（SearchView, PlaylistView, AlbumView）
│   │   │   └── ui/        # shadcn/ui 基础组件
│   │   └── lib/           # 工具函数 + API + 状态管理
│   ├── public/
│   └── package.json
│
└── README.md
```

## 设计特色

1. **沉浸式音乐体验**：不再是"工具箱"，而是以音乐为核心的 Web App
2. **点击即播放**：搜索结果 / 歌单 / 专辑中的歌曲，一键播放，无需跳转
3. **常驻播放器**：底部 MiniPlayer + 全屏 FullPlayer，全局可操控
4. **侧边栏导航**：桌面端左侧导航 + 移动端底部 Tab Bar
5. **Apple Music 风格全屏播放器**：模糊背景 + 大封面 + 实时歌词滚动
6. **Spotify 风格深色主题**：毛玻璃效果 + 表面层级体系 + 流畅动效
7. **下载即动作**：下载不再是独立页面，而是歌曲卡片/列表中的行内操作

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Next.js 16 (Static Export) |
| 语言 | TypeScript |
| 样式 | Tailwind CSS 4 |
| 组件库 | shadcn/ui (Radix UI) |
| 动画 | Framer Motion |
| 播放器 | APlayer (内嵌) |
| 后端 | Flask (Python) |
| 部署 | Docker / 本地 / PyInstaller |

## 功能覆盖

- 🔍 **歌曲搜索** — 关键词搜索，网格卡片展示，点击即播放
- 🎵 **在线播放** — 全局播放器，支持播放/暂停/上下首/进度拖拽/音量调节
- 📜 **实时歌词** — 原文 + 翻译双语歌词滚动同步
- 🎧 **音质选择** — 标准 / 极高 / 无损 / Hi-Res / 环绕声 / 母带级
- 📋 **歌单浏览** — 输入歌单 ID/链接，浏览完整曲目列表
- 💿 **专辑浏览** — 输入专辑 ID/链接，浏览专辑曲目
- ⬇️ **音乐下载** — 行内下载，支持多音质

## 使用方法

1. 将 `Theme/` 目录构建为静态文件：
   ```bash
   cd Theme && npm install && npm run build
   ```
2. 将 `Theme/out/` 目录的内容复制到 `Netease_url/templates/`
3. 启动 Flask 后端：
   ```bash
   cd Netease_url && python main.py
   ```
4. 打开浏览器访问 `http://localhost:5000`

## 致谢

- 原项目：[Suxiaoqinx/Netease_url](https://github.com/Suxiaoqinx/Netease_url)
