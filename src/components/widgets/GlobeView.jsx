import Globe from 'react-globe.gl';
import { SizeMe } from 'react-sizeme';

export default function GlobeView(props) {
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

  // check if the display is a mobile device and set the height accordingly
  const isMobile = window.innerWidth <= 800;
  const height = isMobile ? 500 : 700;

  return (
    <SizeMe>
      {({ size }) => (
        <Globe
          width={size.width}
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
      )}
    </SizeMe>
  );
}
