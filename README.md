# Aural

基于 [Suxiaoqinx/Netease_url](https://github.com/Suxiaoqinx/Netease_url) 的二次开发项目，使用 Next.js + Tailwind CSS 全新重写了前端界面，采用黑金沉浸式主题设计，打造以音乐为核心的 Web App 体验。

> **声明**：本项目核心后端代码来源于 [Suxiaoqinx/Netease_url](https://github.com/Suxiaoqinx/Netease_url)（原作），本仓库对 `main.py` 进行了适配修改，新增杜比全景声等音质支持，并使用 Next.js 16 + Tailwind CSS 4 + shadcn/ui 全新重写了前端界面（Aural）。

## 目录结构

```
├── Netease_url/     # Flask 后端（基于原项目，修改了 main.py）
│   ├── main.py              # 主程序（已修改：适配静态文件直连 / PyInstaller 打包）
│   ├── music_api.py         # 音乐 API 核心模块
│   ├── music_downloader.py  # 音乐下载模块
│   ├── cookie_manager.py    # Cookie 管理模块
│   ├── qr_login.py          # 二维码登录模块
│   ├── templates/           # 前端静态文件目录（构建后输出到此）
│   ├── requirements.txt     # Python 依赖
│   ├── Dockerfile           # Docker 构建文件
│   ├── docker-compose.yml   # Docker Compose 配置
│   └── 使用文档.md           # 详细使用文档
│
├── Theme/           # Next.js 前端源码（Aural · 黑金主题 v2.1）
│   ├── src/
│   │   ├── app/              # 页面入口 + 全局样式
│   │   ├── components/
│   │   │   ├── layout/       # 布局组件（Sidebar, TabBar, AppShell）
│   │   │   ├── player/       # 播放器组件（MiniPlayer, FullPlayer, APlayerWrapper）
│   │   │   ├── shared/       # 通用组件（SongCard, SongRow）
│   │   │   ├── views/        # 视图组件（SearchView, PlaylistView, AlbumView, SettingsView）
│   │   │   ├── settings/     # 设置子页面（QualitySettings, CookieSettings, DownloadSettings, PlaybackSettings, AboutPage）
│   │   │   └── ui/           # shadcn/ui 基础组件
│   │   └── lib/              # 工具函数 + API + 状态管理
│   ├── public/               # 静态资源（APlayer, logo 等）
│   └── package.json
│
└── README.md
```

## 设计特色

1. **沉浸式音乐体验**：不再是"工具箱"，而是以音乐为核心的 Web App
2. **点击即播放**：搜索结果 / 歌单 / 专辑中的歌曲，一键播放，无需跳转
3. **常驻播放器**：底部 MiniPlayer + 全屏 FullPlayer，全局可操控
4. **侧边栏导航**：桌面端左侧导航 + 移动端底部 Tab Bar
5. **全屏播放器**：模糊背景 + 大封面 + 实时歌词滚动
6. **黑金主题**：毛玻璃效果 + 表面层级体系 + 金色光效 + 流畅动效
7. **下载即动作**：下载不再是独立页面，而是歌曲卡片/列表中的行内操作

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | Next.js 16 (Static Export) |
| 语言 | TypeScript |
| 样式 | Tailwind CSS 4 |
| 组件库 | shadcn/ui (Radix UI) |
| 动画 | Framer Motion |
| 播放器 | APlayer (内嵌) |
| 状态管理 | Zustand |
| 后端 | Flask (Python) |
| 部署 | Docker / 本地 / PyInstaller |

## 功能覆盖

- **歌曲搜索** — 关键词搜索，网格卡片展示，点击即播放
- **在线播放** — 全局播放器，支持播放/暂停/上下首/进度拖拽/音量调节
- **实时歌词** — 原文 + 翻译双语歌词滚动同步
- **音质选择** — 标准 / 极高 / 无损 / Hi-Res / 环绕声 / 沉浸环绕声 / 母带级 / 杜比全景声
- **歌单浏览** — 输入歌单 ID/链接，浏览完整曲目列表
- **专辑浏览** — 输入专辑 ID/链接，浏览专辑曲目
- **音乐下载** — 行内下载，支持多音质
- **Cookie 管理** — 前端界面配置和管理账号 Cookie
- **设置面板** — 音质偏好、播放设置、下载配置等

## 快速开始

### 环境要求

- Python 3.7+
- Node.js 18+ / Bun
- 网易云音乐黑胶会员账号（用于获取高音质资源）

### 安装步骤

1. **克隆项目**
   ```bash
   git clone https://github.com/Eq52/Netease_url_theme.git
   cd Netease_url_theme
   ```

2. **构建前端**
   ```bash
   cd Theme
   npm install
   npm run build
   ```

3. **部署前端到后端**
   ```bash
   cp -r out/* ../Netease_url/templates/
   cd ..
   ```

4. **配置 Cookie**

   在 `Netease_url/cookie.txt` 文件中填入黑胶会员账号的 Cookie：
   ```
   MUSIC_U=你的MUSIC_U值;os=pc;appver=8.9.70;
   ```

   > 获取 Cookie 方法：登录网易云音乐网页版 → F12 打开开发者工具 → Network 标签页 → 复制任意请求的 Cookie 值

5. **安装 Python 依赖并启动后端**
   ```bash
   cd Netease_url
   pip install -r requirements.txt
   python main.py
   ```

6. **访问应用**

   打开浏览器访问：`http://localhost:5000`

### Docker 部署

```bash
# 使用 Docker Compose
cd Netease_url
docker-compose up -d

# 或使用 Dockerfile
docker build -t aural-music .
docker run -d -p 5000:5000 -v $(pwd)/downloads:/app/downloads aural-music
```

## 音质说明

| 音质 | 参数值 | 要求 |
|------|--------|------|
| 标准音质 (128kbps) | `standard` | 免费 |
| 极高音质 (320kbps) | `exhigh` | 黑胶 VIP |
| 无损音质 (FLAC) | `lossless` | 黑胶 VIP |
| Hi-Res (24bit/96kHz) | `hires` | 黑胶 VIP |
| 高清环绕声 | `jyeffect` | 黑胶 VIP |
| 沉浸环绕声 | `sky` | 黑胶 SVIP |
| 超清母带 | `jymaster` | 黑胶 SVIP |
| 杜比全景声 | `dolby` | 黑胶 SVIP |

## API 接口

后端提供以下 RESTful API：

| 接口 | 方法 | 说明 |
|------|------|------|
| `/health` | GET | 健康检查，返回服务状态和版本 |
| `/search` | POST | 歌曲搜索 |
| `/song` | POST | 获取歌曲详细信息（URL/歌词/JSON） |
| `/playlist` | POST | 获取歌单详情 |
| `/album` | POST | 获取专辑详情 |
| `/download` | POST | 下载音乐文件 |
| `/api/info` | GET | API 信息 |

详细的 API 使用文档请参考 [Netease_url/使用文档.md](./Netease_url/使用文档.md)。

## 致谢

- 原项目：[Suxiaoqinx/Netease_url](https://github.com/Suxiaoqinx/Netease_url)
- [Ravizhan](https://github.com/ravizhan)

## 许可证

本项目采用 MIT 许可证开源。核心后端代码来源于原项目 [Suxiaoqinx/Netease_url](https://github.com/Suxiaoqinx/Netease_url)，前端 Aural 主题为二次开发作品。
