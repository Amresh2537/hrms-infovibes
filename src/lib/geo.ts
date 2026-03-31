const EARTH_RADIUS_METERS = 6371000;

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

export function haversineDistanceInMeters(
  originLat: number,
  originLng: number,
  destinationLat: number,
  destinationLng: number,
) {
  const latitudeDelta = toRadians(destinationLat - originLat);
  const longitudeDelta = toRadians(destinationLng - originLng);
  const lat1 = toRadians(originLat);
  const lat2 = toRadians(destinationLat);

  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(longitudeDelta / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_METERS * c;
}

export function isWithinWorkRadius(distance: number, radius: number) {
  return distance <= radius;
}