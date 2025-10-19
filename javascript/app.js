const $ = (s, c=document) => c.querySelector(s);

async function fetchJson(path){
    const r = await fetch(path, { cache: 'no-store' });
    if(!r.ok) throw new Error('Failed to load ' + path);
    return r.json();
}

async function loadData(){
    return await fetchJson('resume/data.json')
        .catch(() => ({ education: [], skills: [], experience: [] }));
}

function initYear(){
    const y = $('#year');
    if (y) y.textContent = new Date().getFullYear();
}

/* Renderers */
function renderAbout(d){
    if(!d) return;
    $('#about-title').textContent = d.name || 'Marc-Andre Beaudry';
    $('#headline').textContent = d.headline || 'Software Engineer';
    if(d.about) $('#about-summary').textContent = d.about;
    const loc = $('#location'); if(d.location && loc) loc.textContent = d.location;

    const ul = $('#about-links');
    if (ul && Array.isArray(d.links)){
        ul.innerHTML = d.links
            .map(x => `<li><a href="${x.url}" target="_blank" rel="noopener">${x.type}</a></li>`)
            .join('');
    }

    // JSON-LD
    const emailFromLinks = (Array.isArray(d.links) ? d.links : [])
        .map(x => x.url)
        .find(u => typeof u === 'string' && u.startsWith('mailto:')) || 'mailto:marcandre.beaudry2@gmail.com';
    const schema = {
        "@context": "https://schema.org",
        "@type": "Person",
        name: d.name || "Marc-Andre Beaudry",
        jobTitle: d.headline || "Software Engineer",
        email: emailFromLinks,
        url: "https://marc-andre-beaudry.com/",
        address: { "@type": "PostalAddress", "addressLocality": d.location || "Saint-Jean-Baptiste, QC, Canada", "addressCountry": "CA" }
    };
    const schemaEl = $('#schema-person');
    if (schemaEl) schemaEl.textContent = JSON.stringify(schema);
}

function mountEducation(list){
    $('#education-list').innerHTML = (list||[]).map(e => `
    <article class="card">
      <h3>${e.school||''}</h3>
      <p><strong>${e.program||''}</strong></p>
      <p>${e.period||''}</p>
      ${e.notes ? `<p>${e.notes}</p>` : ''}
    </article>
  `).join('');
}

function mountSkills(groups){
    $('#skills-list').innerHTML = (groups||[]).map(g => `
    <section class="card">
      <h3>${g.group||'Skills'}</h3>
      <p>${(g.items||[]).join(', ')}</p>
    </section>
  `).join('');
}

function mountExperience(items){
    $('#experience-list').innerHTML = (items||[]).map(x => `
    <article class="item">
      <h3>${x.company||''} — ${x.title||''}</h3>
      <p><em>${x.period||''}</em></p>
      ${x.summary ? `<p>${x.summary}</p>` : ''}
    </article>
  `).join('');
}

/* Boot */
loadData().then(d => {
    renderAbout(d);
    mountEducation(d.education);
    mountSkills(d.skills);
    mountExperience(d.experience);
    initYear();
});
