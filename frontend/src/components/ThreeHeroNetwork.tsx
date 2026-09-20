import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const ThreeHeroNetwork: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 180;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Particle count & bounds
    const particleCount = 70;
    const r = 240;
    const particles = new Float32Array(particleCount * 3);
    const particleVelocities: { x: number; y: number; z: number }[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles[i * 3] = (Math.random() - 0.5) * r;
      particles[i * 3 + 1] = (Math.random() - 0.5) * r;
      particles[i * 3 + 2] = (Math.random() - 0.5) * r;

      particleVelocities.push({
        x: (Math.random() - 0.5) * 0.35,
        y: (Math.random() - 0.5) * 0.35,
        z: (Math.random() - 0.5) * 0.35,
      });
    }

    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particles, 3));

    // Particle material (Electric Lime & Cyan glow)
    const pMaterial = new THREE.PointsMaterial({
      color: 0xccff00,
      size: 3.5,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.85,
    });

    const pointCloud = new THREE.Points(particlesGeometry, pMaterial);
    scene.add(pointCloud);

    // Line segments connecting nearby nodes (AST graph simulation)
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
    });

    const maxLineConnections = particleCount * particleCount;
    const linePositions = new Float32Array(maxLineConnections * 3);
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    const linesMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(linesMesh);

    // Mouse parallax tracking
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / container.clientWidth) * 2 - 1;
      mouseY = -(((e.clientY - rect.top) / container.clientHeight) * 2 - 1);
    };

    window.addEventListener('mousemove', onMouseMove);

    // Window resize handler
    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', onResize);

    // Animation Loop
    let animationId: number | null = null;
    let isVisible = true;

    const animate = () => {
      if (!isVisible) {
        animationId = null;
        return;
      }

      animationId = requestAnimationFrame(animate);

      // Smooth camera easing
      targetX += (mouseX * 25 - targetX) * 0.05;
      targetY += (mouseY * 25 - targetY) * 0.05;
      camera.position.x = targetX;
      camera.position.y = targetY;
      camera.lookAt(scene.position);

      pointCloud.rotation.y += 0.0015;
      pointCloud.rotation.x += 0.0008;
      linesMesh.rotation.y += 0.0015;
      linesMesh.rotation.x += 0.0008;

      // Update particle positions
      const positions = pointCloud.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        positions[i3] += particleVelocities[i].x;
        positions[i3 + 1] += particleVelocities[i].y;
        positions[i3 + 2] += particleVelocities[i].z;

        // Bounce at boundaries
        if (Math.abs(positions[i3]) > r / 2) particleVelocities[i].x *= -1;
        if (Math.abs(positions[i3 + 1]) > r / 2) particleVelocities[i].y *= -1;
        if (Math.abs(positions[i3 + 2]) > r / 2) particleVelocities[i].z *= -1;
      }
      pointCloud.geometry.attributes.position.needsUpdate = true;

      // Connect nearby particles with dynamic line graph
      let vertexPos = 0;
      const minDistance = 55;
      for (let i = 0; i < particleCount; i++) {
        for (let j = i + 1; j < particleCount; j++) {
          const dx = positions[i * 3] - positions[j * 3];
          const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
          const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < minDistance) {
            linePositions[vertexPos++] = positions[i * 3];
            linePositions[vertexPos++] = positions[i * 3 + 1];
            linePositions[vertexPos++] = positions[i * 3 + 2];

            linePositions[vertexPos++] = positions[j * 3];
            linePositions[vertexPos++] = positions[j * 3 + 1];
            linePositions[vertexPos++] = positions[j * 3 + 2];
          }
        }
      }
      linesMesh.geometry.setDrawRange(0, vertexPos / 3);
      linesMesh.geometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    const startAnimation = () => {
      if (animationId === null && isVisible) {
        animationId = requestAnimationFrame(animate);
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          startAnimation();
        } else if (animationId !== null) {
          cancelAnimationFrame(animationId);
          animationId = null;
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    startAnimation();

    // Cleanup
    return () => {
      observer.disconnect();
      if (animationId !== null) cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      particlesGeometry.dispose();
      pMaterial.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 pointer-events-none -z-10 overflow-hidden opacity-70"
    />
  );
};
