import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import './Map.css';
import { Feature, FeatureCollection, Geometry, GeoJsonProperties } from 'geojson';

interface AlertProperties {
    headline: string;
    description: string;
    severity: string;
}

const MapComponent = () => {
    // const [geoJsonData, setGeoJsonData] = useState<FeatureCollection<Geometry, GeoJsonProperties> | null>(null);
    const [alertsGeoJsonData, setAlertsGeoJsonData] = useState<FeatureCollection<Geometry, AlertProperties> | null>(null);
    const [selectedAlert, setSelectedAlert] = useState<AlertProperties | null>(null);

    useEffect(() => {
        // Fetch GeoJSON data
        // fetch("https://cdn.jsdelivr.net/gh/johan/world.geo.json@34c96bba/countries/USA.geo.json")
        //     .then(response => response.json())
        //     .then(data => setGeoJsonData(data));

        // Fetch latest active alerts
        fetchLatestActiveAlerts();
    }, []);

    const fetchLatestActiveAlerts = async () => {
        try {
            const response = await fetch('https://api.weather.gov/alerts/active');
            const data = await response.json();
            setAlertsGeoJsonData(data);
        } catch (error) {
            console.error('Error fetching latest active alerts:', error);
        }
    };

    const getColor = (severity: string): string => {
        switch (severity.toLowerCase()) {
            case 'extreme':
                return 'red';
            case 'severe':
                return 'orange';
            case 'moderate':
                return 'yellow';
            default:
                return 'blue';
        }
    };

    const handleFeatureClick = (event: any) => {
        const feature = event?.layer?.feature;
        if (feature) {
            setSelectedAlert(feature.properties);
        }
    };

    const handleCloseModal = () => {
        setSelectedAlert(null);
    };

    return (
        <div className="flex flex-col h-screen map-container">
            <div className="flex-1">
                <MapContainer center={[37.0902, -95.7129]} zoom={4} className="h-full">
                    <TileLayer
                        url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png"
                    />
                    {/* {geoJsonData && <GeoJSON data={geoJsonData} style={{ fillOpacity: 0.05 }} />} */}
                    {alertsGeoJsonData && (
                        <GeoJSON
                            data={alertsGeoJsonData}
                            style={(feature) => ({
                                color: getColor(feature?.properties?.severity || ''),
                                weight: 2,
                                opacity: 1,
                                fillOpacity: 0.5,
                                fillColor: getColor(feature?.properties?.severity || '')
                            })}
                            onEachFeature={(feature, layer) => {
                                layer.on({
                                    click: handleFeatureClick
                                });
                            }}
                        />
                    )}
                </MapContainer>
            </div>
            {selectedAlert && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={handleCloseModal}>&times;</span>
                        <h2>{selectedAlert.headline}</h2>
                        <p>{selectedAlert.description}</p>
                        <button onClick={handleCloseModal}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MapComponent;
