export interface ParishMapPoint {
  name: string;
  diocese: string;
  latitude?: number;
  longitude?: number;
}

export function parishDirectionsUrl(point: ParishMapPoint) {
  if (typeof point.latitude === 'number' && typeof point.longitude === 'number') {
    return `https://www.google.com/maps/search/?api=1&query=${point.latitude},${point.longitude}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${point.name}, ${point.diocese}`)}`;
}

export function isGeocoded(point: ParishMapPoint) {
  return Number.isFinite(point.latitude) && Number.isFinite(point.longitude);
}
