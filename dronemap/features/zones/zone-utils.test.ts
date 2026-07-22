import { describe, expect, it } from "vitest";

import type { DroneZone, Position } from "./types";
import {
  getZonesAtPoint,
  isPointInPolygon,
  isPointInZone,
} from "./zone-utils";

const square: Position[][] = [
  [
    [7, 46],
    [8, 46],
    [8, 47],
    [7, 47],
    [7, 46],
  ],
];

const testZone: DroneZone = {
  id: "test-zone",
  title: "Testzone",
  restrictionType: "restricted",
  source: "Test",
  updatedAt: "2026-07-22T12:00:00.000Z",
  geometry: {
    type: "Polygon",
    coordinates: square,
  },
};

describe("isPointInPolygon", () => {
  it("erkennt einen Punkt innerhalb eines Polygons", () => {
    expect(isPointInPolygon([7.5, 46.5], square)).toBe(true);
  });

  it("erkennt einen Punkt außerhalb eines Polygons", () => {
    expect(isPointInPolygon([8.5, 46.5], square)).toBe(false);
  });
});

describe("isPointInZone", () => {
  it("prüft Punkte gegen eine Zone", () => {
    expect(isPointInZone([7.2, 46.2], testZone)).toBe(true);
    expect(isPointInZone([9, 46.2], testZone)).toBe(false);
  });
});

describe("getZonesAtPoint", () => {
  it("liefert alle Zonen am Punkt", () => {
    expect(getZonesAtPoint([7.5, 46.5], [testZone])).toEqual([testZone]);
  });

  it("liefert ein leeres Array außerhalb aller Zonen", () => {
    expect(getZonesAtPoint([9, 46.5], [testZone])).toEqual([]);
  });
});
