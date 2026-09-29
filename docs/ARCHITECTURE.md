# 魔法城堡项目结构

## 运行时入口

- `index.html`：静态页面与可访问性结构。
- `app.js`：应用编排模块；负责状态、页面路由、DOM 绑定和跨模块协调。
- `style.css`：全局视觉语言、共享布局和跨页面样式。
- `styles/screens/adventure-map.css`：首页冒险地图的独立屏幕样式。
- `service-worker.js`：离线缓存清单和缓存策略。

## 功能模块

`features/` 是业务规则的模块目录。每个模块将规则隐藏在小接口后，避免把规则散落到页面编排中。

- `theme-catalog.js`：内置课程主题和回合数据工厂。
- `content-catalog.js`：翻译、例句、汉字场景和地图展示元数据。
- `default-content.js`：由 `data/default-learning-content.json` 生成的默认分组与朗诵内容模块。
- `map-route.js`：每日路线、推荐课程与复习判断。
- `achievements.js`：徽章定义和解锁规则。
- `storage.js`：浏览器本机存储的安全读写适配。

## 资源目录

```text
assets/
├── audio/
│   └── magic-house/        # 魔法屋背景音乐
├── branding/
│   └── magic-castle/       # Logo 与品牌图
├── characters/
│   └── luna/               # 露娜角色与衣橱 SVG 数据
├── icons/                  # PWA / Android 图标源
├── learning/
│   └── vocabulary/         # 单词和数字学习插图
├── scenes/
│   └── adventure-map/      # 首页地图插图
└── ui/                     # 通用按钮、标签和光标素材
```

## 平台与构建

- `scripts/build-web.mjs`：从源目录生成 `www/` 静态包。
- `android/`：Capacitor Android 外壳、原生 TTS、系统栏和图标资源。
- `.github/workflows/deploy-pages.yml`：发布 `www/` 到 GitHub Pages。
- `.github/workflows/release-android-apk.yml`：推送 `v*` Tag 后构建并发布 Android Debug APK。

## 维护规则

1. 默认英文、汉字分组、朗诵篇目与兼容兜底内容只修改 `data/default-learning-content.json`，然后运行 `npm run content:sync`。
2. 新课程的静态定义放入 `features/theme-catalog.js`。
3. 新的翻译、示例句、地图名称放入 `features/content-catalog.js`。
4. 新媒体资源按用途放入 `assets/` 的对应子目录，避免直接堆放在根目录。
5. 新屏幕样式放入 `styles/screens/`；共享视觉规则保留在 `style.css`。
6. `www/`、Gradle 构建输出、APK 和本机学习导出数据均是生成或本机数据，不提交到仓库。
