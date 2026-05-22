export const zoneColors: Record<string, string> = {
  controlled: "#0066ff",
  nofly: "#ff0000",
  danger: "#ff9900",
  restricted: "#cc00ff",
  unknown: "#999999",
};

export function getZoneColor(type: string) {
  return zoneColors[type?.toLowerCase()] || zoneColors.unknown;
}
