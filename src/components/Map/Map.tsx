import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import './Map.css';
import { FeatureCollection, Geometry, GeoJsonProperties } from 'geojson';

interface AlertProperties {
    headline: string;
    description: string;
    severity: string;
}

const MapComponent = () => {
    const [alertsGeoJsonData, setAlertsGeoJsonData] = useState<FeatureCollection<Geometry, AlertProperties> | null>(null);
    const [selectedAlert, setSelectedAlert] = useState<AlertProperties | null>(null);

    useEffect(() => {
        fetchLatestActiveAlerts();
    }, []);

    const fetchLatestActiveAlerts = async () => {
        try {
            const response = await fetch('https://api.weather.gov/alerts/active');
            const data = await response.json();

            if (data && data.features) {
                data.features.sort((a: any, b: any) => {
                    const severityValues: Record<string, number> = {
                        'extreme': 3,
                        'severe': 2,
                        'moderate': 1,
                        'default': 0
                    };

                    const severityA = severityValues[a.properties.severity.toLowerCase()] || severityValues['default'];
                    const severityB = severityValues[b.properties.severity.toLowerCase()] || severityValues['default'];
                    return severityA - severityB;
                });
            }

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

    const handleClosePopup = () => {
        setSelectedAlert(null);
    };

    return (
        <div className="flex flex-col h-screen map-container">
            <div className="flex-1">
                <MapContainer center={[37.0902, -95.7129]} zoom={4} className="h-full" minZoom={2} maxZoom={10} maxBounds={[[-90, -180], [90, 180]]}>
                    <TileLayer
                        url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png"
                        noWrap={true}
                    />
                    {alertsGeoJsonData && (
                        <GeoJSON
                            data={alertsGeoJsonData}
                            style={(feature) => ({
                                color: getColor(feature?.properties?.severity || ''),
                                weight: 2,
                                opacity: 1,
                                fillOpacity: 0.05,
                                fillColor: getColor(feature?.properties?.severity || ''),
                                className: "stroke-animated",
                            })}
                            onEachFeature={(feature, layer) => {
                                layer.bindPopup(`
                                    <div>
                                        <h2>${feature.properties.headline}</h2>
                                        <p>${feature.properties.description}</p>
                                    </div>
                                `);
                                layer.on({
                                    click: handleFeatureClick
                                });
                            }}
                        />
                    )}
                </MapContainer>
            </div>
        </div>
    );
};

export default MapComponent;
