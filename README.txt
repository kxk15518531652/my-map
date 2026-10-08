maptest07 · 手机优先和加速优化版

本版基于 maptest06，保留一食堂、和平楼、背景音乐、点击音效、欢迎页、云雾、2秒轮播、照片大图。

新增：
1. 手机地图占满顶部标题下的浏览区，可用手指左右拖动；底部有两栋建筑的快捷入口。
2. 两栋建筑上方增加更容易点击的标签按钮，保留精准建筑热区。
3. 手机详情页面采用全屏可上下滚动布局，不被地图的滚动容器裁剪；关闭按钮固定右上方。
4. 校园图和照片转换为 WebP，显著减少下载体积；轮播图片进入详情后才加载。
5. 欢迎页的模糊底图预先生成，无须手机实时大范围模糊；背景音乐点击进入后再下载播放。

GitHub Pages 部署方法：
解压，把 maptest07 文件夹【里面的全部内容】上传到 GitHub 的 my-map 仓库根目录。确保根目录能看到 index.html、style.css、script.js、images/、audio/。
删除仓库中不再用到的旧 JPEG/PNG 文件属于可选清理；仅替换核心文件并添加 WebP 资源也能运行。
将所有修改提交到 main 分支，等 GitHub Pages 自动更新后刷新网页。

调音乐大小：script.js 内的 campusMusic.volume。
关云雾：script.js 内 ENABLE_CLOUD_INTRO = false。
轮播速度：script.js 内 SLIDE_INTERVAL_MS = 2000。
