import React, { useEffect, useRef, useState } from 'react';
import Globe from 'react-globe.gl';
import * as THREE from 'three';

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
      controls.autoRotateSpeed = 0.5;
      controls.enableZoom = false; // Disable zooming for background
      
      // Setup scene properties for an Apple-like moody aesthetic
      const scene = globeEl.current.scene();
      
      // Remove default lights
      scene.children = scene.children.filter(c => !(c instanceof THREE.Light));
      
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.8); // Balanced white ambient
      scene.add(ambientLight);
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5); // Natural directional light
      directionalLight.position.set(2, 1, 1);
      scene.add(directionalLight);
    }
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-black pointer-events-auto">
      {/* 
        Textures:
        - imageUrl: Earth day map (high res)
        - bumpImageUrl: Earth bump map for mountains
        - backgroundImageUrl: Starfield
      */}
      <Globe
        ref={globeEl}
        width={dimensions.width}
        height={dimensions.height}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        atmosphereColor="#3a60df"
        atmosphereAltitude={0.15}
        backgroundColor="rgba(0,0,0,0)"
      />
      
      {/* Vignette overlay to fade out the edges into the black background but keep center bright */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{ background: 'radial-gradient(circle, transparent 40%, black 100%)' }}
      />
    </div>
  );
}
