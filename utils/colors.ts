export function getZoneColor(type: string) {
  switch (type) {
    case "restricted": return "#ff0000";
    case "warning": return "#ff9900";
    case "info": return "#0066ff";
    default: return "#888888";
  }
}
