import type { DroneZone } from "@/features/zones/types";

/**
 * Ausschließlich Demodaten für die Entwicklung.
 *
 * Diese Polygone stellen KEINE offiziellen Schweizer Drohnenzonen dar.
 * Vor realen Flügen sind immer die aktuellen offiziellen Informationen
 * der zuständigen Schweizer Behörden zu prüfen.
 */
export const demoZones: DroneZone[] = [
  {
    id: "demo-bern-prohibited",
    title: "Beispiel: Sicherheitsbereich Bern",
    restrictionType: "prohibited",
    description:
      "Fiktive Demonstrationszone im Raum Bern. Keine reale Flugverbotszone.",
    source: "DroneMap-Demodaten",
    updatedAt: "2026-07-22T12:00:00.000Z",
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [7.415, 46.94],
          [7.445, 46.94],
          [7.445, 46.96],
          [7.415, 46.96],
          [7.415, 46.94],
        ],
      ],
    },
  },
  {
    id: "demo-zurich-restricted",
    title: "Beispiel: Eingeschränkter Bereich Zürich",
    restrictionType: "restricted",
    description:
      "Fiktive Demonstrationszone mit einer beispielhaften Höhenbeschränkung.",
    source: "DroneMap-Demodaten",
    maxAltitudeMeters: 50,
    updatedAt: "2026-07-22T12:00:00.000Z",
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [8.51, 47.36],
          [8.56, 47.36],
          [8.56, 47.39],
          [8.51, 47.39],
          [8.51, 47.36],
        ],
      ],
    },
  },
  {
    id: "demo-geneva-warning",
    title: "Beispiel: Warnbereich Genf",
    restrictionType: "warning",
    description:
      "Fiktive Demonstrationszone für einen Bereich mit besonderem Hinweis.",
    source: "DroneMap-Demodaten",
    updatedAt: "2026-07-22T12:00:00.000Z",
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [6.11, 46.19],
          [6.17, 46.19],
          [6.17, 46.225],
          [6.11, 46.225],
          [6.11, 46.19],
        ],
      ],
    },
  },
  {
    id: "demo-lugano-information",
    title: "Beispiel: Informationsbereich Lugano",
    restrictionType: "information",
    description:
      "Fiktive Informationszone zur Demonstration weiterer Kategorien.",
    source: "DroneMap-Demodaten",
    updatedAt: "2026-07-22T12:00:00.000Z",
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [8.93, 46.0],
          [8.99, 46.0],
          [8.99, 46.03],
          [8.93, 46.03],
          [8.93, 46.0],
        ],
      ],
    },
  },
];
