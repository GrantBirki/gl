const RAD = Math.PI / 180;

export function pointFor(lat, lon, radius = 1) {
  const latitude = lat * RAD;
  const longitude = lon * RAD;
  return [radius * Math.cos(latitude) * Math.sin(longitude), radius * Math.sin(latitude), radius * Math.cos(latitude) * Math.cos(longitude)];
}

export function rotationMatrix(yaw, pitch) {
  const c = Math.cos(yaw), s = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
  return [c, sp * s, -cp * s, 0, cp, sp, s, -sp * c, cp * c];
}

export function rotate(point, matrix) {
  return [0, 1, 2].map((row) => point[0] * matrix[row] + point[1] * matrix[row + 3] + point[2] * matrix[row + 6]);
}

export function arcBetween(a, b, steps = 64) {
  const dot = Math.max(-1, Math.min(1, a.reduce((sum, v, i) => sum + v * b[i], 0)));
  const angle = Math.acos(dot);
  const perpendicular = Math.abs(a[0]) < 0.9 ? [0, a[2], -a[1]] : [-a[2], 0, a[0]];
  const length = Math.hypot(...perpendicular) || 1;
  return Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps;
    let point;
    if (dot < -0.9999) {
      point = a.map((v, j) => v * Math.cos(Math.PI * t) + perpendicular[j] / length * Math.sin(Math.PI * t));
    } else if (angle < 0.0001) {
      point = a;
    } else {
      point = a.map((v, j) => (v * Math.sin((1 - t) * angle) + b[j] * Math.sin(t * angle)) / Math.sin(angle));
    }
    const radius = 1 + 0.25 * Math.sin(Math.PI * t);
    return point.map((v) => v * radius);
  });
}
