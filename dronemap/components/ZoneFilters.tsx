"use client";

import type { RestrictionType } from "@/features/zones/types";
import {
    getRestrictionLabel,
    getZoneStyle,
} from "@/features/zones/zone-utils";

interface ZoneFiltersProps {
    activeFilters: Set<RestrictionType>;
    onToggle: (restrictionType: RestrictionType) => void;
}

const restrictionTypes: RestrictionType[] = [
    "prohibited",
    "restricted",
    "warning",
    "information",
];

export default function ZoneFilters({
    activeFilters,
    onToggle,
}: ZoneFiltersProps) {
    return (
        <section className="zone-filter-section">
            <h3>Kartenfilter</h3>

            <div className="zone-filter-list">
                {restrictionTypes.map((restrictionType) => {
                    const style = getZoneStyle(restrictionType);
                    const isActive = activeFilters.has(restrictionType);

                    return (
                        <label className="zone-filter-item" key={restrictionType}>
                            <input
                                checked={isActive}
                                onChange={() => onToggle(restrictionType)}
                                type="checkbox"
                            />

                            <span
                                aria-hidden="true"
                                className="zone-filter-color"
                                style={{ backgroundColor: style.fillColor }}
                            />

                            <span>{getRestrictionLabel(restrictionType)}</span>
                        </label>
                    );
                })}
            </div>
        </section>
    );
}
