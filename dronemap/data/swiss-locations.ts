export interface SwissLocation {
  name: string;
  canton: string;
  latitude: number;
  longitude: number;
  zoom: number;
}

export const swissLocations: SwissLocation[] = [
  {
    name: "Zürich",
    canton: "ZH",
    latitude: 47.3769,
    longitude: 8.5417,
    zoom: 13,
  },
  {
    name: "Bern",
    canton: "BE",
    latitude: 46.948,
    longitude: 7.4474,
    zoom: 13,
  },
  {
    name: "Genf",
    canton: "GE",
    latitude: 46.2044,
    longitude: 6.1432,
    zoom: 13,
  },
  {
    name: "Lausanne",
    canton: "VD",
    latitude: 46.5197,
    longitude: 6.6323,
    zoom: 13,
  },
  {
    name: "Basel",
    canton: "BS",
    latitude: 47.5596,
    longitude: 7.5886,
    zoom: 13,
  },
  {
    name: "Lugano",
    canton: "TI",
    latitude: 46.0037,
    longitude: 8.9511,
    zoom: 13,
  },
  {
    name: "Luzern",
    canton: "LU",
    latitude: 47.0502,
    longitude: 8.3093,
    zoom: 13,
  },
  {
    name: "St. Gallen",
    canton: "SG",
    latitude: 47.4245,
    longitude: 9.3767,
    zoom: 13,
  },
  {
    name: "Chur",
    canton: "GR",
    latitude: 46.8508,
    longitude: 9.532,
    zoom: 13,
  },
  {
    name: "Interlaken",
    canton: "BE",
    latitude: 46.6863,
    longitude: 7.8632,
    zoom: 13,
  },
];
