import Globe from 'react-globe.gl';
import { SizeMe } from 'react-sizeme';
import map from '../../config/components/map.json';

export default function GlobeView() {
  // flying arcs
  const N = 12;
  const arcsData = [...Array(N).keys()].map(() => ({
    startLat: (Math.random() - 0.5) * 180,
    startLng: (Math.random() - 0.5) * 360,
    endLat: (Math.random() - 0.5) * 180,
    endLng: (Math.random() - 0.5) * 360,
    color: '#ffffff',
  }));

  return (
    <SizeMe>
      {({ size }) => (
        <Globe
          width={size.width}
          animateIn={false}
          globeImageUrl={'/assets/globe.jpg'}
          bumpImageUrl={'/assets/earth-topology.png'}
          pointsData={map}
          labelsData={map}
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
      )}
    </SizeMe>
  );
}
