// ============================================================
// maptest05 · 徐汇校区电子地图（带欢迎页）
// 两栋建筑共用：点击放大、详情页、2秒自动轮播、大图预览和音效
// ============================================================
const welcomeScreen = document.getElementById('welcomeScreen');
const enterCampusButton = document.getElementById('enterCampusButton');
const campusApp = document.getElementById('campusApp');
const mapWorld = document.getElementById('mapWorld');
const detailOverlay = document.getElementById('detailOverlay');
const infoPanel = document.getElementById('infoPanel');
const closeButton = document.getElementById('closeButton');
const detailTitle = document.getElementById('detailTitle');
const detailBadges = document.getElementById('detailBadges');
const detailText = document.getElementById('detailText');
const detailHighlights = document.getElementById('detailHighlights');
const detailContent = document.getElementById('detailContent');
const musicToggle = document.getElementById('musicToggle');
const musicToggleText = document.getElementById('musicToggleText');
const campusMusic = document.getElementById('campusMusic');
const buildingPop = document.getElementById('canteenPop');
const photoPreview = document.getElementById('photoPreview');
const photoPreviewImage = document.getElementById('photoPreviewImage');
const photoPreviewCaption = document.getElementById('photoPreviewCaption');
const closePhotoPreviewButton = document.getElementById('closePhotoPreview');
const slides = Array.from(document.querySelectorAll('.carousel-slide'));
const dots = Array.from(document.querySelectorAll('.carousel-dot'));
const imageButtons = Array.from(document.querySelectorAll('.carousel-image-button'));
const prevSlideButton = document.getElementById('prevSlide');
const nextSlideButton = document.getElementById('nextSlide');

const ZOOM = 2.25;
const SLIDE_INTERVAL_MS = 2000; // 自动轮播：每张停留2秒

// ========== 云雾入场特效开关（可选功能）开始 ==========
// 把 true 改成 false 即可关闭「点击进入后云雾向两侧散开」动画。
// 不会关闭欢迎页，也不影响背景地图模糊和背景音乐。
const ENABLE_CLOUD_INTRO = true;
// ========== 云雾入场特效开关结束 ==========

// ======== 新增建筑从这里配置，今后可以继续复制和平楼的配置 ========
const BUILDINGS = {
  canteen: {
    title: '一食堂',
    point: { x: 0.725, y: 0.397 },
    interactiveId: 'canteenInteractive',
    hotspotId: 'canteenHotspot',
    badges: ['华理红烧肉', '深夜食堂'],
    paragraphs: [
      '徐汇校区第一食堂是校内规模最大的食堂之一，位于梅陇路130号，共三层，就餐面积超2500平方米，座位近1100个。一层提供大众伙食、特色点心和西点，也是“深夜食堂”主阵地；二层主打特色风味；三层为明德餐厅。食堂常规营业至22:00，夜宵约20:00—22:00，品种上百，支持小份、半份。招牌“华理红烧肉”曾入选上海校园“十大美食”。这里环境宽敞、选择丰富，深夜食堂尤其受学生欢迎。'
    ],
    facts: [
      ['位置', '梅陇路130号'],
      ['楼层', '共三层'],
      ['规模', '就餐面积超2500㎡，座位近1100个'],
      ['特色', '深夜食堂、华理红烧肉、支持小份/半份']
    ],
    photos: ['images/canteen-1.jpg', 'images/canteen-2.jpg', 'images/canteen-3.jpg']
  },
  heping: {
    title: '和平楼',
    point: { x: 0.5095, y: 0.5525 },
    interactiveId: 'hepingInteractive',
    hotspotId: 'hepingHotspot',
    badges: ['行政主楼', '校园历史建筑'],
    paragraphs: [
      '和平楼是学校的行政主楼，通常也被称为办公楼。它位于学校南门正对的攀登路旁，与周边梧桐树和大草坪共同构成了校园的核心景观。',
      '作为学校的行政中枢，和平楼的职能十分明确。楼内设有多个公共会议室（如第一、第二、第三会议室），是学校举办重要会议、学术研讨和校地合作座谈会的常用场所。同时，众多行政办公室也集中于此，例如党委办公室、校长办公室及信访接待室等均设在这栋楼内。',
      '和平楼的历史可追溯至学校1950年代的初建时期，是徐汇校区最早的一批建筑之一，数十年来见证了学校的发展与变迁。'
    ],
    facts: [
      ['位置', '南门正对的攀登路旁'],
      ['用途', '行政办公、会议研讨'],
      ['历史', '学校初建时期（20世纪50年代）']
    ],
    photos: ['images/heping-1.jpg', 'images/heping-2.jpg', 'images/heping-3.jpg']
  }
};

let activeBuildingKey = null;
let currentSlide = 0;
let slideTimer = null;
let isPhotoPreviewOpen = false;
let lastImageButton = null;
let musicManuallyPaused = false;

// ===== 背景音乐与点击“啵”声 =====
campusMusic.volume = 1.00; // 背景音乐音量：0~1，可自行调整
buildingPop.volume = 0.65;

function updateMusicButton() {
  const playing = !campusMusic.paused;
  musicToggle.classList.toggle('is-playing', playing);
  musicToggleText.textContent = playing ? '暂停音乐' : '开启音乐';
  musicToggle.setAttribute('aria-label', playing ? '暂停背景音乐' : '开启背景音乐');
  musicToggle.title = playing ? '点击暂停校园背景音乐' : '点击开启校园背景音乐';
}
async function playCampusMusic() {
  if (musicManuallyPaused) return;
  try { await campusMusic.play(); }
  catch (_) { /* 浏览器禁止无操作有声自动播放时，用户可以点击“开启音乐” */ }
  updateMusicButton();
}
musicToggle.addEventListener('click', async () => {
  if (campusMusic.paused) {
    musicManuallyPaused = false;
    await playCampusMusic();
  } else {
    musicManuallyPaused = true;
    campusMusic.pause();
    updateMusicButton();
  }
});
campusMusic.addEventListener('play', updateMusicButton);
campusMusic.addEventListener('pause', updateMusicButton);
updateMusicButton();

// ============================================================
// 网页欢迎页交互：点击「进入校园」启动背景音乐，再打开地图与云雾动画
// 浏览器要求有声音乐通过用户手势启动，因此请勿用定时器代替点击。
// ============================================================
let hasEnteredCampus = false;
enterCampusButton.addEventListener('click', () => {
  if (hasEnteredCampus) return;
  hasEnteredCampus = true;
  enterCampusButton.disabled = true;

  // 关键：直接在用户点击回调中触发 play()，确保音乐有权播放。
  musicManuallyPaused = false;
  void playCampusMusic();

  // 欢迎页淡出后，再启动云雾；这样动画不会在欢迎页背后提前播放完。
  welcomeScreen.classList.add('is-leaving');
  window.setTimeout(() => {
    welcomeScreen.hidden = true;
    document.body.classList.remove('welcome-active');
    campusApp.removeAttribute('inert');

    if (ENABLE_CLOUD_INTRO && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.body.classList.add('cloud-intro-playing');
      window.setTimeout(() => document.body.classList.remove('cloud-intro-playing'), 1550);
    }
  }, 430);
});
// ============== 网页欢迎页交互结束 ==============

function playPopEffect() {
  try {
    buildingPop.pause();
    buildingPop.currentTime = 0;
    void buildingPop.play().catch(() => {});
  } catch (_) { /* 不影响操作 */ }
}

// ===== 轮播图：两栋楼共用同一组件 =====
function stopCarouselAutoplay() {
  if (slideTimer !== null) {
    clearInterval(slideTimer);
    slideTimer = null;
  }
}
function updateCarousel(index) {
  currentSlide = (index + slides.length) % slides.length;
  slides.forEach((slide, i) => {
    const active = (i === currentSlide);
    slide.classList.toggle('is-active', active);
    slide.setAttribute('aria-hidden', String(!active));
    imageButtons[i].tabIndex = active ? 0 : -1;
  });
  dots.forEach((dot, i) => {
    dot.classList.toggle('is-active', i === currentSlide);
    dot.setAttribute('aria-current', String(i === currentSlide));
  });
}
function startCarouselAutoplay() {
  stopCarouselAutoplay();
  if (!activeBuildingKey || isPhotoPreviewOpen || document.hidden) return;
  slideTimer = setInterval(() => updateCarousel(currentSlide + 1), SLIDE_INTERVAL_MS);
}
function switchSlide(index) {
  updateCarousel(index);
  startCarouselAutoplay();
}

// ===== 文字信息和三张轮播图：根据当前建筑动态替换 =====
function renderBuildingDetail(data) {
  detailTitle.textContent = data.title;
  infoPanel.classList.toggle('detail-card--heping', data === BUILDINGS.heping);
  detailBadges.replaceChildren();
  data.badges.forEach(label => {
    const badge = document.createElement('span');
    badge.className = 'detail-badge';
    badge.textContent = label;
    detailBadges.append(badge);
  });
  detailText.replaceChildren();
  data.paragraphs.forEach(text => {
    const p = document.createElement('p');
    p.textContent = text;
    detailText.append(p);
  });
  detailHighlights.replaceChildren();
  data.facts.forEach(([label, value]) => {
    const li = document.createElement('li');
    const strong = document.createElement('strong');
    strong.textContent = label + '：';
    li.append(strong, document.createTextNode(value));
    detailHighlights.append(li);
  });
  slides.forEach((slide, i) => {
    const img = slide.querySelector('img');
    img.src = data.photos[i];
    img.alt = `${data.title}照片 ${i + 1}`;
    imageButtons[i].setAttribute('aria-label', `放大查看第 ${i + 1} 张${data.title}图片`);
  });
}

// ===== 对齐详情信息底部与轮播图底边（桌面布局） =====
function syncDetailContentBottom() {
  if (!window.matchMedia('(min-width: 1101px)').matches) {
    detailContent.style.removeProperty('--text-panel-bottom');
    return;
  }
  const bounds = detailContent.getBoundingClientRect();
  const photo = document.getElementById('carousel').getBoundingClientRect();
  detailContent.style.setProperty('--text-panel-bottom', `${Math.max(0, bounds.bottom - photo.bottom).toFixed(2)}px`);
}
window.addEventListener('resize', syncDetailContentBottom);

function setBuildingHover(key, active) {
  const data = BUILDINGS[key];
  if (activeBuildingKey) active = false;
  document.getElementById(data.interactiveId).classList.toggle('is-hovered', active);
}
function clearBuildingHovers() {
  Object.keys(BUILDINGS).forEach(key => setBuildingHover(key, false));
}

// ===== 点击地图上的建筑，进入相应详情页 =====
function openBuilding(key) {
  if (activeBuildingKey) return;
  const data = BUILDINGS[key];
  playPopEffect();
  clearBuildingHovers();
  renderBuildingDetail(data);
  activeBuildingKey = key;

  const baseWidth = mapWorld.offsetWidth;
  const baseHeight = mapWorld.offsetHeight;
  const moveX = -(data.point.x - 0.5) * baseWidth * ZOOM;
  const moveY = -(data.point.y - 0.5) * baseHeight * ZOOM;
  mapWorld.style.transform = `translate(calc(-50% + ${moveX}px), calc(-50% + ${moveY}px)) scale(${ZOOM})`;

  detailOverlay.setAttribute('aria-hidden', 'false');
  infoPanel.setAttribute('aria-hidden', 'false');
  document.body.classList.add('detail-open');
  updateCarousel(0);
  syncDetailContentBottom();
  startCarouselAutoplay();
  closeButton.focus();
}
function closeBuilding() {
  if (!activeBuildingKey) return;
  stopCarouselAutoplay();
  if (isPhotoPreviewOpen) closePhotoPreview(false);
  mapWorld.style.transform = 'translate(-50%, -50%) scale(1)';
  detailOverlay.setAttribute('aria-hidden', 'true');
  infoPanel.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('detail-open');
  const oldKey = activeBuildingKey;
  activeBuildingKey = null;
  clearBuildingHovers();
  // 关闭后不强制对热区按钮聚焦，防止地图重新出现悬浮高亮。
  document.getElementById(BUILDINGS[oldKey].hotspotId).blur();
  closeButton.blur();
}

// ===== 当前轮播图大图预览；预览期间暂停轮播 =====
function openPhotoPreview(trigger) {
  if (!activeBuildingKey || isPhotoPreviewOpen) return;
  isPhotoPreviewOpen = true;
  lastImageButton = trigger;
  const data = BUILDINGS[activeBuildingKey];
  const selectedIndex = currentSlide;
  const img = slides[selectedIndex].querySelector('img');
  photoPreviewImage.src = img.currentSrc || img.src;
  photoPreviewImage.alt = `${data.title}大图 ${selectedIndex + 1}`;
  photoPreviewCaption.textContent = `${data.title} · ${selectedIndex + 1} / ${slides.length}`;
  photoPreview.setAttribute('aria-hidden', 'false');
  photoPreview.classList.add('is-open');
  stopCarouselAutoplay();
  closePhotoPreviewButton.focus();
}
function closePhotoPreview(restoreFocus = true) {
  if (!isPhotoPreviewOpen) return;
  isPhotoPreviewOpen = false;
  photoPreview.setAttribute('aria-hidden', 'true');
  photoPreview.classList.remove('is-open');
  if (restoreFocus && lastImageButton) lastImageButton.focus();
  lastImageButton = null;
  startCarouselAutoplay();
}

// ===== 给两栋楼绑定独立、精确的多边形悬浮/点击事件 =====
Object.keys(BUILDINGS).forEach(key => {
  const hotspot = document.getElementById(BUILDINGS[key].hotspotId);
  hotspot.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'touch') setBuildingHover(key, true);
  });
  hotspot.addEventListener('pointerleave', () => setBuildingHover(key, false));
  hotspot.addEventListener('focus', () => setBuildingHover(key, true));
  hotspot.addEventListener('blur', () => setBuildingHover(key, false));
  hotspot.addEventListener('click', () => openBuilding(key));
});
closeButton.addEventListener('click', closeBuilding);
prevSlideButton.addEventListener('click', () => switchSlide(currentSlide - 1));
nextSlideButton.addEventListener('click', () => switchSlide(currentSlide + 1));
dots.forEach((dot, i) => dot.addEventListener('click', () => switchSlide(i)));
imageButtons.forEach((button, i) => {
  button.addEventListener('click', () => {
    if (i === currentSlide && !isPhotoPreviewOpen) openPhotoPreview(button);
  });
});
closePhotoPreviewButton.addEventListener('click', () => closePhotoPreview());
photoPreview.addEventListener('click', event => {
  if (event.target === photoPreview) closePhotoPreview();
});
detailOverlay.addEventListener('click', event => {
  if (event.target === detailOverlay) closeBuilding();
});
window.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    if (isPhotoPreviewOpen) closePhotoPreview();
    else if (activeBuildingKey) closeBuilding();
    return;
  }
  if (activeBuildingKey && !isPhotoPreviewOpen) {
    if (event.key === 'ArrowLeft') switchSlide(currentSlide - 1);
    if (event.key === 'ArrowRight') switchSlide(currentSlide + 1);
  }
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopCarouselAutoplay();
  else startCarouselAutoplay();
});
