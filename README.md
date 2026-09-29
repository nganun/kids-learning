# 魔法城堡（MVP）

一款为 **4 岁、幼儿园中班儿童**设计的 Web 多学科启蒙小游戏原型。首版强调：短时、低挫败、听说优先，以及完成学习后解锁换装奖励。

## 已配置的产品方向

- **定位**：家庭自用的启蒙学习小游戏；儿童可独立完成，家长只在「家长小站」查看。
- **学习路径**：自然启蒙 → 字母/词形接触 → 看图认词；首个主题为 `Color Magic`。
- **单次循环**：进入 3 分钟挑战 → 听音辨色 → 情境选色 → 跟读单词 → 获得星星 → 解锁公主新裙子。
- **养成主题**：公主魔法、化妆打扮与换装。错误不会扣除奖励，只提供“再听一次”的鼓励。
- **首批单词**：`yellow`、`pink`、`purple`；后续可按相同结构加入 `blue`、`red`、`green`。
- **隐私原则**：无广告、无外链、无陌生人社交；进度仅使用浏览器 LocalStorage 保存在本机。

## 运行

这是零依赖静态 Web 原型。直接在浏览器打开 `index.html` 即可，或在项目目录启动本地服务器：

```bash
python3 -m http.server 8000
```

然后访问 `http://localhost:8000`。

> 浏览器需要在用户首次交互后才允许播放语音；点击“开始今天的魔法”或“再听一次”即可听到英文提示。可用设备原生的 English (US) 语音获得更稳定的发音体验。

## 下一阶段建议

1. 将当前单主题扩至三个主题：颜色、动物、日常动作；每主题 5 个词、3 个关卡。
2. 用真人儿童配音替换浏览器系统语音；制作短句和奖励音效。
3. 找 3–5 位中班儿童测试：是否能自主理解操作、每局是否控制在 3 分钟内、是否愿意次日再打开。
4. 验证玩法后迁移到 Android（推荐 React Native / Expo 或 Flutter），并在家长入口加入本地使用时长控制。

## OC-English 衣橱素材

衣橱现使用 OC-English 的 SVG 分层角色渲染器与服装部件，覆盖发型、帽子、眼镜、上衣、下装、鞋子、手持、背饰和耳饰。具体来源记录在 `THIRD_PARTY_NOTICES.md`；公开发布前请确认上游授权与适用许可。

## GitHub Pages 部署

项目已包含 `.github/workflows/deploy-pages.yml`。将项目推送到 GitHub 仓库的 `main` 分支后：

1. 在仓库的 **Settings → Pages** 中，将发布源设为 **GitHub Actions**。
2. 推送到 `main`，或在 **Actions** 中手动运行 `Deploy Magic Castle to GitHub Pages`。
3. 工作流完成后，在部署记录中打开生成的 GitHub Pages 地址；手机浏览器访问该地址即可游玩。

这是纯静态网页部署。单词卡、SVG 图片、OC-English 衣橱、动画、浏览器朗读、积分及本机学习进度都会继续工作；学习记录使用设备浏览器的 LocalStorage，因此不同手机或平板不会自动同步进度。

## 手机桌面安装与离线使用（PWA）

部署在 HTTPS 的 GitHub Pages 后，项目会注册 Service Worker 并缓存游戏界面、单词图片、角色素材与应用图标。首次在线打开成功后，即使暂时断网，已缓存的游戏内容仍可打开。

- **Android / Chrome**：在浏览器菜单中选择「安装应用」或「添加到主屏幕」。
- **iPhone / iPad / Safari**：点浏览器的「分享」按钮，再选择「添加到主屏幕」。
- 家长可从网页右上角的「给爸爸妈妈」打开家长小站，点击「安装到手机桌面」查看或触发安装。

发布新版本时，请修改 `service-worker.js` 顶部的 `CACHE_NAME`（例如 `magic-castle-v9`），使已安装的设备下载最新缓存。Google Fonts 仍需联网加载；网络不可用时会回退为设备字体。

## 当前学习与家长功能

- **主题课程**：颜色、动物、动作，以及 `Number Magic` 数字魔法（`one`、`two`、`three`）。数字课程同时呈现数量图片、数字字符、英文朗读和简短句子。
- **复习方式**：看图选词与听音找图交替出现；答错不会扣星。
- **每日节奏**：每日任务按设备的本地日期计算；完成学习、主题和换装三个小目标后，会获得连续学习天数与每日完成提示。
- **家长小站**：先通过一题简单计算题，避免儿童误触；可创建多个本机孩子档案、开关录音跟读、导出或导入 JSON 学习备份，以及重启当天挑战。
- **汉字朗读与录音跟读**：汉字学习卡会自动使用设备的中文语音朗读汉字；家长可开启儿童感语速与语调。录音跟读默认关闭，浏览器仅在当前页面请求麦克风、生成临时回放，不上传也不写入学习记录。

- **管理员入口**：在家长小站打开「管理员设置」。英文与汉字各有独立的分组配置页，可设置分组名称、单词、汉字、词组或成语，并选择当前学习分组。管理员内容仅保存在当前设备浏览器中。

## Android APK（Capacitor）

项目现在同时保留静态网页和 Android 包装层：GitHub Pages 继续发布 `www/` 中构建出的静态站点；Android 使用同一套网页资源同步到 Capacitor WebView 中。

### 本机构建调试 APK

需要 Node.js 20+、Java 17 和 Android SDK。首次安装依赖后运行：

```bash
npm install
npm run apk:debug
```

生成的调试 APK 位于：

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

每次修改网页内容后，可先同步 Android 工程：

```bash
npm run cap:sync
```

然后在 Android Studio 中打开 `android/` 目录，或再次运行 `npm run apk:debug`。

### GitHub Actions 构建 APK

仓库包含 `Build Magic Castle Android APK` 工作流。进入 GitHub Actions 后手动运行该工作流，即可在构建结果的 Artifacts 中下载 `magic-castle-debug-apk`。这与 GitHub Pages 的发布工作流相互独立。

### 安装 GitHub Release 中的 APK

每个 Android 版本会以 `v` 前缀的版本号发布到 GitHub Releases。下载发布页中的 `magic-castle-v<版本号>-debug.apk` 到 Android 设备后，允许浏览器或文件管理器安装未知来源应用即可测试。该 APK 为调试签名版本，仅用于内部测试；正式商店发布应使用单独签名的 release AAB/APK。

### 发布 APK 到 GitHub Release

在发布前，请先确认版本号、网页资源和 Android 工程都已同步，并将版本提交推送到 `main`。下面以 `v1.0.1` 为例：

1. 构建调试 APK：

   ```bash
   npm run apk:debug
   ```

2. 确认 APK 已生成：

   ```bash
   ls -lh android/app/build/outputs/apk/debug/app-debug.apk
   ```

3. 提交并推送版本改动：

   ```bash
   git add .
   git commit -m "feat(android): prepare v1.0.1"
   git push origin main
   ```

4. 使用 GitHub CLI 创建 Release 并上传 APK：

   ```bash
   gh release create v1.0.1 \
     android/app/build/outputs/apk/debug/app-debug.apk#magic-castle-v1.0.1-debug.apk \
     --repo nganun/magic-castle \
     --target main \
     --title "魔法城堡 v1.0.1" \
     --notes "Android 调试测试包。"
   ```

如果版本说明包含反引号、代码块或较长 Markdown，建议先写入文件，再使用 `--notes-file`，避免 Shell 解释 Markdown：

```bash
cat > /private/tmp/magic-castle-v1.0.1-notes.md <<'EOF_NOTES'
## Android 测试版

- 本版本使用与 GitHub Pages 相同的网页资源。
- 附件为 Debug 签名 APK，可直接安装到 Android 设备测试。
EOF_NOTES

gh release edit v1.0.1 \
  --repo nganun/magic-castle \
  --notes-file /private/tmp/magic-castle-v1.0.1-notes.md
```

可用下面命令验证 Release 与附件是否已发布：

```bash
gh release view v1.0.1 \
  --repo nganun/magic-castle \
  --json tagName,name,assets,url
```

> 首次使用 GitHub CLI 时，请先执行 `gh auth login -h github.com`。GitHub Release 中的 Debug APK 仅用于测试；发布到应用商店前，请改用独立签名的 release AAB/APK。

### 通过 Git Tag 自动发布 APK

仓库还包含 `Release Magic Castle Android APK` 工作流。推送以 `v` 开头的版本 Tag 时，GitHub Actions 会自动：

1. 安装 Node.js 20、Java 17 与项目依赖；
2. 构建网页资源并同步到 Capacitor Android 工程；
3. 构建 Debug APK；
4. 创建同名 GitHub Release；
5. 上传 `magic-castle-v<版本号>-debug.apk`。

发布新版本的推荐步骤：

```bash
# 确认 main 已包含并推送需要发布的代码。
git checkout main
git pull origin main

# 用新的语义化版本替换 v1.0.1。
git tag -a v1.0.1 -m "魔法城堡 v1.0.1"
git push origin v1.0.1
```

推送 Tag 后，在 GitHub Actions 查看 `Release Magic Castle Android APK` 工作流。工作流完成后，可在 GitHub Releases 下载 APK。

> Tag 一旦推送即会触发发布，请确认版本号、提交内容和本机测试无误后再推送。

### Android 原生朗读与系统界面

Android APK 会优先使用原生 Text-to-Speech 朗读英文、汉字与朗诵文本；若设备没有安装中文朗读语音，App 会提示并尝试打开系统语音数据安装页。Android 状态栏使用浅紫色主题，启动图标复用网页/PWA 的 `assets/icons/app-icon-512.png`。
