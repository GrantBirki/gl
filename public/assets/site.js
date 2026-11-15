import { enhanceGalleries } from './gallery.mjs';

const header = document.getElementById('header');
const menu = document.querySelector('[data-aw-toggle-menu]');
const nav = header?.querySelector('nav');
function setMenu(open) {
  menu?.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('overflow-hidden', open);
  header?.classList.toggle('h-screen', open); header?.classList.toggle('expanded', open); header?.classList.toggle('bg-page', open);
  nav?.classList.toggle('hidden', !open);
}
if (nav && menu) {
  nav.id = 'main-navigation'; menu.setAttribute('aria-controls', nav.id); menu.setAttribute('aria-expanded', 'false');
  menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (event) => { if (event.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { setMenu(false); menu.focus(); } });
  matchMedia('(min-width: 768px)').addEventListener('change', () => setMenu(false));
}
const scroll = () => header?.classList.toggle('scroll', scrollY > 60);
addEventListener('scroll', scroll, { passive: true }); scroll();
addEventListener('pageshow', () => { setMenu(false); document.documentElement.classList.add('motion-safe:scroll-smooth'); });

for (const button of document.querySelectorAll('[data-aw-social-share]')) {
  button.addEventListener('click', () => {
    const url = encodeURIComponent(button.dataset.awUrl), text = encodeURIComponent(button.dataset.awText);
    const links = { facebook: `https://www.facebook.com/sharer.php?u=${url}`, twitter: `https://twitter.com/intent/tweet?url=${url}&text=${text}`, linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${text}`, whatsapp: `https://wa.me/?text=${text}%20${url}`, mail: `mailto:?subject=${text}&body=${text}%20${url}` };
    const href = links[button.dataset.awSocialShare]; if (href) window.open(href, '_blank', 'noopener,noreferrer');
  });
}
enhanceGalleries(document);
for (const globe of document.querySelectorAll('[data-globe]')) {
  import('./globe.mjs').then(({ createGlobe }) => createGlobe(globe)).catch((error) => {
    globe.classList.add('globe-fallback'); console.warn('The globe is using its map fallback.', error);
  });
}
for (const canvas of document.querySelectorAll('[data-confetti]')) import('./confetti.mjs').then(({ celebrate }) => celebrate(canvas));
