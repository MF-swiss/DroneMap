export const zoneColors: Record<string, string> = {
  controlled: "#0066ff",   // CTR
  nofly: "#ff0000",         // NFZ
  danger: "#ff9900",        // Danger Area
  restricted: "#cc00ff",    // Restricted Area
  unknown: "#999999"
};

export function getZoneColor(type: string) {
  const key = type.toLowerCase();
  return zoneColors[key] || zoneColors.unknown;
}
