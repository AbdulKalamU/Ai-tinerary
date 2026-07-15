import React, { useEffect, useRef, useState } from 'react';
import Globe from 'react-globe.gl';
import * as THREE from 'three';

const cities = [
  { name: 'New York', lat: 40.7128, lng: -74.0060 },
  { name: 'London', lat: 51.5074, lng: -0.1278 },
  { name: 'Tokyo', lat: 35.6762, lng: 139.6503 },
  { name: 'Sydney', lat: -33.8688, lng: 151.2093 },
  { name: 'Dubai', lat: 25.2048, lng: 55.2708 },
  { name: 'Paris', lat: 48.8566, lng: 2.3522 },
  { name: 'Singapore', lat: 1.3521, lng: 103.8198 },
  { name: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
  { name: 'Sao Paulo', lat: -23.5505, lng: -46.6333 },
  { name: 'Johannesburg', lat: -26.2041, lng: 28.0473 },
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
  { name: 'Hong Kong', lat: 22.3193, lng: 114.1694 },
  { name: 'Toronto', lat: 43.6510, lng: -79.3470 },
  { name: 'Beijing', lat: 39.9042, lng: 116.4074 },
  { name: 'Moscow', lat: 55.7558, lng: 37.6173 },
  { name: 'Cairo', lat: 30.0444, lng: 31.2357 },
  { name: 'Cape Town', lat: -33.9249, lng: 18.4241 },
  { name: 'New Delhi', lat: 28.6139, lng: 77.2090 },
  { name: 'Bangkok', lat: 13.7563, lng: 100.5018 },
  { name: 'Seoul', lat: 37.5665, lng: 126.9780 },
  { name: 'Mexico City', lat: 19.4326, lng: -99.1332 },
  { name: 'Istanbul', lat: 41.0082, lng: 28.9784 },
  { name: 'Rome', lat: 41.9028, lng: 12.4964 },
  { name: 'San Francisco', lat: 37.7749, lng: -122.4194 },
  { name: 'Lima', lat: -12.0464, lng: -77.0428 }
];

// Helper to get city by name for easy arc creation
const getCity = (name) => cities.find(c => c.name === name);
const createArc = (start, end, color) => ({
  startLat: getCity(start).lat, startLng: getCity(start).lng,
  endLat: getCity(end).lat, endLng: getCity(end).lng,
  color
});

// Generate lots of flight paths between cities
const arcsData = [
  createArc('New York', 'London', '#ff00ff'),
  createArc('London', 'Dubai', '#00ffff'),
  createArc('Dubai', 'Tokyo', '#ff00ff'),
  createArc('Tokyo', 'Sydney', '#a855f7'),
  createArc('Sydney', 'Los Angeles', '#ff00ff'),
  createArc('Los Angeles', 'New York', '#00ffff'),
  createArc('Paris', 'Singapore', '#a855f7'),
  createArc('Singapore', 'Tokyo', '#ff00ff'),
  createArc('New York', 'Sao Paulo', '#00ffff'),
  createArc('Sao Paulo', 'Johannesburg', '#ff00ff'),
  createArc('Johannesburg', 'Dubai', '#a855f7'),
  createArc('Dubai', 'Mumbai', '#00ffff'),
  createArc('Mumbai', 'Hong Kong', '#ff00ff'),
  createArc('Hong Kong', 'Tokyo', '#00ffff'),
  createArc('London', 'Toronto', '#ff00ff'),
  createArc('Toronto', 'San Francisco', '#a855f7'),
  createArc('San Francisco', 'Tokyo', '#00ffff'),
  createArc('Beijing', 'Moscow', '#ff00ff'),
  createArc('Moscow', 'Istanbul', '#a855f7'),
  createArc('Istanbul', 'Rome', '#00ffff'),
  createArc('Rome', 'Cairo', '#ff00ff'),
  createArc('Cairo', 'Cape Town', '#a855f7'),
  createArc('Cape Town', 'Sao Paulo', '#00ffff'),
  createArc('Mexico City', 'Lima', '#ff00ff'),
  createArc('Lima', 'Sao Paulo', '#a855f7'),
  createArc('Seoul', 'Beijing', '#00ffff'),
  createArc('Bangkok', 'New Delhi', '#ff00ff'),
  createArc('New Delhi', 'Dubai', '#a855f7'),
  createArc('Los Angeles', 'Mexico City', '#00ffff'),
  createArc('Paris', 'Rome', '#ff00ff')
];

export default function GlobeBackground() {
  const globeEl = useRef();
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (globeEl.current) {
      // Auto-rotate the globe slowly
      const controls = globeEl.current.controls();
      controls.autoRotate = true;
      controls.autoRotateSpeed = 2.0;
      controls.enableZoom = false; // Disable zooming for background
      
      // Setup scene properties for a brighter aesthetic
      const scene = globeEl.current.scene();
      
      // Remove default lights
      scene.children = scene.children.filter(c => !(c instanceof THREE.Light));
      
      const ambientLight = new THREE.AmbientLight(0xffffff, 1.8); // Much brighter ambient light
      scene.add(ambientLight);
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, 3.5); // Much brighter directional light
      directionalLight.position.set(2, 1, 1);
      scene.add(directionalLight);
    }
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-transparent pointer-events-auto">
      <Globe
        ref={globeEl}
        width={dimensions.width}
        height={dimensions.height}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        atmosphereColor="#3a80ef"
        atmosphereAltitude={0.25}
        backgroundColor="rgba(0,0,0,0)"
        
        // Add animated flight paths (Arcs)
        arcsData={arcsData}
        arcStartLat={d => d.startLat}
        arcStartLng={d => d.startLng}
        arcEndLat={d => d.endLat}
        arcEndLng={d => d.endLng}
        arcColor={d => d.color}
        arcDashLength={0.8}
        arcDashGap={0.1}
        arcDashAnimateTime={1500}
        arcAltitudeAutoScale={0.4}
        arcStroke={0.6}

        // Add pulsating rings for major cities (Destinations)
        ringsData={cities}
        ringLat={d => d.lat}
        ringLng={d => d.lng}
        ringColor={() => '#00ffff'}
        ringMaxRadius={2.5}
        ringPropagationSpeed={3}
        ringRepeatPeriod={600}
      />
    </div>
  );
}
