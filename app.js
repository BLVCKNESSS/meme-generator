// ─────────────────────────────────────────────────────────────
//  MemeForge — app.js
//  Phase 2 + Partage réseaux sociaux (WhatsApp, Facebook, Telegram, X)
// ─────────────────────────────────────────────────────────────

// ── 1. SÉLECTION DES ÉLÉMENTS DOM ────────────────────────────
const canvas         = document.getElementById('meme-canvas');
const ctx            = canvas.getContext('2d');
const imageInput     = document.getElementById('image-input');
const uploadZone     = document.getElementById('upload-zone');
const topTextInput   = document.getElementById('top-text');
const botTextInput   = document.getElementById('bottom-text');
const fontSizeInput  = document.getElementById('font-size');
const fontSizeVal    = document.getElementById('font-size-val');
const textColorIn    = document.getElementById('text-color');
const strokeColorIn  = document.getElementById('stroke-color');
const strokeWidthIn  = document.getElementById('stroke-width');
const strokeWidthVal = document.getElementById('stroke-width-val');
const btnDownload    = document.getElementById('btn-download');
const btnSave        = document.getElementById('btn-save');
const btnShare       = document.getElementById('btn-share');
const placeholder    = document.getElementById('canvas-placeholder');
const galleryGrid    = document.getElementById('gallery-grid');
const galleryEmpty   = document.getElementById('gallery-empty');
const btnClear       = document.getElementById('btn-clear-gallery');
const toast          = document.getElementById('toast');
const navTabs        = document.querySelectorAll('.nav-tab');
const tabContents    = document.querySelectorAll('.tab-content');

const btnClearImage  = document.getElementById('btn-clear-image');

// ── Lightbox ──────────────────────────────────────────────────
const lightboxOverlay = document.getElementById('lightbox-overlay');
const lightboxImg     = document.getElementById('lightbox-img');
const lightboxClose   = document.getElementById('lightbox-close');
const lightboxEdit    = document.getElementById('lightbox-edit');
const lightboxDl      = document.getElementById('lightbox-dl');
let   lightboxMeme    = null; // mème actuellement affiché dans la lightbox


const shareOverlay      = document.getElementById('share-overlay');
const shareClose        = document.getElementById('share-close');
const shareWhatsapp     = document.getElementById('share-whatsapp');
const shareFacebook     = document.getElementById('share-facebook');
const shareTelegram     = document.getElementById('share-telegram');
const shareTwitter      = document.getElementById('share-twitter');
const shareCopy         = document.getElementById('share-copy');
const shareDownloadHint = document.getElementById('share-download-hint');
const shareDlBtn        = document.getElementById('share-dl-btn');

// ── 2. ÉTAT DE L'APPLICATION ──────────────────────────────────
let currentImage       = null;
let currentOriginalSrc = null; // image de base SANS texte (data URL)
let toastTimer         = null;

// ── 3. NAVIGATION ENTRE ONGLETS ───────────────────────────────
navTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    navTabs.forEach(t => t.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
    if (tab.dataset.tab === 'gallery') renderGallery();
  });
});

// ── 4. CHARGEMENT DE L'IMAGE ──────────────────────────────────

imageInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (file) loadImageFile(file);
});

// Drag & Drop
uploadZone.addEventListener('dragover', e => {
  e.preventDefault();
  uploadZone.style.borderColor = '#ff4500';
  uploadZone.style.background  = 'rgba(255,69,0,0.08)';
});
uploadZone.addEventListener('dragleave', () => {
  uploadZone.style.borderColor = '';
  uploadZone.style.background  = '';
});
uploadZone.addEventListener('drop', e => {
  e.preventDefault();
  uploadZone.style.borderColor = '';
  uploadZone.style.background  = '';
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) loadImageFile(file);
  else showToast('Fichier non supporté. Utilise PNG/JPG/WEBP.');
});

function loadImageFile(file) {

  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      currentImage       = img;
      currentOriginalSrc = e.target.result; // conserve l'original sans texte
      const maxW  = 700;
      const scale = img.width > maxW ? maxW / img.width : 1;
      canvas.width  = Math.round(img.width  * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.style.display      = 'block';
      placeholder.style.display = 'none';
      btnClearImage.style.display   = 'flex';
      btnCrop.style.display         = 'flex';
      canvasCropFab.style.display   = 'flex';
      drawMeme();
      showToast('Image chargée !');
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// ── 5. DESSIN DU MÈME SUR LE CANVAS ──────────────────────────

function drawMeme() {
  if (!currentImage) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(currentImage, 0, 0, canvas.width, canvas.height);

  const fontSize    = parseInt(fontSizeInput.value);
  const textColor   = textColorIn.value;
  const strokeColor = strokeColorIn.value;
  const strokeW     = parseInt(strokeWidthIn.value);
  const topText     = topTextInput.value.toUpperCase();
  const botText     = botTextInput.value.toUpperCase();

  ctx.font         = `${fontSize}px 'Bebas Neue', Impact, Arial Black, sans-serif`;
  ctx.fillStyle    = textColor;
  ctx.strokeStyle  = strokeColor;
  ctx.lineWidth    = strokeW;
  ctx.lineJoin     = 'round';
  ctx.textAlign    = 'center';

  const x       = canvas.width / 2;
  const padding = 14;

  // Texte HAUT
  if (topText) {
    ctx.textBaseline = 'top';
    const y = padding;
    if (strokeW > 0) ctx.strokeText(topText, x, y);
    ctx.fillText(topText, x, y);
  }

  // Texte BAS
  if (botText) {
    ctx.textBaseline = 'bottom';
    const y = canvas.height - padding;
    if (strokeW > 0) ctx.strokeText(botText, x, y);
    ctx.fillText(botText, x, y);
  }
}

// ── 6. APERÇU EN TEMPS RÉEL ───────────────────────────────────

[topTextInput, botTextInput, fontSizeInput,
 textColorIn, strokeColorIn, strokeWidthIn].forEach(el => {
  el.addEventListener('input', () => {
    if (el === fontSizeInput)  fontSizeVal.textContent   = el.value + 'px';
    if (el === strokeWidthIn)  strokeWidthVal.textContent = el.value + 'px';
    drawMeme();
  });
});

// ── 7. TÉLÉCHARGEMENT ─────────────────────────────────────────

btnDownload.addEventListener('click', () => {
  if (!currentImage) { showToast('Charge d\'abord une image !'); return; }
  triggerDownload();
  showToast('Mème téléchargé !');
});

function triggerDownload() {
  const link    = document.createElement('a');
  link.download = 'meme-' + Date.now() + '.png';
  link.href     = canvas.toDataURL('image/png');
  link.click();
}

// ── SUPPRESSION DE L'IMAGE ────────────────────────────────────
btnClearImage.addEventListener('click', () => {
  currentImage       = null;
  currentOriginalSrc = null;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  canvas.style.display      = 'none';
  placeholder.style.display = 'flex';
  imageInput.value          = '';
  topTextInput.value        = '';
  botTextInput.value        = '';
  btnClearImage.style.display   = 'none';
  btnCrop.style.display         = 'none';
  canvasCropFab.style.display   = 'none';
  if (cropMode) exitCropMode(false);
  showToast('Image supprimée');
});

// ── 8. SAUVEGARDE GALERIE (localStorage) ─────────────────────

btnSave.addEventListener('click', () => {
  if (!currentImage) { showToast('Charge d\'abord une image !'); return; }
  const dataURL = canvas.toDataURL('image/png');
  const memes   = getSavedMemes();
  memes.unshift({
    id:          Date.now(),
    src:         dataURL,
    originalSrc: currentOriginalSrc, // image sans texte pour ré-édition
    meta: {
      topText:     topTextInput.value,
      botText:     botTextInput.value,
      fontSize:    fontSizeInput.value,
      textColor:   textColorIn.value,
      strokeColor: strokeColorIn.value,
      strokeWidth: strokeWidthIn.value,
    }
  });
  if (memes.length > 20) memes.pop();
  localStorage.setItem('memeforge_gallery', JSON.stringify(memes));
  showToast('Mème sauvegardé dans la galerie !');
});

// ── 9. GALERIE ────────────────────────────────────────────────

function getSavedMemes() {
  try {
    return JSON.parse(localStorage.getItem('memeforge_gallery')) || [];
  } catch { return []; }
}

function renderGallery() {
  const memes = getSavedMemes();
  galleryGrid.innerHTML = '';

  if (memes.length === 0) {
    galleryEmpty.style.display = 'flex';
    galleryGrid.appendChild(galleryEmpty);
    return;
  }

  memes.forEach(meme => {
    const card    = document.createElement('div');
    card.className = 'gallery-card';

    const img  = document.createElement('img');
    img.src    = meme.src;
    img.alt    = 'Mème sauvegardé';
    img.style.cursor = 'zoom-in';
    img.title  = 'Cliquer pour agrandir';
    img.addEventListener('click', () => openLightbox(meme));

    const actions = document.createElement('div');
    actions.className = 'gallery-card-actions';

    const dlBtn = document.createElement('button');
    dlBtn.textContent = 'Télécharger';
    dlBtn.addEventListener('click', () => {
      const link    = document.createElement('a');
      link.download = 'meme-' + meme.id + '.png';
      link.href     = meme.src;
      link.click();
      showToast('Téléchargé !');
    });

    const delBtn = document.createElement('button');
    delBtn.textContent = 'Supprimer';
    delBtn.className   = 'del-btn';
    delBtn.addEventListener('click', () => {
      const updated = getSavedMemes().filter(m => m.id !== meme.id);
      localStorage.setItem('memeforge_gallery', JSON.stringify(updated));
      renderGallery();
      showToast('Mème supprimé');
    });

    actions.appendChild(dlBtn);
    actions.appendChild(delBtn);
    card.appendChild(img);
    card.appendChild(actions);
    galleryGrid.appendChild(card);
  });
}

btnClear.addEventListener('click', () => {
  if (getSavedMemes().length === 0) { showToast('La galerie est déjà vide !'); return; }
  if (confirm('Vider toute la galerie ? Action irréversible.')) {
    localStorage.removeItem('memeforge_gallery');
    renderGallery();
    showToast('Galerie vidée');
  }
});

// ── Crop DOM refs ─────────────────────────────────────────────
const cropOverlayCanvas = document.getElementById('crop-overlay');
const cropCtx           = cropOverlayCanvas.getContext('2d');
const btnCrop           = document.getElementById('btn-crop');
const btnCropConfirm    = document.getElementById('btn-crop-confirm');
const btnCropCancel     = document.getElementById('btn-crop-cancel');
const cropControls      = document.getElementById('crop-controls');

// ── Crop state ────────────────────────────────────────────────
let cropMode      = false;
let cropRect      = { x: 0, y: 0, w: 0, h: 0 };
let cropDragging  = null;   // 'move' | 'nw'|'n'|'ne'|'e'|'se'|'s'|'sw'|'w'
let cropDragStart = { x: 0, y: 0 };
let cropRectSnap  = null;

// ── Crop helpers ──────────────────────────────────────────────
function cropGetPos(e) {
  const r  = cropOverlayCanvas.getBoundingClientRect();
  const sx = cropOverlayCanvas.width  / r.width;
  const sy = cropOverlayCanvas.height / r.height;
  const src = e.touches ? e.touches[0] : e;
  return { x: (src.clientX - r.left) * sx, y: (src.clientY - r.top) * sy };
}

function cropHandles() {
  const { x, y, w, h } = cropRect;
  return [
    { id:'nw', x,       y       }, { id:'n',  x:x+w/2, y       }, { id:'ne', x:x+w,   y       },
    { id:'e',  x:x+w,   y:y+h/2 }, { id:'se', x:x+w,   y:y+h   },
    { id:'s',  x:x+w/2, y:y+h   }, { id:'sw', x,       y:y+h   }, { id:'w',  x,       y:y+h/2 },
  ];
}

function cropHitHandle(pos) {
  const HIT = 14;
  return cropHandles().find(h => Math.abs(pos.x - h.x) < HIT && Math.abs(pos.y - h.y) < HIT);
}

function cropInsideRect(pos) {
  const { x, y, w, h } = cropRect;
  return pos.x > x + 14 && pos.x < x + w - 14 && pos.y > y + 14 && pos.y < y + h - 14;
}

function drawCropOverlay() {
  const { x, y, w, h } = cropRect;
  cropCtx.clearRect(0, 0, cropOverlayCanvas.width, cropOverlayCanvas.height);

  // Masque sombre hors sélection
  cropCtx.fillStyle = 'rgba(0,0,0,0.55)';
  cropCtx.fillRect(0, 0, cropOverlayCanvas.width, cropOverlayCanvas.height);
  cropCtx.clearRect(x, y, w, h);

  // Bordure accent
  cropCtx.strokeStyle = '#ff4500';
  cropCtx.lineWidth   = 2;
  cropCtx.strokeRect(x, y, w, h);

  // Grille des tiers
  cropCtx.strokeStyle = 'rgba(255,255,255,0.25)';
  cropCtx.lineWidth   = 1;
  cropCtx.beginPath();
  [1,2].forEach(i => {
    cropCtx.moveTo(x + w*i/3, y); cropCtx.lineTo(x + w*i/3, y+h);
    cropCtx.moveTo(x, y + h*i/3); cropCtx.lineTo(x+w,  y + h*i/3);
  });
  cropCtx.stroke();

  // Poignées
  cropHandles().forEach(handle => {
    cropCtx.fillStyle   = '#ffffff';
    cropCtx.strokeStyle = '#ff4500';
    cropCtx.lineWidth   = 2;
    cropCtx.beginPath();
    cropCtx.arc(handle.x, handle.y, 6, 0, Math.PI * 2);
    cropCtx.fill();
    cropCtx.stroke();
  });
}

function enterCropMode() {
  if (!currentImage) { showToast('Charge d\'abord une image !'); return; }
  cropMode = true;
  cropRect = { x: 0, y: 0, w: canvas.width, h: canvas.height };
  cropOverlayCanvas.width  = canvas.width;
  cropOverlayCanvas.height = canvas.height;
  cropOverlayCanvas.style.display = 'block';
  cropControls.style.display      = 'flex';
  btnCrop.style.display           = 'none';
  canvasCropFab.style.display     = 'none';
  drawCropOverlay();
}

function exitCropMode(doApply) {
  cropMode = false;
  cropOverlayCanvas.style.display = 'none';
  cropControls.style.display      = 'none';
  btnCrop.style.display           = 'flex';
  canvasCropFab.style.display     = 'flex';

  if (!doApply) return;

  const { x, y, w, h } = cropRect;
  if (w < 10 || h < 10) { showToast('Zone trop petite !'); return; }

  // Applique le recadrage sur un canvas temporaire
  const tmp    = document.createElement('canvas');
  tmp.width    = Math.round(w);
  tmp.height   = Math.round(h);
  tmp.getContext('2d').drawImage(canvas, x, y, w, h, 0, 0, w, h);

  const croppedSrc = tmp.toDataURL('image/jpeg', 0.92);
  const img        = new Image();
  img.onload = () => {
    currentImage       = img;
    currentOriginalSrc = croppedSrc; // le recadrage devient la nouvelle base
    canvas.width       = tmp.width;
    canvas.height      = tmp.height;
    drawMeme();
    showToast('Image recadrée !');
  };
  img.src = croppedSrc;
}

// ── Crop events ───────────────────────────────────────────────
function cropOnDown(e) {
  e.preventDefault();
  const pos    = cropGetPos(e);
  const handle = cropHitHandle(pos);
  cropDragging = handle ? handle.id : (cropInsideRect(pos) ? 'move' : null);
  cropDragStart = pos;
  cropRectSnap  = { ...cropRect };
}

function cropOnMove(e) {
  e.preventDefault();
  const pos = cropGetPos(e);

  if (!cropDragging) {
    const handle = cropHitHandle(pos);
    const cursors = { nw:'nw-resize', n:'n-resize', ne:'ne-resize', e:'e-resize',
                      se:'se-resize', s:'s-resize', sw:'sw-resize', w:'w-resize' };
    cropOverlayCanvas.style.cursor = handle ? cursors[handle.id]
      : cropInsideRect(pos) ? 'move' : 'crosshair';
    return;
  }

  const dx = pos.x - cropDragStart.x;
  const dy = pos.y - cropDragStart.y;
  const MIN = 30;
  const CW  = canvas.width, CH = canvas.height;
  let { x, y, w, h } = cropRectSnap;

  if (cropDragging === 'move') {
    x = Math.max(0, Math.min(CW - w, x + dx));
    y = Math.max(0, Math.min(CH - h, y + dy));
  } else {
    if (cropDragging.includes('e')) { w = Math.max(MIN, Math.min(CW - x, w + dx)); }
    if (cropDragging.includes('s')) { h = Math.max(MIN, Math.min(CH - y, h + dy)); }
    if (cropDragging.includes('w')) { const nw = Math.max(MIN, w - dx); x = x + w - nw; w = nw; }
    if (cropDragging.includes('n')) { const nh = Math.max(MIN, h - dy); y = y + h - nh; h = nh; }
    x = Math.max(0, x); y = Math.max(0, y);
    if (x + w > CW) w = CW - x;
    if (y + h > CH) h = CH - y;
  }
  cropRect = { x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h) };
  drawCropOverlay();
}

function cropOnUp(e) { e.preventDefault(); cropDragging = null; }

cropOverlayCanvas.addEventListener('mousedown',  cropOnDown);
cropOverlayCanvas.addEventListener('mousemove',  cropOnMove);
cropOverlayCanvas.addEventListener('mouseup',    cropOnUp);
cropOverlayCanvas.addEventListener('mouseleave', cropOnUp);
cropOverlayCanvas.addEventListener('touchstart', cropOnDown, { passive: false });
cropOverlayCanvas.addEventListener('touchmove',  cropOnMove, { passive: false });
cropOverlayCanvas.addEventListener('touchend',   cropOnUp,   { passive: false });

btnCrop.addEventListener('click',        () => enterCropMode());
btnCropConfirm.addEventListener('click', () => exitCropMode(true));
btnCropCancel.addEventListener('click',  () => exitCropMode(false));

const canvasCropFab  = document.getElementById('canvas-crop-fab');

// ── Clic fab recadrage flottant ────────────────────────────────
canvasCropFab.addEventListener('click', () => enterCropMode());

// ── 9b. MENU CONTEXTUEL TEXTE SUR CANVAS ─────────────────────
const textCtxMenu   = document.getElementById('text-ctx-menu');
const textCtxLabel  = document.getElementById('text-ctx-label');
const ctxEdit       = document.getElementById('ctx-edit');
const ctxDelete     = document.getElementById('ctx-delete');
let   activeCtxZone = null; // 'top' | 'bot'

/**
 * Convertit les coordonnées écran en coordonnées canvas
 * (tient compte du scale CSS max-width:100%)
 */
function canvasCoords(clientX, clientY) {
  const r  = canvas.getBoundingClientRect();
  return {
    x: (clientX - r.left) * (canvas.width  / r.width),
    y: (clientY - r.top)  * (canvas.height / r.height),
  };
}

/** Retourne 'top', 'bot', ou null selon la zone cliquée */
function getTextZone(cx, cy) {
  const fs      = parseInt(fontSizeInput.value);
  const zoneH   = fs + 34; // hauteur de la zone de détection
  if (cy < zoneH            && topTextInput.value.trim()) return 'top';
  if (cy > canvas.height - zoneH && botTextInput.value.trim()) return 'bot';
  return null;
}

function showTextCtxMenu(clientX, clientY, zone) {
  activeCtxZone = zone;
  textCtxLabel.textContent = zone === 'top' ? '🔝 Texte du haut' : '🔽 Texte du bas';

  // Positionnement : évite les débordements écran
  const menuW = 178, menuH = 100;
  let left = clientX + 6;
  let top  = clientY + 6;
  if (left + menuW > window.innerWidth)  left = clientX - menuW - 6;
  if (top  + menuH > window.innerHeight) top  = clientY - menuH - 6;

  textCtxMenu.style.left = left + 'px';
  textCtxMenu.style.top  = top  + 'px';
  textCtxMenu.classList.add('open');
}

function hideTextCtxMenu() {
  textCtxMenu.classList.remove('open');
  activeCtxZone = null;
}

// Changer le curseur selon la zone survolée
canvas.addEventListener('mousemove', e => {
  if (cropMode || !currentImage) return;
  const { x, y } = canvasCoords(e.clientX, e.clientY);
  canvas.style.cursor = getTextZone(x, y) ? 'pointer' : 'default';
});

// Clic sur le canvas → menu contextuel
canvas.addEventListener('click', e => {
  if (cropMode || !currentImage) return;
  const { x, y } = canvasCoords(e.clientX, e.clientY);
  const zone = getTextZone(x, y);
  if (zone) {
    e.stopPropagation();
    showTextCtxMenu(e.clientX, e.clientY, zone);
  } else {
    hideTextCtxMenu();
  }
});

// Fermer le menu en cliquant ailleurs
document.addEventListener('click', e => {
  if (!textCtxMenu.contains(e.target)) hideTextCtxMenu();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') hideTextCtxMenu();
});

// ── Action : Modifier ─────────────────────────────────────────
ctxEdit.addEventListener('click', () => {
  const input = activeCtxZone === 'top' ? topTextInput : botTextInput;
  hideTextCtxMenu();
  // Scroll vers le panneau gauche et focus sur le champ
  input.scrollIntoView({ behavior: 'smooth', block: 'center' });
  setTimeout(() => { input.focus(); input.select(); }, 200);
});

// ── Action : Supprimer ────────────────────────────────────────
ctxDelete.addEventListener('click', () => {
  if (activeCtxZone === 'top') topTextInput.value = '';
  else                          botTextInput.value = '';
  drawMeme();
  hideTextCtxMenu();
  showToast('Texte supprimé');
});

// ── 10. LIGHTBOX GALERIE ──────────────────────────────────────

function openLightbox(meme) {
  lightboxMeme    = meme;
  lightboxImg.src = meme.src;
  lightboxOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightboxOverlay.classList.remove('open');
  document.body.style.overflow = '';
  // Léger délai avant de vider le src pour éviter le flash
  setTimeout(() => { lightboxImg.src = ''; lightboxMeme = null; }, 250);
}

lightboxClose.addEventListener('click', closeLightbox);
lightboxImg.addEventListener('click', closeLightbox);   // clic image = fermer
lightboxOverlay.addEventListener('click', e => {
  if (e.target === lightboxOverlay) closeLightbox();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeLightbox();
});

// Télécharger depuis la lightbox
lightboxDl.addEventListener('click', () => {
  if (!lightboxMeme) return;
  const link    = document.createElement('a');
  link.download = 'meme-' + lightboxMeme.id + '.png';
  link.href     = lightboxMeme.src;
  link.click();
  showToast('Mème téléchargé !');
});

// ── Retour aux modifications ──────────────────────────────────
lightboxEdit.addEventListener('click', () => {
  if (!lightboxMeme) return;

  // Source : image originale sans texte si disponible, sinon le mème aplati
  const srcToLoad = lightboxMeme.originalSrc || lightboxMeme.src;
  const meta      = lightboxMeme.meta || {};

  const img = new Image();
  img.onload = () => {
    currentImage       = img;
    currentOriginalSrc = srcToLoad;

    const maxW  = 700;
    const scale = img.width > maxW ? maxW / img.width : 1;
    canvas.width  = Math.round(img.width  * scale);
    canvas.height = Math.round(img.height * scale);
    canvas.style.display        = 'block';
    placeholder.style.display   = 'none';
    btnClearImage.style.display = 'flex';
    btnCrop.style.display       = 'flex';
    canvasCropFab.style.display = 'flex';

    // Restaure les textes et le style dans les champs
    topTextInput.value   = meta.topText    || '';
    botTextInput.value   = meta.botText    || '';
    fontSizeInput.value  = meta.fontSize   || 42;
    textColorIn.value    = meta.textColor  || '#ffffff';
    strokeColorIn.value  = meta.strokeColor|| '#000000';
    strokeWidthIn.value  = meta.strokeWidth|| 3;
    fontSizeVal.textContent   = (meta.fontSize   || 42) + 'px';
    strokeWidthVal.textContent= (meta.strokeWidth|| 3)  + 'px';

    drawMeme();
    closeLightbox();

    // Bascule vers l'onglet éditeur
    navTabs.forEach(t => t.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));
    document.querySelector('[data-tab="editor"]').classList.add('active');
    document.getElementById('tab-editor').classList.add('active');

    showToast('Mème chargé — modifie les textes !');
  };
  img.src = srcToLoad;
});

// ── 11. MODAL DE PARTAGE ──────────────────────────────────────

/**
 * Ouvre le modal de partage.
 * Sur mobile, tente d'abord le Web Share API natif.
 * Sur desktop (ou si échec), affiche le modal avec les options réseaux sociaux.
 */
btnShare.addEventListener('click', async () => {
  if (!currentImage) { showToast('Charge d\'abord une image !'); return; }

  // Tentative Web Share API natif (mobile uniquement)
  if (navigator.share && navigator.canShare) {
    try {
      const blob = await canvasToBlob();
      const file = new File([blob], 'meme.png', { type: 'image/png' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ title: 'Mon mème MemeForge', files: [file] });
        showToast('Mème partagé !');
        return;
      }
    } catch (err) {
      if (err.name === 'AbortError') return; // L'utilisateur a annulé
      // Sinon, affiche le modal comme fallback
    }
  }

  openShareModal();
});

function openShareModal() {
  shareDownloadHint.classList.remove('visible');
  shareOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeShareModal() {
  shareOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

// Fermeture
shareClose.addEventListener('click', closeShareModal);
shareOverlay.addEventListener('click', e => {
  if (e.target === shareOverlay) closeShareModal();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeShareModal();
});

// ─── Copie le mème dans le presse-papier ─────────────────────
// Retourne true si succès, false si le navigateur bloque
async function copyMemeToClipboard() {
  try {
    const blob = await canvasToBlob();
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    return true;
  } catch {
    return false;
  }
}

/**
 * Stratégie commune pour WhatsApp, Facebook, Telegram :
 * 1. Copie l'image dans le presse-papier
 * 2. Ouvre la plateforme dans un nouvel onglet
 * 3. Affiche un toast guidant l'utilisateur pour coller (Ctrl+V)
 * Fallback : télécharge l'image si le clipboard est bloqué
 */
async function shareViaPlatform({ url, platformName, pasteHint }) {
  const copied = await copyMemeToClipboard();

  if (copied) {
    showShareInstructions(platformName, pasteHint);
  } else {
    // Clipboard bloqué (navigateur ou permissions) → télécharge à la place
    triggerDownload();
    showToast(`Image téléchargée — envoie-la manuellement sur ${platformName}`);
  }

  setTimeout(() => window.open(url, '_blank'), 300);
  closeShareModal();
}

// ─── Bannière d'instruction collage ──────────────────────────
// Affiche une notification persistante guidant l'utilisateur
function showShareInstructions(platform, hint) {
  // Retire une éventuelle bannière existante
  const old = document.getElementById('paste-banner');
  if (old) old.remove();

  const banner = document.createElement('div');
  banner.id = 'paste-banner';
  banner.innerHTML = `
    <span class="paste-banner-icon">📋</span>
    <div class="paste-banner-text">
      <strong>Mème copié !</strong>
      <span>${hint}</span>
    </div>
    <button class="paste-banner-close" onclick="this.parentElement.remove()">✕</button>
  `;
  document.body.appendChild(banner);

  // Auto-suppression après 12 s
  setTimeout(() => { if (banner.parentElement) banner.remove(); }, 12000);
}

// ─── WhatsApp ─────────────────────────────────────────────────
shareWhatsapp.addEventListener('click', () => {
  shareViaPlatform({
    url: 'https://web.whatsapp.com/',
    platformName: 'WhatsApp',
    pasteHint: 'Dans WhatsApp Web, ouvre une conversation et colle (Ctrl+V / Cmd+V).'
  });
});

// ─── Facebook ─────────────────────────────────────────────────
shareFacebook.addEventListener('click', () => {
  shareViaPlatform({
    url: 'https://www.facebook.com/',
    platformName: 'Facebook',
    pasteHint: 'Dans le compositeur de post Facebook, colle l\'image (Ctrl+V / Cmd+V).'
  });
});

// ─── Telegram ─────────────────────────────────────────────────
shareTelegram.addEventListener('click', () => {
  shareViaPlatform({
    url: 'https://web.telegram.org/',
    platformName: 'Telegram',
    pasteHint: 'Dans Telegram Web, ouvre un chat et colle l\'image (Ctrl+V / Cmd+V).'
  });
});

// ─── Twitter / X ──────────────────────────────────────────────
shareTwitter.addEventListener('click', async () => {
  const copied = await copyMemeToClipboard();
  window.open('https://twitter.com/intent/tweet', '_blank');
  if (copied) {
    showShareInstructions('Twitter/X', 'Dans la fenêtre de tweet, colle l\'image (Ctrl+V / Cmd+V).');
  } else {
    triggerDownload();
    showToast('Image téléchargée — joins-la à ton tweet !');
  }
  closeShareModal();
});

// ─── Copier l'image dans le presse-papier ─────────────────────
shareCopy.addEventListener('click', async () => {
  const copied = await copyMemeToClipboard();
  if (copied) {
    showToast('✅ Image copiée — colle-la où tu veux (Ctrl+V) !');
  } else {
    triggerDownload();
    showToast('Clipboard non supporté — image téléchargée à la place.');
  }
  closeShareModal();
});

// ─── Bouton téléchargement dans le modal ──────────────────────
shareDlBtn.addEventListener('click', () => {
  triggerDownload();
  showToast('Mème téléchargé !');
});

// ── 11. UTILITAIRES ───────────────────────────────────────────

function canvasToBlob() {
  return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
}

function showToast(message) {
  if (toastTimer) clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

// ── 12. INIT ──────────────────────────────────────────────────
console.log('MemeForge v1.1 — partage réseaux sociaux activé ✅');
