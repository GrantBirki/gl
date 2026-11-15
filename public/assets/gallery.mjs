// The same shortest-column layout as the old photo album, without React.
export function distribute(ratios, count, columnWidth, gap = 20) {
  const heights = Array(count).fill(0);
  return ratios.map((ratio) => {
    const column = heights.indexOf(Math.min(...heights));
    heights[column] += ratio * columnWidth + gap;
    return column;
  });
}

export function enhanceGalleries(document) {
  for (const gallery of document.querySelectorAll('[data-gallery]')) {
    const photos = [...gallery.querySelectorAll('img')];
    let previousWidth = -1;
    const layout = () => {
      const width = gallery.clientWidth;
      if (!width || width === previousWidth) return;
      previousWidth = width;
      const count = width < 400 ? 1 : width < 800 ? 2 : 3;
      const gap = width < 600 ? 10 : width < 1200 ? 15 : 20;
      gallery.style.setProperty('--gallery-gap', `${gap}px`);
      const columns = Array.from({ length: count }, () => {
        const column = document.createElement('div');
        column.className = 'photo-gallery-column';
        return column;
      });
      const assignments = distribute(photos.map((p) => Number(p.getAttribute('height')) / Number(p.getAttribute('width'))), count, (width - gap * (count - 1)) / count, gap);
      photos.forEach((photo, i) => columns[assignments[i]].append(photo));
      gallery.replaceChildren(...columns);
      gallery.dataset.enhanced = '';
    };
    layout();
    if ('ResizeObserver' in window) new ResizeObserver(layout).observe(gallery);
    else window.addEventListener('resize', layout, { passive: true });
  }
}
