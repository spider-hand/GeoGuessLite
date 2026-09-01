export const calculateCenter = (
  pos1: [number, number],
  pos2: [number, number],
): [number, number] => {
  const centerLng = (pos1[0] + pos2[0]) / 2
  const centerLat = (pos1[1] + pos2[1]) / 2
  return [centerLng, centerLat]
}

export const calculateZoomLevel = (distance: number): number => {
  let zoom = 10
  if (distance < 1) {
    zoom = 15
  } else if (distance < 10) {
    zoom = 12
  } else if (distance < 50) {
    zoom = 9
  } else if (distance < 200) {
    zoom = 7
  } else if (distance < 1000) {
    zoom = 5
  } else if (distance < 5000) {
    zoom = 2
  } else {
    zoom = 1
  }
  return zoom
}

export const formatNumber = (value: number, locale: string) =>
  new Intl.NumberFormat(locale).format(value)

export const formatDistanceKm = (distanceKm: number | null, locale: string) =>
  distanceKm === null
    ? null
    : new Intl.NumberFormat(locale, {
        maximumFractionDigits: 1,
        style: 'unit',
        unit: 'kilometer',
        unitDisplay: 'short',
      }).format(distanceKm)

export const countryFlagSrc = (country: string) =>
  `https://flagcdn.com/24x18/${country.toLowerCase()}.png`
