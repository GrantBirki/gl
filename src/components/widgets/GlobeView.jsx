import Globe from 'react-globe.gl';
import map from '../../config/components/map.json';

export default function GlobeView() {
  return (
    <Globe
      globeImageUrl={'/assets/globe.jpg'}
      pointsData={map}
      labelsData={map}
      labelLat="lat"
      labelLng="lon"
      labelDotOrientation={() => 'bottom'}
      labelText="name"
      labelColor={() => 'rgba(255, 165, 0, 0.75)'}
      labelResolution={2}
      labelSize={1}
      labelDotRadius={1}
    />
  );
}
