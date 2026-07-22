"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type * as Leaflet from "leaflet";
import ZoneFilters from "@/components/ZoneFilters";


import { swissLocations } from "@/data/swiss-locations";
import type {
    DroneZone,
    Position,
    RestrictionType,
} from "@/features/zones/types";

import {
    getRestrictionLabel,
    getZoneStyle,
    getZonesAtPoint,
} from "@/features/zones/zone-utils";

const SWITZERLAND_CENTER: [number, number] = [46.8182, 8.2275];
const INITIAL_ZOOM = 8;

interface ZonesApiResponse {
    zones: DroneZone[];
    meta: {
        count: number;
        country: string;
        generatedAt: string;
        disclaimer: string;
    };
}

/**
 * Wandelt GeoJSON-Koordinaten von [Längengrad, Breitengrad]
 * in Leaflet-Koordinaten [Breitengrad, Längengrad] um.
 */
function toLeafletPosition([longitude, latitude]: Position): [number, number] {
    return [latitude, longitude];
}

/**
 * Bereitet die Geometrie einer Zone für Leaflet-Polygone auf.
 * Bei MultiPolygon wird für den aktuellen Stand das erste Polygon verwendet.
 */
function getPolygonCoordinates(zone: DroneZone): [number, number][][] {
    if (zone.geometry.type === "Polygon") {
        return zone.geometry.coordinates.map((ring) =>
            ring.map(toLeafletPosition),
        );
    }

    return zone.geometry.coordinates[0].map((ring) =>
        ring.map(toLeafletPosition),
    );
}

/**
 * Liest Eingaben im Format:
 * - 46.948, 7.447
 * - 46.948; 7.447
 * - 46,948, 7,447
 */
function tryParseCoordinates(
    value: string,
): { latitude: number; longitude: number } | null {
    const normalizedValue = value.trim().replace(";", ",");

    const match = normalizedValue.match(
        /^(-?\d+(?:[.,]\d+)?)\s*,\s*(-?\d+(?:[.,]\d+)?)$/,
    );

    if (!match) {
        return null;
    }

    const latitude = Number(match[1].replace(",", "."));
    const longitude = Number(match[2].replace(",", "."));

    if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude) ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
    ) {
        return null;
    }

    return { latitude, longitude };
}

export default function DroneMapClient() {
    const mapElementRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<Leaflet.Map | null>(null);
    const leafletRef = useRef<typeof Leaflet | null>(null);

    const zonesLayerRef = useRef<Leaflet.LayerGroup | null>(null);
    const userMarkerRef = useRef<Leaflet.CircleMarker | null>(null);
    const checkedPointMarkerRef = useRef<Leaflet.CircleMarker | null>(null);
    const zonesRef = useRef<DroneZone[]>([]);

    const [zones, setZones] = useState<DroneZone[]>([]);
    const [selectedZone, setSelectedZone] = useState<DroneZone | null>(null);
    const [checkedZones, setCheckedZones] = useState<DroneZone[] | null>(null);

    const [activeFilters, setActiveFilters] = useState<Set<RestrictionType>>(
        new Set(["prohibited", "restricted", "warning", "information"]),
    );


    const [mapReady, setMapReady] = useState(false);
    const [mapStatus, setMapStatus] = useState("Karte wird geladen …");

    const [locationStatus, setLocationStatus] = useState<string | null>(null);
    const [isLocating, setIsLocating] = useState(false);

    const [searchValue, setSearchValue] = useState("");
    const [searchStatus, setSearchStatus] = useState<string | null>(null);


    const visibleZones = zones.filter((zone) =>
        activeFilters.has(zone.restrictionType),
    );

    /**
     * Speichert stets die aktuellen Zonen in einer Ref.
     * Der Karten-Klick-Handler kann damit auch nachträglich geladene
     * API-Daten korrekt prüfen.
     */
    useEffect(() => {
        zonesRef.current = zones;
    }, [zones]);

    /**
     * Erstellt die Leaflet-Karte nur im Browser.
     */
    useEffect(() => {
        let isUnmounted = false;

        async function initializeMap() {
            if (!mapElementRef.current || mapRef.current) {
                return;
            }

            const L = await import("leaflet");

            if (isUnmounted || !mapElementRef.current) {
                return;
            }

            leafletRef.current = L;

            const map = L.map(mapElementRef.current, {
                center: SWITZERLAND_CENTER,
                zoom: INITIAL_ZOOM,
                zoomControl: false,
            });

            L.control.zoom({
                position: "bottomright",
            }).addTo(map);

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                maxZoom: 19,
                attribution:
                    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>-Mitwirkende',
            }).addTo(map);

            /**
             * Ein Klick auf die Karte prüft, ob der Punkt in einer aktuell
             * geladenen Demo-Zone liegt.
             */
            map.on("click", (event) => {
                const point: Position = [event.latlng.lng, event.latlng.lat];
                const zonesAtPoint = getZonesAtPoint(point, zonesRef.current);

                checkedPointMarkerRef.current?.remove();

                checkedPointMarkerRef.current = L.circleMarker(
                    [event.latlng.lat, event.latlng.lng],
                    {
                        radius: 8,
                        color: "#ffffff",
                        weight: 2,
                        fillColor: zonesAtPoint.length > 0 ? "#ef4444" : "#22c55e",
                        fillOpacity: 1,
                    },
                )
                    .bindPopup(
                        zonesAtPoint.length > 0
                            ? `${zonesAtPoint.length} Demo-Zone(n) an diesem Punkt gefunden.`
                            : "Keine geladene Demo-Zone an diesem Punkt gefunden.",
                    )
                    .addTo(map)
                    .openPopup();

                setCheckedZones(zonesAtPoint);
            });

            mapRef.current = map;
            setMapReady(true);

            /**
             * Leaflet muss nach dem Rendern die finale Containergröße berechnen.
             * Andernfalls können Kartenkacheln nur in einem kleinen Bereich erscheinen.
             */
            requestAnimationFrame(() => {
                map.invalidateSize();
                map.setView(SWITZERLAND_CENTER, INITIAL_ZOOM);
            });

            window.setTimeout(() => {
                map.invalidateSize();
            }, 250);
        }

        void initializeMap();

        const resizeObserver = new ResizeObserver(() => {
            mapRef.current?.invalidateSize();
        });

        if (mapElementRef.current) {
            resizeObserver.observe(mapElementRef.current);
        }

        return () => {
            isUnmounted = true;
            resizeObserver.disconnect();

            userMarkerRef.current?.remove();
            checkedPointMarkerRef.current?.remove();
            zonesLayerRef.current?.remove();
            mapRef.current?.remove();

            userMarkerRef.current = null;
            checkedPointMarkerRef.current = null;
            zonesLayerRef.current = null;
            mapRef.current = null;
            leafletRef.current = null;
        };
    }, []);

    /**
     * Lädt die Zonen vom lokalen Next.js-API-Endpunkt.
     */
    useEffect(() => {
        let isUnmounted = false;

        async function loadZones() {
            try {
                const response = await fetch("/api/zones");

                if (!response.ok) {
                    throw new Error("Zonen konnten nicht geladen werden.");
                }

                const data = (await response.json()) as ZonesApiResponse;

                if (!isUnmounted) {
                    setZones(data.zones);
                    setMapStatus(
                        `${data.meta.count} Schweizer Beispielzonen wurden geladen.`,
                    );
                }
            } catch {
                if (!isUnmounted) {
                    setMapStatus(
                        "Zonen konnten nicht geladen werden. Bitte lade die Seite erneut.",
                    );
                }
            }
        }

        void loadZones();

        return () => {
            isUnmounted = true;
        };
    }, []);

    /**
     * Zeichnet alle vom API-Endpunkt gelieferten Zonen auf die Leaflet-Karte.
     */
    useEffect(() => {
        const map = mapRef.current;
        const L = leafletRef.current;

        if (!mapReady || !map || !L) {
            return;
        }

        zonesLayerRef.current?.remove();

        const zonesLayer = L.layerGroup().addTo(map);

        visibleZones.forEach((zone) => {

            const style = getZoneStyle(zone.restrictionType);

            const polygon = L.polygon(getPolygonCoordinates(zone), {
                color: style.color,
                fillColor: style.fillColor,
                fillOpacity:
                    selectedZone?.id === zone.id
                        ? Math.min(style.fillOpacity + 0.2, 0.7)
                        : style.fillOpacity,
                weight: style.weight,
            });

            polygon.bindPopup(
                `
          <strong>${zone.title}</strong><br />
          ${getRestrictionLabel(zone.restrictionType)}<br />
          <small>Quelle: ${zone.source}</small>
        `,
            );

            polygon.on("click", () => {
                setSelectedZone(zone);
            });

            polygon.addTo(zonesLayer);
        });

        zonesLayerRef.current = zonesLayer;

        return () => {
            zonesLayer.remove();
        };
    }, [mapReady, selectedZone?.id, visibleZones]);

    const toggleZoneFilter = useCallback(
        (restrictionType: RestrictionType) => {
            setActiveFilters((currentFilters) => {
                const nextFilters = new Set(currentFilters);

                if (nextFilters.has(restrictionType)) {
                    nextFilters.delete(restrictionType);
                } else {
                    nextFilters.add(restrictionType);
                }

                return nextFilters;
            });
        },
        [],
    );


    /**
     * Setzt die Schweizer Gesamtansicht zurück.
     */
    const resetMapView = useCallback(() => {
        mapRef.current?.flyTo(SWITZERLAND_CENTER, INITIAL_ZOOM);

        setSelectedZone(null);
        setLocationStatus(null);
        setSearchStatus(null);

        checkedPointMarkerRef.current?.remove();
        checkedPointMarkerRef.current = null;
        setCheckedZones(null);
    }, []);

    /**
     * Zoomt auf die ausgewählte Zone.
     */
    const focusZone = useCallback((zone: DroneZone) => {
        const map = mapRef.current;
        const L = leafletRef.current;

        setSelectedZone(zone);

        if (!map || !L) {
            return;
        }

        const zoneLayer = L.geoJSON(zone.geometry as never);
        const bounds = zoneLayer.getBounds();

        if (bounds.isValid()) {
            map.fitBounds(bounds, {
                padding: [50, 50],
                maxZoom: 14,
            });
        }
    }, []);

    /**
     * Sucht Schweizer Orte aus der lokalen Liste oder springt
     * zu eingegebenen Koordinaten.
     */
    const searchLocation = useCallback(() => {
        const map = mapRef.current;
        const searchTerm = searchValue.trim();

        if (!map) {
            setSearchStatus("Die Karte ist noch nicht bereit.");
            return;
        }

        if (!searchTerm) {
            setSearchStatus("Gib einen Schweizer Ort oder Koordinaten ein.");
            return;
        }

        const coordinates = tryParseCoordinates(searchTerm);

        if (coordinates) {
            map.flyTo([coordinates.latitude, coordinates.longitude], 14);

            setSearchStatus(
                `Koordinaten geöffnet: ${coordinates.latitude.toFixed(
                    5,
                )}, ${coordinates.longitude.toFixed(5)}`,
            );

            return;
        }

        const normalizedSearchTerm = searchTerm.toLocaleLowerCase("de-CH");

        const location = swissLocations.find((swissLocation) => {
            const locationName = swissLocation.name.toLocaleLowerCase("de-CH");
            const canton = swissLocation.canton.toLocaleLowerCase("de-CH");

            return (
                locationName === normalizedSearchTerm ||
                `${locationName} ${canton}` === normalizedSearchTerm ||
                `${locationName}, ${canton}` === normalizedSearchTerm
            );
        });

        if (!location) {
            setSearchStatus(
                "Ort nicht gefunden. Versuche z. B. Zürich, Bern, Genf oder 46.948, 7.447.",
            );
            return;
        }

        map.flyTo([location.latitude, location.longitude], location.zoom);

        setSearchStatus(`${location.name} (${location.canton}) wurde geöffnet.`);
    }, [searchValue]);

    /**
     * Fragt die Browser-Position ab und zeigt sie als blauen Punkt an.
     */
    const showUserLocation = useCallback(() => {
        const map = mapRef.current;
        const L = leafletRef.current;

        if (!map || !L) {
            setLocationStatus("Die Karte ist noch nicht vollständig geladen.");
            return;
        }

        if (!navigator.geolocation) {
            setLocationStatus(
                "Dein Browser unterstützt keine Standortbestimmung.",
            );
            return;
        }

        setIsLocating(true);
        setLocationStatus("Standort wird ermittelt …");

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const location: [number, number] = [
                    position.coords.latitude,
                    position.coords.longitude,
                ];

                userMarkerRef.current?.remove();

                userMarkerRef.current = L.circleMarker(location, {
                    radius: 10,
                    color: "#ffffff",
                    weight: 3,
                    fillColor: "#2563eb",
                    fillOpacity: 1,
                })
                    .bindPopup(
                        `Dein Standort<br /><small>Genauigkeit: ca. ${Math.round(
                            position.coords.accuracy,
                        )} m</small>`,
                    )
                    .addTo(map)
                    .openPopup();

                map.flyTo(location, 14);

                setIsLocating(false);

                setLocationStatus(
                    `Standort markiert – Genauigkeit ca. ${Math.round(
                        position.coords.accuracy,
                    )} m.`,
                );
            },
            (geolocationError) => {
                setIsLocating(false);

                if (geolocationError.code === geolocationError.PERMISSION_DENIED) {
                    setLocationStatus(
                        "Standortfreigabe wurde abgelehnt. Du kannst sie in den Browser-Einstellungen erlauben.",
                    );
                    return;
                }

                if (geolocationError.code === geolocationError.TIMEOUT) {
                    setLocationStatus(
                        "Die Standortbestimmung hat zu lange gedauert. Bitte versuche es erneut.",
                    );
                    return;
                }

                setLocationStatus(
                    "Der Standort konnte nicht ermittelt werden. Prüfe deine Browser-Berechtigung.",
                );
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 30000,
            },
        );
    }, []);

    return (
        <main className="map-page">
            <header className="map-header">
                <div>
                    <h1>DroneMap Schweiz</h1>
                    <p>{mapStatus}</p>
                </div>

                <form
                    className="location-search"
                    onSubmit={(event) => {
                        event.preventDefault();
                        searchLocation();
                    }}
                >
                    <label className="visually-hidden" htmlFor="location-search">
                        Ort oder Koordinaten suchen
                    </label>

                    <input
                        id="location-search"
                        onChange={(event) => setSearchValue(event.target.value)}
                        placeholder="Ort oder 46.948, 7.447"
                        type="search"
                        value={searchValue}
                    />

                    <button type="submit">Suchen</button>
                </form>

                <div className="map-actions">
                    <button
                        disabled={isLocating}
                        onClick={showUserLocation}
                        type="button"
                    >
                        {isLocating ? "Standort wird gesucht …" : "Meinen Standort zeigen"}
                    </button>

                    <button onClick={resetMapView} type="button">
                        Schweiz anzeigen
                    </button>
                </div>
            </header>

            <section className="map-content">
                <div
                    aria-label="Interaktive Karte mit Schweizer Drohnenzonen"
                    className="leaflet-map"
                    ref={mapElementRef}
                />

                <aside className="map-sidebar">
                    <h2>Drohnenzonen Schweiz</h2>

                    <ul className="legend-list">
                        {(
                            ["prohibited", "restricted", "warning", "information"] as const
                        ).map((restrictionType) => {
                            const style = getZoneStyle(restrictionType);

                            return (
                                <li key={restrictionType}>
                                    <span
                                        aria-hidden="true"
                                        className="legend-color"
                                        style={{ backgroundColor: style.fillColor }}
                                    />
                                    {getRestrictionLabel(restrictionType)}
                                </li>
                            );
                        })}
                    </ul>
                    <ZoneFilters
                        activeFilters={activeFilters}
                        onToggle={toggleZoneFilter}
                    />


                    {locationStatus && (
                        <p className="location-status">{locationStatus}</p>
                    )}

                    {searchStatus && <p className="search-status">{searchStatus}</p>}

                    {checkedZones && (
                        <section
                            className={`point-check-status ${checkedZones.length > 0
                                ? "point-check-status-warning"
                                : "point-check-status-clear"
                                }`}
                        >
                            <h3>Punktprüfung</h3>

                            {checkedZones.length > 0 ? (
                                <>
                                    <p>
                                        An diesem Punkt wurden {checkedZones.length} geladene
                                        Demo-Zone{checkedZones.length === 1 ? "" : "n"} gefunden.
                                    </p>

                                    <ul>
                                        {checkedZones.map((zone) => (
                                            <li key={zone.id}>
                                                {getRestrictionLabel(zone.restrictionType)}:{" "}
                                                {zone.title}
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            ) : (
                                <p>
                                    An diesem Punkt wurde keine geladene Demo-Zone gefunden.
                                </p>
                            )}

                            <p className="point-check-disclaimer">
                                Dies ist keine Flugfreigabe. Es werden nur die aktuell in der
                                App geladenen Demodaten geprüft.
                            </p>
                        </section>
                    )}

                    <section className="zone-list-section">
                        <h3>
                            Sichtbare Zonen ({visibleZones.length} von {zones.length})
                        </h3>


                        <div className="zone-list">
                            {visibleZones.map((zone) => {
                                const style = getZoneStyle(zone.restrictionType);
                                const isSelected = selectedZone?.id === zone.id;

                                return (
                                    <button
                                        aria-pressed={isSelected}
                                        className={`zone-list-button ${isSelected ? "zone-list-button-active" : ""
                                            }`}
                                        key={zone.id}
                                        onClick={() => focusZone(zone)}
                                        type="button"
                                    >
                                        <span
                                            aria-hidden="true"
                                            className="zone-list-color"
                                            style={{ backgroundColor: style.fillColor }}
                                        />

                                        <span className="zone-list-content">
                                            <strong>{zone.title}</strong>
                                            <small>
                                                {getRestrictionLabel(zone.restrictionType)}
                                            </small>
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    {selectedZone ? (
                        <section className="selected-zone">
                            <h3>{selectedZone.title}</h3>

                            <p>
                                <strong>Typ:</strong>{" "}
                                {getRestrictionLabel(selectedZone.restrictionType)}
                            </p>

                            {selectedZone.description && (
                                <p>
                                    <strong>Hinweis:</strong> {selectedZone.description}
                                </p>
                            )}

                            {selectedZone.maxAltitudeMeters && (
                                <p>
                                    <strong>Beispiel-Maximalhöhe:</strong>{" "}
                                    {selectedZone.maxAltitudeMeters} m
                                </p>
                            )}

                            <p>
                                <strong>Quelle:</strong> {selectedZone.source}
                            </p>

                            <p>
                                <strong>Aktualisiert:</strong>{" "}
                                {new Date(selectedZone.updatedAt).toLocaleDateString("de-CH")}
                            </p>
                        </section>
                    ) : (
                        <p className="sidebar-hint">
                            Klicke auf eine farbige Fläche, einen Zonennamen oder einen
                            Punkt auf der Karte, um Details zu sehen.
                        </p>
                    )}

                    <p className="disclaimer">
                        Ausschließlich Demodaten: Diese App ist kein rechtsverbindliches
                        Flugsicherheits- oder Genehmigungssystem. Prüfe vor jedem Flug die
                        aktuellen offiziellen Schweizer Informationen.
                    </p>
                </aside>
            </section>
        </main>
    );
}
