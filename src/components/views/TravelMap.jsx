import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { buildTravelMarkers } from "../../utils/travelMapUtils";
import { styles } from "../../styles/styles";

function TravelMapBounds({ markers }) {
  const map = useMap();

  useEffect(() => {
    if (markers.length === 0) return;
    if (markers.length === 1) {
      map.setView([markers[0].lat, markers[0].lng], 5);
      return;
    }
    map.fitBounds(markers.map((marker) => [marker.lat, marker.lng]), { padding: [36, 36] });
  }, [map, markers]);

  return null;
}

export default function TravelMap({ items, selectedItemId, onSelectItem }) {
  const markers = useMemo(() => buildTravelMarkers(items), [items]);
  const plotted = markers.filter((marker) => marker.lat != null && marker.lng != null);
  const unresolved = markers.filter((marker) => marker.lat == null || marker.lng == null);
  const pathByItem = items
    .map((item) => ({
      itemId: item.id,
      itemColor: item.color || "#2563eb",
      points: plotted
        .filter((marker) => marker.itemId === item.id)
        .map((marker) => [marker.lat, marker.lng]),
    }))
    .filter((entry) => entry.points.length > 1);

  return (
    <div style={styles.travelMapCard}>
      <div style={styles.travelMapHeader}>
        <div>
          <h3 style={styles.cardTitle}>Travel Map</h3>
          <div style={styles.viewSubtitle}>
            Map loads on demand. Search exact places online or store coordinates directly.
          </div>
        </div>
        <div style={styles.travelMapLegend}>
          <span>{plotted.length} mapped</span>
          <span>{unresolved.length} unresolved</span>
        </div>
      </div>

      <div style={styles.travelMapCanvas}>
        <MapContainer center={[20, 0]} zoom={2} scrollWheelZoom style={styles.travelMapLeaflet}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <TravelMapBounds markers={plotted} />
          {pathByItem.map((entry) => (
            <Polyline
              key={entry.itemId}
              positions={entry.points}
              pathOptions={{
                color: entry.itemColor,
                weight: selectedItemId === entry.itemId ? 4 : 2.5,
                opacity: selectedItemId === entry.itemId ? 0.85 : 0.45,
              }}
            />
          ))}
          {plotted.map((marker) => (
            <CircleMarker
              key={marker.id}
              center={[marker.lat, marker.lng]}
              radius={selectedItemId === marker.itemId ? 9 : 7}
              pathOptions={{
                color: "#fff",
                weight: 2,
                fillColor: marker.itemColor,
                fillOpacity: 0.95,
              }}
              eventHandlers={{
                click: () => onSelectItem(marker.itemId),
              }}
            >
              <Popup>
                <div style={styles.travelPopup}>
                  <strong>{marker.label}</strong>
                  <div>{marker.itemName}</div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      <div style={styles.travelMapFooter}>
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectItem(item.id)}
            style={{
              ...styles.travelTripPill,
              ...(selectedItemId === item.id ? styles.travelTripPillActive : {}),
              borderColor: item.color || "#2563eb",
            }}
          >
            <span style={{ ...styles.statusDot, background: item.color || "#2563eb" }} />
            <span>{item.name}</span>
          </button>
        ))}
      </div>

      {unresolved.length > 0 && (
        <div style={styles.travelMapUnresolved}>
          Unresolved locations: {unresolved.map((marker) => marker.label).join(", ")}
        </div>
      )}
    </div>
  );
}
