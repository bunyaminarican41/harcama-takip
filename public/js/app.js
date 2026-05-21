let kategoriler = [];

// ── Sayfa navigasyonu ────────────────────────────────────────────
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('page-' + btn.dataset.page).classList.add('active');
    if (btn.dataset.page === 'ozet') ozetYukle();
    if (btn.dataset.page === 'harcamalar') harcamalarYukle();
    if (btn.dataset.page === 'kategoriler') kategorilerYukle();
  });
});

document.getElementById('modal-kapat').addEventListener('click', UI.modalKapat);
document.getElementById('modal-overlay').addEventListener('click', e => {
  if (e.target === e.currentTarget) UI.modalKapat();
});

// ── ÖZET SAYFASI ────────────────────────────────────────────────
async function ozetYukle() {
  try {
    const [ozet, son] = await Promise.all([
      API.harcamalar.ozet(),
      API.harcamalar.listele()
    ]);

    document.getElementById('stat-gelir').textContent = UI.formatPara(ozet.toplam_gelir);
    document.getElementById('stat-gider').textContent = UI.formatPara(ozet.toplam_gider);
    const bakiyeEl = document.getElementById('stat-bakiye');
    bakiyeEl.textContent = UI.formatPara(ozet.bakiye);

    kategoriChartRender(ozet.kategori_bazli, ozet.toplam_gider);
    sonIslemlerRender(son.slice(0, 8));
  } catch (e) {
    UI.toast(e.message, 'hata');
  }
}

function kategoriChartRender(veriler, toplam) {
  const el = document.getElementById('kategori-chart');
  if (!veriler.length) {
    el.innerHTML = '<div class="bos-durum"><p>Henüz gider kaydı yok.</p></div>';
    return;
  }
  el.innerHTML = veriler.map(v => {
    const oran = toplam > 0 ? (v.toplam / toplam) * 100 : 0;
    return `
      <div class="chart-bar-row">
        <span class="chart-bar-label">${v.ad}</span>
        <div class="chart-bar-track">
          <div class="chart-bar-fill" style="width:${oran.toFixed(1)}%;background:${v.renk}"></div>
        </div>
        <span class="chart-bar-val">${UI.formatPara(v.toplam)}</span>
      </div>
    `;
  }).join('');
}

function sonIslemlerRender(harcamalar) {
  const el = document.getElementById('son-islemler');
  if (!harcamalar.length) {
    el.innerHTML = '<div class="bos-durum"><p>Henüz kayıt yok.</p></div>';
    return;
  }
  el.innerHTML = harcamalar.map(h => `
    <div class="son-islem-item">
      <div class="son-islem-dot" style="background:${h.kategori_renk || '#6b7280'}"></div>
      <div class="son-islem-info">
        <div class="son-islem-baslik">${escHtml(h.baslik)}</div>
        <div class="son-islem-tarih">${UI.formatTarih(h.tarih)} ${h.kategori_ad ? '· ' + escHtml(h.kategori_ad) : ''}</div>
      </div>
      <span class="son-islem-miktar miktar-${h.tur}">${h.tur === 'gider' ? '-' : '+'}${UI.formatPara(h.miktar)}</span>
    </div>
  `).join('');
}

// ── HARCAMALAR SAYFASI ──────────────────────────────────────────
let aramaTimer;
['arama', 'filtre-tur', 'filtre-kategori', 'filtre-baslangic', 'filtre-bitis'].forEach(id => {
  document.getElementById(id).addEventListener('input', () => {
    clearTimeout(aramaTimer);
    aramaTimer = setTimeout(harcamalarYukle, 300);
  });
});

document.getElementById('filtre-temizle').addEventListener('click', () => {
  ['arama', 'filtre-baslangic', 'filtre-bitis'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('filtre-tur').value = '';
  document.getElementById('filtre-kategori').value = '';
  harcamalarYukle();
});

async function harcamalarYukle() {
  const params = {
    arama: document.getElementById('arama').value,
    tur: document.getElementById('filtre-tur').value,
    kategori_id: document.getElementById('filtre-kategori').value,
    baslangic: document.getElementById('filtre-baslangic').value,
    bitis: document.getElementById('filtre-bitis').value
  };
  try {
    const liste = await API.harcamalar.listele(params);
    harcamaTabloRender(liste);
  } catch (e) {
    UI.toast(e.message, 'hata');
  }
}

function harcamaTabloRender(liste) {
  const el = document.getElementById('harcama-listesi');
  if (!liste.length) {
    el.innerHTML = `<div class="bos-durum">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg>
      <p>Kayıt bulunamadı.</p>
    </div>`;
    return;
  }
  el.innerHTML = `
    <table>
      <thead><tr>
        <th>Başlık</th><th>Miktar</th><th>Tür</th><th>Kategori</th><th>Tarih</th><th>İşlem</th>
      </tr></thead>
      <tbody>
        ${liste.map(h => `
          <tr>
            <td>${escHtml(h.baslik)}${h.aciklama ? `<div style="font-size:11px;color:var(--text2);margin-top:2px">${escHtml(h.aciklama)}</div>` : ''}</td>
            <td style="font-family:var(--mono);font-weight:600;color:${h.tur === 'gider' ? 'var(--red)' : 'var(--green)'}">
              ${h.tur === 'gider' ? '-' : '+'}${UI.formatPara(h.miktar)}
            </td>
            <td><span class="tur-badge ${h.tur}">${h.tur === 'gider' ? 'Gider' : 'Gelir'}</span></td>
            <td>${h.kategori_ad
              ? `<span class="kategori-chip" style="background:${h.kategori_renk}22;color:${h.kategori_renk}">
                  <span class="kategori-chip-dot" style="background:${h.kategori_renk}"></span>${escHtml(h.kategori_ad)}
                 </span>`
              : '<span style="color:var(--text2)">—</span>'
            }</td>
            <td style="color:var(--text2)">${UI.formatTarih(h.tarih)}</td>
            <td>
              <div class="action-btns">
                <button class="btn-icon" onclick="harcamaDuzenle(${h.id})">✏️</button>
                <button class="btn-icon sil" onclick="harcamaSil(${h.id})">🗑</button>
              </div>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

// Yeni harcama
document.getElementById('yeni-harcama-btn').addEventListener('click', () => harcamaModalAc());
document.getElementById('hizli-ekle-btn').addEventListener('click', () => {
  document.querySelector('[data-page="harcamalar"]').click();
  setTimeout(() => harcamaModalAc(), 50);
});

async function harcamaModalAc(harcama = null) {
  if (!kategoriler.length) await kategorileriYenile();
  UI.modalAc(harcama ? 'Harcamayı Düzenle' : 'Yeni Harcama', UI.harcamaFormuHTML(kategoriler, harcama));
  UI.turToggleKur();
  document.getElementById('form-iptal').addEventListener('click', UI.modalKapat);
  document.getElementById('form-kaydet').addEventListener('click', async () => {
    try {
      const veri = UI.harcamaFormVeriAl();
      if (harcama) {
        await API.harcamalar.guncelle(harcama.id, veri);
        UI.toast('Harcama güncellendi.');
      } else {
        await API.harcamalar.olustur(veri);
        UI.toast('Harcama eklendi.');
      }
      UI.modalKapat();
      harcamalarYukle();
    } catch (e) {
      document.getElementById('form-error').textContent = e.message;
    }
  });
}

async function harcamaDuzenle(id) {
  try {
    const h = await API.harcamalar.getir(id);
    harcamaModalAc(h);
  } catch (e) {
    UI.toast(e.message, 'hata');
  }
}

async function harcamaSil(id) {
  if (!confirm('Bu harcamayı silmek istediğinizden emin misiniz?')) return;
  try {
    await API.harcamalar.sil(id);
    UI.toast('Harcama silindi.');
    harcamalarYukle();
  } catch (e) {
    UI.toast(e.message, 'hata');
  }
}

// ── KATEGORİLER SAYFASI ─────────────────────────────────────────
document.getElementById('yeni-kategori-btn').addEventListener('click', () => kategoriModalAc());

async function kategorileriYenile() {
  kategoriler = await API.kategoriler.listele();
  // Filtre select güncelle
  const sel = document.getElementById('filtre-kategori');
  const mevcut = sel.value;
  sel.innerHTML = '<option value="">Tüm Kategoriler</option>' +
    kategoriler.map(k => `<option value="${k.id}" ${k.id == mevcut ? 'selected' : ''}>${k.ad}</option>`).join('');
}

async function kategorilerYukle() {
  await kategorileriYenile();
  const el = document.getElementById('kategori-listesi');
  if (!kategoriler.length) {
    el.innerHTML = '<div class="bos-durum"><p>Henüz kategori yok.</p></div>';
    return;
  }
  el.innerHTML = kategoriler.map(k => `
    <div class="kategori-kart">
      <div class="kategori-kart-header">
        <span class="kategori-renk-swatch" style="background:${k.renk}"></span>
        <span class="kategori-kart-ad">${escHtml(k.ad)}</span>
      </div>
      <div class="kategori-kart-sayi">${k.harcama_sayisi} harcama kaydı</div>
      <div class="kategori-kart-actions">
        <button class="btn btn-ghost" style="flex:1;padding:7px" onclick="kategoriDuzenle(${k.id})">Düzenle</button>
        <button class="btn btn-danger" style="flex:1;padding:7px" onclick="kategoriSilFn(${k.id})">Sil</button>
      </div>
    </div>
  `).join('');
}

function kategoriModalAc(kategori = null) {
  UI.modalAc(kategori ? 'Kategoriyi Düzenle' : 'Yeni Kategori', UI.kategoriFormuHTML(kategori));
  UI.renkPickerKur();
  document.getElementById('kform-iptal').addEventListener('click', UI.modalKapat);
  document.getElementById('kform-kaydet').addEventListener('click', async () => {
    try {
      const veri = UI.kategoriFormVeriAl();
      if (kategori) {
        await API.kategoriler.guncelle(kategori.id, veri);
        UI.toast('Kategori güncellendi.');
      } else {
        await API.kategoriler.olustur(veri);
        UI.toast('Kategori eklendi.');
      }
      UI.modalKapat();
      kategorilerYukle();
    } catch (e) {
      document.getElementById('kform-error').textContent = e.message;
    }
  });
}

async function kategoriDuzenle(id) {
  const k = kategoriler.find(c => c.id === id);
  if (k) kategoriModalAc(k);
}

async function kategoriSilFn(id) {
  const k = kategoriler.find(c => c.id === id);
  if (!confirm(`"${k ? k.ad : 'Bu kategori'}" silinecek. Emin misiniz?`)) return;
  try {
    await API.kategoriler.sil(id);
    UI.toast('Kategori silindi.');
    kategorilerYukle();
  } catch (e) {
    UI.toast(e.message, 'hata');
  }
}

function escHtml(str) {
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── BAŞLANGIÇ ───────────────────────────────────────────────────
(async () => {
  await kategorileriYenile();
  ozetYukle();
})();
