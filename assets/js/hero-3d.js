/**
 * =========================================================================
 * sukunix.com - Enterprise 3D WebGL Cyber Globe & Distributed Cloud Network
 * Powered by Three.js
 * =========================================================================
 */

(function () {
  'use strict';

  function initHero3D() {
    const canvas = document.getElementById('hero-3d-canvas');
    const heroSection = document.getElementById('hero') || (canvas ? canvas.parentElement : null);

    if (!canvas || !heroSection || typeof THREE === 'undefined') {
      return;
    }

    // Check WebGL availability
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) return;
    } catch (e) {
      return;
    }

    // --- Renderer Setup ---
    let width = heroSection.offsetWidth;
    let height = heroSection.offsetHeight;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);

    // --- Scene & Camera ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1500);
    camera.position.set(0, 0, 310);

    // Root 3D Container
    const worldGroup = new THREE.Group();
    worldGroup.rotation.x = 0.22;
    worldGroup.rotation.y = -0.35;
    scene.add(worldGroup);

    const GLOBE_RADIUS = 76;

    // -------------------------------------------------------------------------
    // 1. Inner Core Atmosphere / Subtle Wireframe Sphere
    // -------------------------------------------------------------------------
    const sphereGeo = new THREE.SphereGeometry(GLOBE_RADIUS, 30, 30);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      wireframe: true,
      transparent: true,
      opacity: 0.08
    });
    const coreSphere = new THREE.Mesh(sphereGeo, sphereMat);
    worldGroup.add(coreSphere);

    // -------------------------------------------------------------------------
    // 2. High-Density 3D Cyber Particle Mesh (Fibonacci Sphere)
    // -------------------------------------------------------------------------
    const particleCount = 720;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const cyanColor = new THREE.Color(0x0284c7);
    const blueColor = new THREE.Color(0x2563eb);
    const greenColor = new THREE.Color(0x059669);
    const lightCyan = new THREE.Color(0x38bdf8);

    for (let i = 0; i < particleCount; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / particleCount);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;

      const x = GLOBE_RADIUS * Math.sin(phi) * Math.cos(theta);
      const y = GLOBE_RADIUS * Math.sin(phi) * Math.sin(theta);
      const z = GLOBE_RADIUS * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Rich color variation across nodes
      const rand = Math.random();
      const col = rand > 0.85 ? greenColor : (rand > 0.4 ? cyanColor : (rand > 0.2 ? lightCyan : blueColor));
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle sprite texture (circular glow)
    const particleCanvas = document.createElement('canvas');
    particleCanvas.width = 48;
    particleCanvas.height = 48;
    const pCtx = particleCanvas.getContext('2d');
    const grad = pCtx.createRadialGradient(24, 24, 0, 24, 24, 24);
    grad.addColorStop(0, 'rgba(2, 132, 199, 1)');
    grad.addColorStop(0.35, 'rgba(37, 99, 235, 0.85)');
    grad.addColorStop(0.7, 'rgba(56, 189, 248, 0.4)');
    grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
    pCtx.fillStyle = grad;
    pCtx.fillRect(0, 0, 48, 48);

    const particleTexture = new THREE.CanvasTexture(particleCanvas);

    const particleMat = new THREE.PointsMaterial({
      size: 5.2,
      vertexColors: true,
      map: particleTexture,
      transparent: true,
      opacity: 0.92,
      depthWrite: false
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    worldGroup.add(particles);

    // -------------------------------------------------------------------------
    // 3. Global Cloud Hub Locations (Major Edge Data Centers)
    // -------------------------------------------------------------------------
    function latLonToVector3(lat, lon, radius) {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      return new THREE.Vector3(
        -(radius * Math.sin(phi) * Math.cos(theta)),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
      );
    }

    const cloudHubs = [
      { name: 'us-east-1 (N. Virginia)', lat: 38.0, lon: -78.0, color: 0x0284c7 },
      { name: 'us-west-2 (Oregon)', lat: 45.5, lon: -122.6, color: 0x2563eb },
      { name: 'eu-central-1 (Frankfurt)', lat: 50.1, lon: 8.6, color: 0x0284c7 },
      { name: 'eu-west-1 (Dublin)', lat: 53.3, lon: -6.2, color: 0x059669 },
      { name: 'ap-south-1 (Mumbai)', lat: 19.0, lon: 72.8, color: 0x059669 },
      { name: 'ap-southeast-1 (Singapore)', lat: 1.35, lon: 103.8, color: 0x0284c7 },
      { name: 'ap-northeast-1 (Tokyo)', lat: 35.6, lon: 139.6, color: 0x2563eb },
      { name: 'sa-east-1 (São Paulo)', lat: -23.5, lon: -46.6, color: 0x0284c7 },
      { name: 'ap-southeast-2 (Sydney)', lat: -33.8, lon: 151.2, color: 0x059669 }
    ];

    const hubMeshes = [];
    const hubGroup = new THREE.Group();

    cloudHubs.forEach((hub) => {
      const pos = latLonToVector3(hub.lat, hub.lon, GLOBE_RADIUS + 0.5);

      // Core Hub Dot
      const hubGeo = new THREE.SphereGeometry(2.0, 14, 14);
      const hubMat = new THREE.MeshBasicMaterial({
        color: hub.color,
        transparent: true,
        opacity: 0.95
      });
      const mesh = new THREE.Mesh(hubGeo, hubMat);
      mesh.position.copy(pos);

      // Outer Pulsing Ring
      const ringGeo = new THREE.RingGeometry(2.2, 3.8, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: hub.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.55
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.copy(pos);
      ring.lookAt(new THREE.Vector3(0, 0, 0));

      hubGroup.add(mesh);
      hubGroup.add(ring);

      hubMeshes.push({ mesh, ring, initialScale: 1.0, seed: Math.random() * 10 });
    });
    worldGroup.add(hubGroup);

    // -------------------------------------------------------------------------
    // 4. Glowing 3D Laser Data Arcs Between Global Clusters
    // -------------------------------------------------------------------------
    const hubConnections = [
      [0, 1], // US East - US West
      [0, 2], // US East - Frankfurt
      [0, 7], // US East - São Paulo
      [1, 6], // US West - Tokyo
      [2, 3], // Frankfurt - Dublin
      [2, 4], // Frankfurt - Mumbai
      [4, 5], // Mumbai - Singapore
      [5, 6], // Singapore - Tokyo
      [5, 8], // Singapore - Sydney
      [6, 8]  // Tokyo - Sydney
    ];

    const dataArcs = [];
    const packetsGroup = new THREE.Group();

    hubConnections.forEach(([fromIdx, toIdx]) => {
      const vFrom = latLonToVector3(cloudHubs[fromIdx].lat, cloudHubs[fromIdx].lon, GLOBE_RADIUS + 0.8);
      const vTo = latLonToVector3(cloudHubs[toIdx].lat, cloudHubs[toIdx].lon, GLOBE_RADIUS + 0.8);

      // Radial elevation control point
      const midPoint = new THREE.Vector3().addVectors(vFrom, vTo).multiplyScalar(0.5);
      const distance = vFrom.distanceTo(vTo);
      const arcElevation = 1.0 + Math.min(0.42, distance / 170);
      midPoint.normalize().multiplyScalar(GLOBE_RADIUS * arcElevation);

      const curve = new THREE.QuadraticBezierCurve3(vFrom, midPoint, vTo);
      const points = curve.getPoints(36);
      const curveGeo = new THREE.BufferGeometry().setFromPoints(points);

      const curveMat = new THREE.LineBasicMaterial({
        color: 0x0284c7,
        transparent: true,
        opacity: 0.42
      });

      const curveLine = new THREE.Line(curveGeo, curveMat);
      worldGroup.add(curveLine);

      // Animated traveling light packet
      const packetGeo = new THREE.SphereGeometry(1.4, 10, 10);
      const packetMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.95
      });
      const packetMesh = new THREE.Mesh(packetGeo, packetMat);
      packetsGroup.add(packetMesh);

      dataArcs.push({
        curve: curve,
        mesh: packetMesh,
        speed: 0.0035 + Math.random() * 0.003,
        progress: Math.random()
      });
    });

    worldGroup.add(packetsGroup);

    // -------------------------------------------------------------------------
    // 5. Dual Concentric Holographic Orbital Rings
    // -------------------------------------------------------------------------
    // Ring 1
    const ring1Geo = new THREE.RingGeometry(112, 113.4, 64);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.28
    });
    const orbitalRing1 = new THREE.Mesh(ring1Geo, ring1Mat);
    orbitalRing1.rotation.x = Math.PI * 0.42;
    orbitalRing1.rotation.y = Math.PI * 0.12;
    worldGroup.add(orbitalRing1);

    // Ring 2
    const ring2Geo = new THREE.RingGeometry(128, 129.2, 64);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: 0x2563eb,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.20
    });
    const orbitalRing2 = new THREE.Mesh(ring2Geo, ring2Mat);
    orbitalRing2.rotation.x = -Math.PI * 0.35;
    orbitalRing2.rotation.z = Math.PI * 0.2;
    worldGroup.add(orbitalRing2);

    // -------------------------------------------------------------------------
    // 6. Ambient Floating Data Stars / Tech Particles
    // -------------------------------------------------------------------------
    const ambientCount = 140;
    const ambPositions = new Float32Array(ambientCount * 3);
    for (let i = 0; i < ambientCount; i++) {
      const r = GLOBE_RADIUS * (1.3 + Math.random() * 1.1);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      ambPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      ambPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      ambPositions[i * 3 + 2] = r * Math.cos(phi);
    }
    const ambGeo = new THREE.BufferGeometry();
    ambGeo.setAttribute('position', new THREE.BufferAttribute(ambPositions, 3));
    const ambMat = new THREE.PointsMaterial({
      size: 3.0,
      color: 0x0284c7,
      transparent: true,
      opacity: 0.45,
      map: particleTexture,
      depthWrite: false
    });
    const ambientParticles = new THREE.Points(ambGeo, ambMat);
    worldGroup.add(ambientParticles);

    // -------------------------------------------------------------------------
    // 7. Interactive Controls: Mouse Drag & Parallax Spring Physics
    // -------------------------------------------------------------------------
    let targetRotationX = 0.22;
    let targetRotationY = -0.35;
    let isDragging = false;
    let previousPointerPosition = { x: 0, y: 0 };

    function updateGlobePosition() {
      if (window.innerWidth > 992) {
        worldGroup.position.set(width * 0.24, -15, 0);
        worldGroup.scale.set(1.15, 1.15, 1.15);
      } else {
        worldGroup.position.set(0, 0, 0);
        worldGroup.scale.set(0.9, 0.9, 0.9);
      }
    }
    updateGlobePosition();

    function onPointerMove(e) {
      const rect = heroSection.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (isDragging) {
        const deltaX = x - previousPointerPosition.x;
        const deltaY = y - previousPointerPosition.y;

        targetRotationY += deltaX * 0.007;
        targetRotationX += deltaY * 0.007;

        previousPointerPosition = { x, y };
      } else {
        const nx = (x / rect.width) * 2 - 1;
        const ny = (y / rect.height) * 2 - 1;
        targetRotationY = -0.35 + nx * 0.45;
        targetRotationX = 0.22 - ny * 0.35;
      }
    }

    function onPointerDown(e) {
      // Don't intercept clicks on interactive buttons, links, inputs, and sandbox panes
      if (e.target.closest('button, a, input, select, textarea, .sandbox-content, .sandbox-tabs, .hero-actions')) {
        return;
      }
      isDragging = true;
      const rect = heroSection.getBoundingClientRect();
      previousPointerPosition = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }

    function onPointerUp() {
      isDragging = false;
    }

    heroSection.addEventListener('pointerleave', () => {
      isDragging = false;
    });
    heroSection.addEventListener('pointermove', onPointerMove, { passive: true });
    heroSection.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);

    // -------------------------------------------------------------------------
    // 8. Responsive Resize Handler
    // -------------------------------------------------------------------------
    function onWindowResize() {
      if (!heroSection || !renderer || !camera) return;
      width = heroSection.offsetWidth;
      height = heroSection.offsetHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      updateGlobePosition();
    }
    window.addEventListener('resize', onWindowResize);

    // -------------------------------------------------------------------------
    // 9. Visibility Observer (Pause when scrolled out of view)
    // -------------------------------------------------------------------------
    let isVisible = true;
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
        });
      }, { threshold: 0.05 });
      observer.observe(heroSection);
    }

    // -------------------------------------------------------------------------
    // 10. High-Performance Render Loop
    // -------------------------------------------------------------------------
    let clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);

      if (!isVisible) return;

      const elapsedTime = clock.getElapsedTime();

      // Continuous autonomous rotation when not actively dragging
      if (!isDragging) {
        targetRotationY += 0.0018;
      }

      // Smooth damping interpolation (Spring physics)
      worldGroup.rotation.y += (targetRotationY - worldGroup.rotation.y) * 0.06;
      worldGroup.rotation.x += (targetRotationX - worldGroup.rotation.x) * 0.06;

      // Animate Orbital Rings
      orbitalRing1.rotation.z += 0.003;
      orbitalRing2.rotation.z -= 0.002;

      // Ambient particles slow drift
      ambientParticles.rotation.y -= 0.0006;

      // Pulse Cloud Hubs
      hubMeshes.forEach((item) => {
        const pulse = Math.sin(elapsedTime * 3.5 + item.seed) * 0.35 + 1.1;
        item.ring.scale.set(pulse, pulse, pulse);
        item.ring.material.opacity = 0.55 - (pulse - 1.0) * 0.4;
      });

      // Advance Data Arc Packets
      dataArcs.forEach((arc) => {
        arc.progress = (arc.progress + arc.speed) % 1.0;
        const currentPos = arc.curve.getPointAt(arc.progress);
        arc.mesh.position.copy(currentPos);
      });

      renderer.render(scene, camera);
    }

    animate();
  }

  // Self-initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHero3D);
  } else {
    initHero3D();
  }
})();
