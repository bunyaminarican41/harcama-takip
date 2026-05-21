const API = {
  async istek(method, yol, veri) {
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (veri) opts.body = JSON.stringify(veri);
    const res = await fetch('/api' + yol, opts);
    if (res.status === 204) return null;
    const json = await res.json();
    if (!res.ok) throw new Error(json.hata || 'Bir hata oluştu.');
    return json;
  },
  harcamalar: {
    listele: (params = {}) => {
      const q = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([,v]) => v)));
      return API.istek('GET', `/harcamalar?${q}`);
    },
    getir: (id) => API.istek('GET', `/harcamalar/${id}`),
    olustur: (veri) => API.istek('POST', '/harcamalar', veri),
    guncelle: (id, veri) => API.istek('PUT', `/harcamalar/${id}`, veri),
    sil: (id) => API.istek('DELETE', `/harcamalar/${id}`),
    ozet: () => API.istek('GET', '/harcamalar/ozet')
  },
  kategoriler: {
    listele: () => API.istek('GET', '/kategoriler'),
    olustur: (veri) => API.istek('POST', '/kategoriler', veri),
    guncelle: (id, veri) => API.istek('PUT', `/kategoriler/${id}`, veri),
    sil: (id) => API.istek('DELETE', `/kategoriler/${id}`)
  }
};
