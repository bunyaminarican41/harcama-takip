const UI = {
  formatPara(miktar) {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 2 }).format(miktar);
  },
  formatTarih(tarih) {
    return new Date(tarih + 'T00:00:00').toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' });
  },

  toast(mesaj, tur = 'basari') {
    const el = document.getElementById('toast');
    el.textContent = mesaj;
    el.className = `toast ${tur}`;
    clearTimeout(UI._toastTimer);
    UI._toastTimer = setTimeout(() => el.classList.add('hidden'), 3000);
  },

  modalAc(baslik, icerik) {
    document.getElementById('modal-baslik').textContent = baslik;
    document.getElementById('modal-body').innerHTML = icerik;
    document.getElementById('modal-overlay').classList.remove('hidden');
  },

  modalKapat() {
    document.getElementById('modal-overlay').classList.add('hidden');
    document.getElementById('modal-body').innerHTML = '';
  },

  harcamaFormuHTML(kategoriler, harcama = null) {
    const tur = harcama ? harcama.tur : 'gider';
    const kategoriSecenekler = kategoriler.map(k =>
      `<option value="${k.id}" ${harcama && harcama.kategori_id === k.id ? 'selected' : ''}>${k.ad}</option>`
    ).join('');

    return `
      <div class="form-group">
        <label class="form-label">Tür</label>
        <div class="tur-toggle">
          <button type="button" class="tur-btn ${tur === 'gider' ? 'active gider' : ''}" data-tur="gider">Gider</button>
          <button type="button" class="tur-btn ${tur === 'gelir' ? 'active gelir' : ''}" data-tur="gelir">Gelir</button>
        </div>
        <input type="hidden" id="form-tur" value="${tur}" />
      </div>
      <div class="form-group">
        <label class="form-label">Başlık *</label>
        <input type="text" id="form-baslik" class="form-input" value="${harcama ? harcama.baslik : ''}" placeholder="Örn: Market alışverişi" maxlength="100" />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Miktar (₺) *</label>
          <input type="number" id="form-miktar" class="form-input" value="${harcama ? harcama.miktar : ''}" placeholder="0.00" step="0.01" min="0.01" />
        </div>
        <div class="form-group">
          <label class="form-label">Tarih</label>
          <input type="date" id="form-tarih" class="form-input" value="${harcama ? harcama.tarih : new Date().toISOString().split('T')[0]}" />
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Kategori</label>
        <select id="form-kategori" class="form-select">
          <option value="">Seçiniz</option>
          ${kategoriSecenekler}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Açıklama</label>
        <textarea id="form-aciklama" class="form-textarea" placeholder="Opsiyonel not…">${harcama ? (harcama.aciklama || '') : ''}</textarea>
      </div>
      <div id="form-error" class="form-error"></div>
      <div class="modal-footer">
        <button class="btn btn-ghost" id="form-iptal">İptal</button>
        <button class="btn btn-primary" id="form-kaydet">Kaydet</button>
      </div>
    `;
  },

  kategoriFormuHTML(kategori = null) {
    const renk = kategori ? kategori.renk : '#6366f1';
    return `
      <div class="form-group">
        <label class="form-label">Kategori Adı *</label>
        <input type="text" id="kform-ad" class="form-input" value="${kategori ? kategori.ad : ''}" placeholder="Örn: Spor" maxlength="50" />
      </div>
      <div class="form-group">
        <label class="form-label">Renk</label>
        <div class="renk-picker-wrap">
          <div class="renk-preview" id="renk-preview" style="background:${renk}"></div>
          <input type="color" id="kform-renk-picker" value="${renk}" />
          <input type="text" id="kform-renk" class="form-input" value="${renk}" placeholder="#6366f1" style="flex:1" maxlength="7" />
          <button type="button" class="btn btn-ghost" id="renk-sec-btn" style="padding:9px 12px">🎨</button>
        </div>
      </div>
      <div id="kform-error" class="form-error"></div>
      <div class="modal-footer">
        <button class="btn btn-ghost" id="kform-iptal">İptal</button>
        <button class="btn btn-primary" id="kform-kaydet">Kaydet</button>
      </div>
    `;
  },

  turToggleKur() {
    document.querySelectorAll('.tur-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tur-btn').forEach(b => b.classList.remove('active', 'gider', 'gelir'));
        btn.classList.add('active', btn.dataset.tur);
        document.getElementById('form-tur').value = btn.dataset.tur;
      });
    });
  },

  renkPickerKur() {
    const picker = document.getElementById('kform-renk-picker');
    const text = document.getElementById('kform-renk');
    const preview = document.getElementById('renk-preview');
    const btn = document.getElementById('renk-sec-btn');
    if (!picker) return;
    btn.addEventListener('click', () => picker.click());
    picker.addEventListener('input', () => {
      text.value = picker.value;
      preview.style.background = picker.value;
    });
    text.addEventListener('input', () => {
      const val = text.value;
      if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
        picker.value = val;
        preview.style.background = val;
      }
    });
  },

  harcamaFormVeriAl() {
    const baslik = document.getElementById('form-baslik').value.trim();
    const miktar = parseFloat(document.getElementById('form-miktar').value);
    const tur = document.getElementById('form-tur').value;
    const kategori_id = document.getElementById('form-kategori').value || null;
    const aciklama = document.getElementById('form-aciklama').value.trim() || null;
    const tarih = document.getElementById('form-tarih').value;

    if (!baslik) throw new Error('Başlık zorunludur.');
    if (!miktar || miktar <= 0) throw new Error('Geçerli bir miktar giriniz.');
    if (!tur) throw new Error('Tür seçiniz.');

    return { baslik, miktar, tur, kategori_id: kategori_id ? Number(kategori_id) : null, aciklama, tarih };
  },

  kategoriFormVeriAl() {
    const ad = document.getElementById('kform-ad').value.trim();
    const renk = document.getElementById('kform-renk').value.trim();
    if (!ad) throw new Error('Kategori adı zorunludur.');
    if (renk && !/^#[0-9A-Fa-f]{6}$/.test(renk)) throw new Error('Geçerli bir hex renk kodu giriniz.');
    return { ad, renk: renk || '#6366f1' };
  }
};
