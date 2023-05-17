import Globe from 'react-globe.gl';
import map from '../../config/components/map.json';

export default function GlobeView() {
  return (
    <Globe
      pointsData={map}
      pointLat="lat"
      pointLng="lon"
      pointRadius={0.12}
      labelsData={map}
      labelLat="lat"
      labelLng="lon"
      labelDotRadius={0.12}
      labelDotOrientation={() => 'bottom'}
      labelText="name"
      labelSize={0.15}
      labelResolution={1}
    />
  );
}
