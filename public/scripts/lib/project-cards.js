/** Curated portfolio presentation, shared by server cards and pagination. */
export const CARD_PROFILES = {
  'master-data-management-solutions': { name:'eptos™', reveal:'Master Data Management', rank:1, key:'eptos' },
  'search-engine': { name:'Search', reveal:'Engine', rank:2, key:'search' },
  'design-system': { name:'Proximity', reveal:'Design System', rank:3, key:'proximity' },
  'marketing-materials': { name:'Materials', reveal:'Marketing', rank:4, key:'materials' },
  'eroplay-ai': { name:'Play.ai', reveal:'AI Chat Platform', rank:5, key:'play' },
  'danube-strategy': { name:'Danube', reveal:'Strategy', rank:6, key:'danube' },
  'mcpk-team-extension': { name:'MCPK', reveal:'Team Extension', rank:7, key:'mcpk' },
  'it-recruitment-relocation': { name:'IT Rec.', reveal:'Recruitment & Relocation', rank:8, key:'it-rec' },
  'hartick-recruitment': { name:'Hartick', reveal:'Healthcare Recruitment', rank:9, key:'hartick' },
  'enigma-escape-games': { name:'ENIGMA', reveal:'Escape Games', rank:10, key:'enigma' },
};
export function orderProjectCards(rows) {
  return [...rows].sort((a,b)=>(CARD_PROFILES[a.slug]?.rank??999)-(CARD_PROFILES[b.slug]?.rank??999)||String(a.slug).localeCompare(String(b.slug)));
}
const escape = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function projectCardMarkup(project) {
  const profile=CARD_PROFILES[project.slug];
  const title=profile?.name||project.title;
  const reveal=profile?.reveal||project.category||'';
  const thumbnail=profile?`/images/project-cards/${profile.key}.svg?v=20261117-site2`:project.thumbnail;
  const label=profile?`${profile.name} — ${profile.reveal}`:project.title;
  const lang=project.lang==='uk'?'uk':'en';
  return `<a href="/${lang}/projects/${encodeURIComponent(project.slug)}" class="project-card project-card--editorial" aria-label="${escape(label)}" data-card-profile="${escape(profile?.key||'other')}">
    <span class="project-card__number" aria-hidden="true">${profile?String(profile.rank).padStart(2,'0'):'↗'}</span>
    <span class="project-card__arrow" aria-hidden="true">↗</span>
    ${thumbnail?`<img src="${escape(thumbnail)}" alt="" class="project-card__art" loading="lazy" decoding="async" width="600" height="380" />`:''}
    <span class="project-card__caption" aria-hidden="true"><span class="project-card__reveal">${escape(reveal)}</span><span class="project-card__name">${escape(title)}</span></span>
  </a>`;
}
