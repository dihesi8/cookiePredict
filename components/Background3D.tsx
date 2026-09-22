"use client";

import { FC, useEffect, useRef } from "react";
import * as THREE from "three";

export const Background3D: FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cleanup: (() => void) | undefined;

    // Defer heavy WebGL setup until the browser is idle after first paint,
    // so this decorative layer never competes with initial page load.
    const idle =
      (window as any).requestIdleCallback ||
      ((cb: () => void) => setTimeout(cb, 300));

    const idleId = idle(() => {
      cleanup = setupScene(container);
    });

    return () => {
      if ((window as any).cancelIdleCallback) (window as any).cancelIdleCallback(idleId);
      else clearTimeout(idleId);
      cleanup?.();
    };
  }, []);

  function setupScene(container: HTMLDivElement) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 14;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Muted floating low-poly shapes, matching the site's palette (no neon).
    const colors = [0xe8a13d, 0x4d8dff, 0x2fb872];
    const shapes: THREE.Mesh[] = [];
    const geoPool = [
      new THREE.IcosahedronGeometry(1, 0),
      new THREE.OctahedronGeometry(1, 0),
      new THREE.TetrahedronGeometry(1, 0),
    ];

    for (let i = 0; i < 14; i++) {
      const geo = geoPool[i % geoPool.length];
      const mat = new THREE.MeshBasicMaterial({
        color: colors[i % colors.length],
        wireframe: true,
        transparent: true,
        opacity: 0.16,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set((Math.random() - 0.5) * 24, (Math.random() - 0.5) * 16, (Math.random() - 0.5) * 12 - 4);
      const scale = 0.5 + Math.random() * 1.4;
      mesh.scale.setScalar(scale);
      mesh.userData.rotSpeed = 0.05 + Math.random() * 0.15;
      mesh.userData.driftSpeed = 0.05 + Math.random() * 0.1;
      mesh.userData.driftOffset = Math.random() * Math.PI * 2;
      scene.add(mesh);
      shapes.push(mesh);
    }

    // Faint particle field for depth.
    const particleCount = 200;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20 - 5;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({ color: 0x8b94a7, size: 0.05, transparent: true, opacity: 0.3 });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    let animId: number;
    const clock = new THREE.Clock();

    function animate() {
      const t = clock.getElapsedTime();
      shapes.forEach((mesh) => {
        mesh.rotation.x += mesh.userData.rotSpeed * 0.01;
        mesh.rotation.y += mesh.userData.rotSpeed * 0.015;
        mesh.position.y += Math.sin(t * mesh.userData.driftSpeed + mesh.userData.driftOffset) * 0.002;
      });
      particles.rotation.y += 0.0002;
      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    }
    animate();

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      container.removeChild(renderer.domElement);
      renderer.dispose();
      geoPool.forEach((g) => g.dispose());
      particleGeo.dispose();
    };
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        pointerEvents: "none",
      }}
    />
  );
};
