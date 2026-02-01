import { useEffect, useRef, useState } from 'react';
import Globe from 'react-globe.gl';

export default function GlobeView(props) {
  const containerRef = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [height, setHeight] = useState(() => {
    if (typeof window === 'undefined') return 700;
    return window.innerWidth <= 800 ? 500 : 700;
  });

  useEffect(() => {
    const updateHeight = () => {
      setHeight(window.innerWidth <= 800 ? 500 : 700);
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;

    if (typeof ResizeObserver === 'undefined') {
      const measure = () => {
        const rect = el.getBoundingClientRect();
        setSize({ width: rect.width, height: rect.height });
      };

      measure();
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height: measuredHeight } = entry.contentRect;
      setSize({ width, height: measuredHeight });
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  var arcsData = [];
  if (props?.arcs?.enabled === true) {
    // flying arcs
    const N = props?.arcs?.count || 12;
    arcsData = [...Array(N).keys()].map(() => ({
      startLat: (Math.random() - 0.5) * 180,
      startLng: (Math.random() - 0.5) * 360,
      endLat: (Math.random() - 0.5) * 180,
      endLng: (Math.random() - 0.5) * 360,
      color: '#ffffff',
    }));
  }

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      <Globe
        width={size.width || 1}
        height={height}
        animateIn={false}
        globeImageUrl={'/assets/globe.jpg'}
        bumpImageUrl={'/assets/earth-topology.png'}
        pointsData={props.labels}
        labelsData={props.labels}
        labelLat="lat"
        labelLng="lon"
        labelDotOrientation={() => 'bottom'}
        labelText="name"
        labelColor={() => 'rgba(255, 165, 0, 0.75)'}
        labelResolution={3}
        labelSize={1}
        labelDotRadius={1}
        arcsData={arcsData} // flying arcs
        arcColor={'color'} // flying arcs
        arcDashLength={() => Math.random()} // flying arcs
        arcDashGap={1} // flying arcs
        arcDashAnimateTime={() => Math.random() * 4000 + 2000} // flying arcs
      />
    </div>
  );
}
