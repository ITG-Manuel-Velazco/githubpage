/**
 * render.js
 * ------------------------------------------------------------------
 * Lee content.json (o su respaldo embebido) y construye cada sección
 * de la página. Para cambiar textos, fechas, foto, experiencia,
 * educación, etc. edita únicamente content.json — este archivo no
 * debería necesitar cambios salvo que agregues una sección nueva.
 * ------------------------------------------------------------------
 */

'use strict';

/** Iconos de línea (stroke) usados en las tarjetas de habilidades duras. */
const ICONS = Object.freeze({
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  globo: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 4 6 4 9s-1.5 6.5-4 9c-2.5-2.5-4-6-4-9s1.5-6.5 4-9z"/>',
  terreno: '<path d="M4 20l6-14 4 8 3-5 3 11"/>',
  mapa: '<path d="M4 4h16v14H8l-4 4V4z"/>'
});

/* ------------------------------------------------------------------ */
/* Utilidades                                                          */
/* ------------------------------------------------------------------ */

/** Escapa texto antes de insertarlo como HTML, para evitar inyección. */
function esc(value){
  const div = document.createElement('div');
  div.textContent = value == null ? '' : String(value);
  return div.innerHTML;
}

/**
 * Busca un elemento por id. Si no existe, avisa en consola en vez de
 * lanzar una excepción — así un id renombrado o faltante rompe solo
 * esa sección, no toda la página.
 */
function byId(id){
  const el = document.getElementById(id);
  if(!el) console.warn(`[render.js] No se encontró #${id} en el DOM; se omite esa parte.`);
  return el;
}

function setText(id, value){
  const el = byId(id);
  if(el) el.textContent = value ?? '';
}

function setHTML(id, html){
  const el = byId(id);
  if(el) el.innerHTML = html ?? '';
}

/** Anuncia el estado de carga a lectores de pantalla (WCAG 4.1.3). */
function announceStatus(message){
  const region = document.getElementById('statusRegion');
  if(region) region.textContent = message;
}

/* ------------------------------------------------------------------ */
/* Carga de datos                                                      */
/* ------------------------------------------------------------------ */

function loadInlineContent(){
  const el = document.getElementById('content-data');
  if(!el) return null;
  try{
    return JSON.parse(el.textContent);
  }catch(err){
    console.error('[render.js] La copia de respaldo embebida no es JSON válido:', err);
    return null;
  }
}

/**
 * Carga content.json desde la red y, si falla o no es posible (por
 * ejemplo al abrir el archivo con doble clic, protocolo file://),
 * recurre a la copia de respaldo embebida en index.html.
 */
async function loadContent(){
  if(location.protocol === 'file:'){
    const inline = loadInlineContent();
    if(inline) return inline;
    throw new Error('No se pudo cargar el contenido ni la copia de respaldo.');
  }

  try{
    const res = await fetch('content.json', { cache: 'no-store' });
    if(!res.ok) throw new Error(`content.json respondió ${res.status}`);
    return await res.json();
  }catch(err){
    console.warn('[render.js] No se pudo leer content.json en vivo, usando respaldo embebido:', err);
    const inline = loadInlineContent();
    if(inline) return inline;
    throw err;
  }
}

/* ------------------------------------------------------------------ */
/* Secciones                                                           */
/* ------------------------------------------------------------------ */

function renderPerfil(data){
  const p = data.perfil;
  document.title = `${p.nombre} ${p.apellidos} — ${p.rol}`;

  document.querySelectorAll('.js-photo').forEach(img=>{
    img.src = p.foto;
    img.decoding = 'async';
  });

  setHTML('sideName', `${esc(p.nombre)}<br>${esc(p.apellidos)}`);
  setText('sideRole', p.rol);
  setText('footerName', `${p.nombre} ${p.apellidos}`);

  setText('footerEmailText', p.email);
  const emailBtn = byId('footerEmail');
  if(emailBtn){
    emailBtn.dataset.copy = p.email;
    emailBtn.setAttribute('aria-label', `Copiar correo electrónico: ${p.email}`);
  }

  setText('footerPhoneText', p.telefono_display);
  const phoneBtn = byId('footerPhone');
  if(phoneBtn){
    phoneBtn.dataset.copy = p.telefono_display;
    phoneBtn.dataset.wa = p.telefono_link;
    phoneBtn.setAttribute('aria-label', `Copiar teléfono y abrir WhatsApp: ${p.telefono_display}`);
  }
}

function renderAcerca(data){
  const a = data.acerca;
  setText('acercaLead', a.lead);

  setHTML('acercaBadges', a.badges.map(b => `<span class="badge">${esc(b)}</span>`).join(''));

  setHTML('quickCard', '<dl>' + a.datos_rapidos.map(d =>
    `<dt>${esc(d.etiqueta)}</dt><dd>${esc(d.valor)}</dd>`
  ).join('') + '</dl>');

  setHTML('langBlock', a.idiomas.map(l => {
    const bars = [1,2,3,4].map(i => `<span class="${i <= l.nivel ? 'on' : ''}"></span>`).join('');
    return `<div class="lang-row"><span class="lang-name">${esc(l.nombre)}</span>` +
      `<span class="signal" role="img" aria-label="Nivel ${l.nivel} de 4">${bars}</span>` +
      `<span class="lang-level">${esc(l.etiqueta)}</span></div>`;
  }).join(''));
}

function renderEducacion(data){
  setHTML('eduContainer', data.educacion.map(e => `
    <div class="edu-card">
      <div class="edu-top">
        <div>
          <div class="edu-degree">${esc(e.titulo)}</div>
          <div class="edu-school">${esc(e.escuela)}</div>
        </div>
        <div class="edu-meta">
          <div class="edu-years">${esc(e.periodo)}</div>
          ${e.verificar_url ? `<a class="verify-btn" href="${esc(e.verificar_url)}" target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>
            Verificar
            <span class="sr-only"> (abre en una pestaña nueva)</span>
          </a>` : ''}
        </div>
      </div>
      <p>${esc(e.descripcion)}</p>
      ${e.cedula ? `<div class="cedula">${esc(e.cedula)}</div>` : ''}
    </div>
  `).join(''));
}

function renderExperiencia(data){
  const timeline = byId('timeline');
  if(!timeline) return;

  // Se ordena siempre por fecha de inicio (más reciente primero),
  // sin importar el orden en que aparezcan en content.json.
  const stations = data.experiencia.slice().sort((a, b) => {
    if(a.inicio !== b.inicio) return b.inicio.localeCompare(a.inicio);
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

  setHTML('skillsGrid', h.duras.map(card => `
    <div class="skill-card">
      <div class="skill-card-head">
        <div class="skill-icon"><svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[card.icono] || ICONS.grid}</svg></div>
        <h3>${esc(card.titulo)}</h3>
      </div>
      <ul>${card.items.map(i => `<li>${esc(i)}</li>`).join('')}</ul>
    </div>
  `).join(''));

  setHTML('softGrid', h.blandas.map(s => `
    <div class="soft-card"><strong>${esc(s.titulo)}</strong><span>${esc(s.descripcion)}</span></div>
  `).join(''));
}

function renderCertificados(data){
  const c = data.certificados;
  const mid = Math.ceil(c.lista.length / 2);
  const cols = [c.lista.slice(0, mid), c.lista.slice(mid)];

  setHTML('certGrid', cols.map(col =>
    '<div>' + col.map(item =>
      `<div class="cert-row"><span>${esc(item.nombre)}</span><span class="cert-meta">${esc(item.meta)}</span></div>`
    ).join('') + '</div>'
  ).join(''));

  if(c.premio){
    setHTML('awardBox', `<span class="tag">${esc(c.premio.etiqueta)}</span><p>${esc(c.premio.texto)}</p>`);
  }
}

function renderPortafolio(data){
  setHTML('projGrid', data.portafolio.map(proj => `
    <div class="proj-card">
      <span class="proj-tag">${esc(proj.etiqueta)}</span>
      <h3>${esc(proj.titulo)}</h3>
      <p>${esc(proj.descripcion)}</p>
      <div class="proj-metrics">${proj.metricas.map(m => `<span>${esc(m)}</span>`).join('')}</div>
    </div>
  `).join(''));
}

/* ------------------------------------------------------------------ */
/* Orquestación: cada sección aislada — si una falla, no tumba al resto */
/* ------------------------------------------------------------------ */

const SECTIONS = [
  ['perfil', renderPerfil],
  ['acerca de mí', renderAcerca],
  ['educación', renderEducacion],
  ['experiencia', renderExperiencia],
  ['habilidades', renderHabilidades],
  ['certificados', renderCertificados],
  ['portafolio', renderPortafolio]
];

async function renderAll(){
  let data;
  try{
    data = await loadContent();
  }catch(err){
    console.error('[render.js] No se pudo obtener el contenido:', err);
    setText('acercaLead',
      'No se pudo cargar el contenido. Revisa que content.json exista y tenga un formato válido, ' +
      'o usa un servidor local para probar cambios recientes (ver README).');
    announceStatus('Hubo un problema al cargar el contenido de la página.');
    return;
  }

  let failures = 0;
  for(const [label, fn] of SECTIONS){
    try{
      fn(data);
    }catch(err){
      failures++;
      console.error(`[render.js] Falló la sección "${label}":`, err);
    }
  }

  announceStatus(failures === 0
    ? 'Contenido cargado.'
    : `Contenido cargado con ${failures} sección(es) incompleta(s); revisa la consola para más detalle.`);

  document.dispatchEvent(new CustomEvent('content-ready', { detail: { failures } }));
}

renderAll();
