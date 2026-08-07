"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Sun, Satellite, Globe, Zap, Radio } from "lucide-react";

interface SolarSpaceViewerProps {
  className?: string;
}

export default function SolarSpaceViewer({ className = "" }: SolarSpaceViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [satelliteStatus, setSatelliteStatus] = useState<string>("GEO Orbit • 35,786 km • Nominal");

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;

    // 1. Scene, Camera, Renderer Setup
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060913, 0.015);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 2, 28);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(renderer.domElement);

    // 2. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0x334155, 1.2);
    scene.add(ambientLight);

    // Sun Point Light (Left)
    const sunLight = new THREE.PointLight(0xf59e0b, 4, 100);
    sunLight.position.set(-12, 0, 0);
    scene.add(sunLight);

    // 3. SUN (Left Side)
    const sunGroup = new THREE.Group();
    sunGroup.position.set(-12, 0, 0);
    scene.add(sunGroup);

    // Sun Core
    const sunGeo = new THREE.SphereGeometry(3.5, 64, 64);
    const sunMat = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
    });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunGroup.add(sunMesh);

    // Sun Corona Glow Atmosphere
    const coronaGeo = new THREE.SphereGeometry(4.2, 32, 32);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.35,
      side: THREE.BackSide,
    });
    const coronaMesh = new THREE.Mesh(coronaGeo, coronaMat);
    sunGroup.add(coronaMesh);

    // Outer Solar Flare Halo
    const haloGeo = new THREE.SphereGeometry(5.0, 32, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide,
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    sunGroup.add(haloMesh);

    // 4. EARTH (Right Side)
    const earthGroup = new THREE.Group();
    earthGroup.position.set(10, 0, 0);
    scene.add(earthGroup);

    // Earth Body
    const earthGeo = new THREE.SphereGeometry(2.5, 64, 64);
    const earthMat = new THREE.MeshPhongMaterial({
      color: 0x1e3a8a,
      emissive: 0x0f172a,
      specular: 0x38bdf8,
      shininess: 25,
      wireframe: false,
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthGroup.add(earthMesh);

    // Earth Atmosphere Glow Ring
    const earthAtmoGeo = new THREE.SphereGeometry(2.75, 32, 32);
    const earthAtmoMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.25,
      side: THREE.BackSide,
    });
    const earthAtmoMesh = new THREE.Mesh(earthAtmoGeo, earthAtmoMat);
    earthGroup.add(earthAtmoMesh);

    // 5. GEOSTATIONARY ORBIT RING & SATELLITE (Above / Orbiting Earth)
    const geoOrbitRadius = 5.2;

    // Geostationary Orbit Path Ring
    const orbitCurve = new THREE.EllipseCurve(
      0, 0,
      geoOrbitRadius, geoOrbitRadius * 0.4, // inclined ellipse perspective
      0, 2 * Math.PI,
      false,
      0
    );
    const points = orbitCurve.getPoints(100);
    const orbitGeo = new THREE.BufferGeometry().setFromPoints(
      points.map((p) => new THREE.Vector3(p.x, p.y, 0))
    );
    const orbitMat = new THREE.LineDashedMaterial({
      color: 0x38bdf8,
      dashSize: 0.4,
      gapSize: 0.2,
      opacity: 0.4,
      transparent: true,
    });
    const orbitLine = new THREE.Line(orbitGeo, orbitMat);
    orbitLine.computeLineDistances();
    orbitLine.rotation.x = Math.PI / 3;
    earthGroup.add(orbitLine);

    // GEOSTATIONARY SATELLITE GROUP
    const satelliteGroup = new THREE.Group();
    earthGroup.add(satelliteGroup);

    // Satellite Bus (Main Body Box)
    const busGeo = new THREE.BoxGeometry(0.5, 0.5, 0.7);
    const busMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      metalness: 0.8,
      roughness: 0.2,
    });
    const busMesh = new THREE.Mesh(busGeo, busMat);
    satelliteGroup.add(busMesh);

    // Solar Panel Array Left Wing
    const panelGeo = new THREE.BoxGeometry(1.6, 0.04, 0.4);
    const panelMat = new THREE.MeshStandardMaterial({
      color: 0x1d4ed8,
      metalness: 0.5,
      roughness: 0.1,
    });
    const panelLeft = new THREE.Mesh(panelGeo, panelMat);
    panelLeft.position.set(-1.1, 0, 0);
    satelliteGroup.add(panelLeft);

    // Solar Panel Array Right Wing
    const panelRight = new THREE.Mesh(panelGeo, panelMat);
    panelRight.position.set(1.1, 0, 0);
    satelliteGroup.add(panelRight);

    // Satellite Telemetry Dish Antenna
    const dishGeo = new THREE.ConeGeometry(0.3, 0.2, 16);
    const dishMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9 });
    const dishMesh = new THREE.Mesh(dishGeo, dishMat);
    dishMesh.rotation.x = -Math.PI / 2;
    dishMesh.position.set(0, 0.3, 0.35);
    satelliteGroup.add(dishMesh);

    // 6. SOLAR WIND ENERGETIC PARTICLE STREAM (Sun -> Earth/Satellite)
    const particleCount = 250;
    const particlesGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      // Random spread along Sun -> Earth line
      particlePositions[i * 3] = -10 + Math.random() * 20; // X
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 3.5; // Y
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 3.5; // Z
      particleSpeeds[i] = 0.08 + Math.random() * 0.12;
    }

    particlesGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xf59e0b,
      size: 0.18,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particlesGeo, particleMat);
    scene.add(particleSystem);

    // 7. BACKGROUND STARFIELD PARTICLES
    const starCount = 600;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 120;
      starPos[i * 3 + 1] = (Math.random() - 0.5) * 80;
      starPos[i * 3 + 2] = (Math.random() - 0.5) * 80;
    }

    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.08,
      transparent: true,
      opacity: 0.5,
    });
    const starSystem = new THREE.Points(starGeo, starMat);
    scene.add(starSystem);

    // 8. ANIMATION & ORBIT LOOP
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Rotate Sun Core
      sunMesh.rotation.y = elapsedTime * 0.1;
      coronaMesh.rotation.y = -elapsedTime * 0.05;

      // Rotate Earth
      earthMesh.rotation.y = elapsedTime * 0.2;

      // Orbit Satellite around Earth in Geostationary Ring
      const orbitAngle = elapsedTime * 0.35;
      const satX = Math.cos(orbitAngle) * geoOrbitRadius;
      const satZ = Math.sin(orbitAngle) * (geoOrbitRadius * 0.4);
      const satY = Math.sin(orbitAngle) * 1.5;

      satelliteGroup.position.set(satX, satY, satZ);
      satelliteGroup.rotation.y = -orbitAngle + Math.PI / 2;

      // Animate Solar Wind Energetic Particle Flow (Left -> Right)
      const positions = particleSystem.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] += particleSpeeds[i];
        // Reset to Sun if reached Earth
        if (positions[i * 3] > 11) {
          positions[i * 3] = -11;
          positions[i * 3 + 1] = (Math.random() - 0.5) * 3.5;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 3.5;
        }
      }
      particleSystem.geometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // 9. Resize Listener
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Three.js Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Labels & Orbit Telemetry Overlay */}
      <div className="absolute top-4 left-6 z-10 flex items-center gap-2 px-3.5 py-1.5 rounded-xl glass-panel border border-amber-500/30 text-amber-300 text-xs font-semibold">
        <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
        <span>SUN (L1 Upstream)</span>
      </div>

      <div className="absolute top-4 right-6 z-10 flex items-center gap-2 px-3.5 py-1.5 rounded-xl glass-panel border border-blue-500/30 text-blue-300 text-xs font-semibold">
        <Globe className="w-4 h-4 text-blue-400" />
        <span>EARTH & GEO SATELLITE ORBIT</span>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2.5 px-4 py-2 rounded-xl glass-panel border border-amber-500/40 text-xs font-bold text-slate-200 shadow-xl">
        <Satellite className="w-4 h-4 text-amber-400 animate-pulse" />
        <span>Geostationary Satellite Orbit (GEO) • &gt;2 MeV Energetic Electron Stream</span>
        <Zap className="w-3.5 h-3.5 text-amber-400" />
      </div>
    </div>
  );
}
