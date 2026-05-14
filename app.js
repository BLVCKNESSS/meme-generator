// ─────────────────────────────────────────────────────────────
//  MemeForge — app.js
//  Phase 2 : Canvas, texte temps réel, galerie, téléchargement
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

// ── 2. ÉTAT DE L'APPLICATION ──────────────────────────────────
let currentImage = null;
let toastTimer   = null;

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

uploadZone.addEventListener('click', () => imageInput.click());

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
  if (file.size > 10 * 1024 * 1024) {
    showToast('Image trop lourde (max 10 Mo)');
    return;
  }
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      currentImage = img;
      const maxW  = 700;
      const scale = img.width > maxW ? maxW / img.width : 1;
      canvas.width  = Math.round(img.width  * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.style.display      = 'block';
      placeholder.style.display = 'none';
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
  const link    = document.createElement('a');
  link.download = 'meme-' + Date.now() + '.png';
  link.href     = canvas.toDataURL('image/png');
  link.click();
  showToast('Mème téléchargé !');
});

// ── 8. SAUVEGARDE GALERIE (localStorage) ─────────────────────

btnSave.addEventListener('click', () => {
  if (!currentImage) { showToast('Charge d\'abord une image !'); return; }
  const dataURL = canvas.toDataURL('image/png');
  const memes   = getSavedMemes();
  memes.unshift({ id: Date.now(), src: dataURL });
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

// ── 10. PARTAGE ───────────────────────────────────────────────

btnShare.addEventListener('click', async () => {
  if (!currentImage) { showToast('Charge d\'abord une image !'); return; }

  // Web Share API natif (mobile)
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
      if (err.name !== 'AbortError') console.warn('Share error:', err);
    }
  }

  // Fallback desktop : Twitter/X
  const text = encodeURIComponent('Regarde ce mème ! Créé avec MemeForge');
  window.open('https://twitter.com/intent/tweet?text=' + text, '_blank');
  showToast('Ouverture Twitter/X...');
});

function canvasToBlob() {
  return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
}

// ── 11. TOAST ─────────────────────────────────────────────────

function showToast(message) {
  if (toastTimer) clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

// ── 12. INIT ──────────────────────────────────────────────────
console.log('MemeForge v1.0 — prêt ✅');
