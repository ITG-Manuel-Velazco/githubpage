// ============================================================
// render.js
// Lee content.json y construye todas las secciones de la página.
// Este archivo normalmente NO se toca: para cambiar textos, fechas,
// foto, experiencia, educación, etc. edita únicamente content.json.
// ============================================================

const ICONS = {
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  globo: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 4 6 4 9s-1.5 6.5-4 9c-2.5-2.5-4-6-4-9s1.5-6.5 4-9z"/>',
  terreno: '<path d="M4 20l6-14 4 8 3-5 3 11"/>',
  mapa: '<path d="M4 4h16v14H8l-4 4V4z"/>'
};

function esc(str){
  const div = document.createElement('div');
  div.textContent = str == null ? '' : String(str);
  return div.innerHTML;
}

function loadInlineContent(){
  const el = document.getElementById('content-data');
  if(!el) return null;
  try{
    return JSON.parse(el.textContent);
  }catch(e){
    console.error('La copia de respaldo embebida en index.html no es JSON válido:', e);
    return null;
  }
}

async function loadContent(){
  // Si el archivo se abrió directamente (doble clic, protocolo file://), los
  // navegadores bloquean fetch() por seguridad: usamos de una vez la copia
  // de respaldo embebida en index.html, sin intentar la red.
  if(location.protocol === 'file:'){
    const inline = loadInlineContent();
    if(inline) return inline;
    throw new Error('No se pudo cargar el contenido ni la copia de respaldo.');
  }

  // En un servidor real (GitHub Pages, servidor local, etc.) siempre se
  // intenta primero content.json en vivo, para que tus ediciones ahí se vean.
  try{
    const res = await fetch('content.json', { cache: 'no-store' });
    if(!res.ok) throw new Error('No se pudo cargar content.json');
    return await res.json();
  }catch(err){
    const inline = loadInlineContent();
    if(inline) return inline;
    throw err;
  }
}

function renderPerfil(data){
  const p = data.perfil;
  document.title = `${p.nombre} ${p.apellidos} — ${p.rol}`;

  document.querySelectorAll('.js-photo').forEach(img=>{
    img.src = p.foto;
  });
  document.getElementById('sideName').innerHTML = esc(p.nombre) + '<br>' + esc(p.apellidos);
  document.getElementById('sideRole').textContent = p.rol;

  document.getElementById('emailLink').href = 'mailto:' + p.email;
  document.getElementById('telLink').href = 'tel:' + p.telefono_link;
  document.getElementById('telLink').title = p.telefono_display;
  document.getElementById('linkedinLink').href = p.linkedin;

  const footerName = document.getElementById('footerName');
  if(footerName) footerName.textContent = `${p.nombre} ${p.apellidos}`;
}

function renderAcerca(data){
  const a = data.acerca;
  document.getElementById('acercaLead').textContent = a.lead;

  const badges = document.getElementById('acercaBadges');
  badges.innerHTML = a.badges.map(b => `<span class="badge">${esc(b)}</span>`).join('');

  const quick = document.getElementById('quickCard');
  quick.innerHTML = '<dl>' + a.datos_rapidos.map(d =>
    `<dt>${esc(d.etiqueta)}</dt><dd>${esc(d.valor)}</dd>`
  ).join('') + '</dl>';

  const langs = document.getElementById('langBlock');
  langs.innerHTML = a.idiomas.map(l => {
    const bars = [1,2,3,4].map(i => `<span class="${i <= l.nivel ? 'on' : ''}"></span>`).join('');
    return `<div class="lang-row"><span class="lang-name">${esc(l.nombre)}</span><span class="signal">${bars}</span><span class="lang-level">${esc(l.etiqueta)}</span></div>`;
  }).join('');
}

function renderEducacion(data){
  const cont = document.getElementById('eduContainer');
  cont.innerHTML = data.educacion.map(e => `
    <div class="edu-card">
      <div class="edu-top">
        <div>
          <div class="edu-degree">${esc(e.titulo)}</div>
          <div class="edu-school">${esc(e.escuela)}</div>
        </div>
        <div class="edu-meta">
          <div class="edu-years">${esc(e.periodo)}</div>
          ${e.verificar_url ? `<a class="verify-btn" href="${esc(e.verificar_url)}" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
            Verificar
          </a>` : ''}
        </div>
      </div>
      <p>${esc(e.descripcion)}</p>
      ${e.cedula ? `<div class="cedula">${esc(e.cedula)}</div>` : ''}
    </div>
  `).join('');
}

function renderExperiencia(data){
  const timeline = document.getElementById('timeline');
  const stations = data.experiencia.slice().sort((a, b) => {
    if(a.inicio !== b.inicio) return b.inicio.localeCompare(a.inicio); // más reciente primero
    return (b.fin || '').localeCompare(a.fin || '');
  });

  timeline.innerHTML = stations.map((e, i) => {
    const num = String(stations.length - i).padStart(2, '0');
    return `
    <div class="station">
      <div class="station-code">EST-${num} · ${esc(e.etiqueta_fecha)}</div>
      <div class="station-head"><div class="station-role">${esc(e.puesto)}</div><div class="station-org">${esc(e.organizacion)}</div></div>
      <ul>${e.bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul>
    </div>`;
  }).join('');
}

function renderHabilidades(data){
  const h = data.habilidades;
  const grid = document.getElementById('skillsGrid');
  grid.innerHTML = h.duras.map(card => `
    <div class="skill-card">
      <div class="skill-card-head">
        <div class="skill-icon"><svg viewBox="0 0 24 24">${ICONS[card.icono] || ICONS.grid}</svg></div>
        <h3>${esc(card.titulo)}</h3>
      </div>
      <ul>${card.items.map(i => `<li>${esc(i)}</li>`).join('')}</ul>
    </div>
  `).join('');

  const soft = document.getElementById('softGrid');
  soft.innerHTML = h.blandas.map(s => `
    <div class="soft-card"><strong>${esc(s.titulo)}</strong><span>${esc(s.descripcion)}</span></div>
  `).join('');
}

function renderCertificados(data){
  const c = data.certificados;
  const grid = document.getElementById('certGrid');
  const mid = Math.ceil(c.lista.length / 2);
  const cols = [c.lista.slice(0, mid), c.lista.slice(mid)];
  grid.innerHTML = cols.map(col =>
    '<div>' + col.map(item =>
      `<div class="cert-row"><span>${esc(item.nombre)}</span><span class="cert-meta">${esc(item.meta)}</span></div>`
    ).join('') + '</div>'
  ).join('');

  const award = document.getElementById('awardBox');
  if(c.premio){
    award.innerHTML = `<span class="tag">${esc(c.premio.etiqueta)}</span><p>${esc(c.premio.texto)}</p>`;
  }
}

function renderPortafolio(data){
  const grid = document.getElementById('projGrid');
  grid.innerHTML = data.portafolio.map(proj => `
    <div class="proj-card">
      <span class="proj-tag">${esc(proj.etiqueta)}</span>
      <h3>${esc(proj.titulo)}</h3>
      <p>${esc(proj.descripcion)}</p>
      <div class="proj-metrics">${proj.metricas.map(m => `<span>${esc(m)}</span>`).join('')}</div>
    </div>
  `).join('');
}

async function renderAll(){
  try{
    const data = await loadContent();
    renderPerfil(data);
    renderAcerca(data);
    renderEducacion(data);
    renderExperiencia(data);
    renderHabilidades(data);
    renderCertificados(data);
    renderPortafolio(data);
    document.dispatchEvent(new CustomEvent('content-ready'));
  }catch(err){
    console.error('Error cargando el contenido:', err);
    document.getElementById('acercaLead').textContent =
      'No se pudo cargar el contenido. Revisa que content.json exista y tenga un formato válido, ' +
      'o usa un servidor local para probar cambios recientes (ver README).';
  }
}

renderAll();
