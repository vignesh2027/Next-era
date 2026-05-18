/* ============================================
   NEXT ERA — 30-second cinematic intro + scene
   Continuous spin throughout, multi-phase lighting
   ============================================ */
(function () {
  const canvas = document.getElementById('three-canvas');
  if (!canvas || !window.THREE) return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0a0807, 0.018);

  const camera = new THREE.PerspectiveCamera(34, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 1.3, 7);
  camera.lookAt(0, 0.6, 0);

  /* ---------- LIGHTS ---------- */
  const ambient = new THREE.AmbientLight(0x1a1410, 0.5);
  scene.add(ambient);

  const key = new THREE.PointLight(0xEFD194, 0, 28, 1.4);
  key.position.set(3, 4, 3);
  scene.add(key);

  const fill = new THREE.PointLight(0xC9A96E, 0, 22, 1.6);
  fill.position.set(-3.5, 1.8, 2.2);
  scene.add(fill);

  const rim = new THREE.PointLight(0x97703A, 0, 24, 1.6);
  rim.position.set(0, 2.5, -4);
  scene.add(rim);

  // Hero spotlight that orbits the robot the entire intro
  const heroLight = new THREE.PointLight(0xEFD194, 8, 16, 1.6);
  heroLight.position.set(0, 2, 3);
  scene.add(heroLight);

  /* ---------- GROUND DISC + RING ---------- */
  const groundMat = new THREE.MeshBasicMaterial({
    color: 0x14100a, transparent: true, opacity: 0,
  });
  const ground = new THREE.Mesh(new THREE.CircleGeometry(10, 80), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.45;
  scene.add(ground);

  const ringGeom = new THREE.RingGeometry(1.5, 1.55, 80);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xC9A96E, transparent: true, opacity: 0, side: THREE.DoubleSide,
  });
  const ring = new THREE.Mesh(ringGeom, ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = -0.44;
  scene.add(ring);

  const ringGeom2 = new THREE.RingGeometry(2.2, 2.22, 80);
  const ringMat2 = new THREE.MeshBasicMaterial({
    color: 0xC9A96E, transparent: true, opacity: 0, side: THREE.DoubleSide,
  });
  const ring2 = new THREE.Mesh(ringGeom2, ringMat2);
  ring2.rotation.x = -Math.PI / 2;
  ring2.position.y = -0.44;
  scene.add(ring2);

  /* ---------- MATERIALS ---------- */
  const goldEdge = new THREE.LineBasicMaterial({ color: 0xC9A96E, transparent: true, opacity: 0 });
  const solidMat = new THREE.MeshStandardMaterial({
    color: 0xECE4D5, roughness: 0.28, metalness: 0.88,
    transparent: true, opacity: 0,
  });
  const accentMat = new THREE.MeshStandardMaterial({
    color: 0xC9A96E, roughness: 0.22, metalness: 0.96,
    transparent: true, opacity: 0,
  });
  const darkMat = new THREE.MeshStandardMaterial({
    color: 0x1a1612, roughness: 0.55, metalness: 0.7,
    transparent: true, opacity: 0,
  });
  const eyeMatL = new THREE.MeshStandardMaterial({
    color: 0xC9A96E, emissive: 0xEFD194, emissiveIntensity: 0,
    roughness: 0.1, metalness: 1.0, transparent: true, opacity: 0,
  });
  const eyeMatR = eyeMatL.clone();
  const eyeMat = new THREE.MeshStandardMaterial({
    color: 0xC9A96E, emissive: 0xC9A96E, emissiveIntensity: 0,
    roughness: 0.15, metalness: 1.0, transparent: true, opacity: 0,
  });

  /* ---------- ROBOT ASSEMBLY ---------- */
  const root = new THREE.Group();
  scene.add(root);

  // robot pivots around its own Y
  const robot = new THREE.Group();
  root.add(robot);

  const parts = [];
  const randOffset = () => {
    const r = 5 + Math.random() * 4;
    const a = Math.random() * Math.PI * 2;
    const b = (Math.random() - 0.5) * Math.PI;
    return new THREE.Vector3(Math.cos(a) * r, b * 3, Math.sin(a) * r);
  };

  function addPart(geom, mat, pos, rot, delay) {
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.copy(pos);
    if (rot) mesh.rotation.copy(rot);
    robot.add(mesh);

    const wire = new THREE.LineSegments(
      new THREE.EdgesGeometry(geom, 28),
      goldEdge.clone()
    );
    wire.material.transparent = true;
    wire.material.opacity = 0;
    mesh.add(wire);

    parts.push({
      mesh, wire,
      restPos: pos.clone(),
      restRot: rot ? rot.clone() : new THREE.Euler(),
      fromPos: randOffset(),
      delay,
    });
    return mesh;
  }

  const E = THREE.Euler;
  const V = (x, y, z) => new THREE.Vector3(x, y, z);

  // Feet
  addPart(new THREE.BoxGeometry(0.36, 0.13, 0.6), darkMat, V(-0.22, -0.34, 0.06), null, 0.0);
  addPart(new THREE.BoxGeometry(0.36, 0.13, 0.6), darkMat, V( 0.22, -0.34, 0.06), null, 0.05);
  // Ankle accents
  addPart(new THREE.TorusGeometry(0.09, 0.025, 8, 16), accentMat, V(-0.22, -0.22, 0.0), new E(Math.PI/2, 0, 0), 0.08);
  addPart(new THREE.TorusGeometry(0.09, 0.025, 8, 16), accentMat, V( 0.22, -0.22, 0.0), new E(Math.PI/2, 0, 0), 0.10);
  // Lower legs
  addPart(new THREE.CylinderGeometry(0.14, 0.12, 0.6, 16), solidMat, V(-0.22, 0.0, 0), null, 0.18);
  addPart(new THREE.CylinderGeometry(0.14, 0.12, 0.6, 16), solidMat, V( 0.22, 0.0, 0), null, 0.22);
  // Knee
  addPart(new THREE.TorusGeometry(0.14, 0.04, 10, 20), accentMat, V(-0.22, 0.32, 0), new E(Math.PI/2, 0, 0), 0.30);
  addPart(new THREE.TorusGeometry(0.14, 0.04, 10, 20), accentMat, V( 0.22, 0.32, 0), new E(Math.PI/2, 0, 0), 0.32);
  // Upper legs
  addPart(new THREE.CylinderGeometry(0.16, 0.14, 0.55, 16), solidMat, V(-0.22, 0.62, 0), null, 0.40);
  addPart(new THREE.CylinderGeometry(0.16, 0.14, 0.55, 16), solidMat, V( 0.22, 0.62, 0), null, 0.42);
  // Pelvis
  addPart(new THREE.BoxGeometry(0.72, 0.22, 0.42), darkMat, V(0, 0.93, 0), null, 0.55);
  // Belt accent
  addPart(new THREE.BoxGeometry(0.78, 0.04, 0.44), accentMat, V(0, 1.04, 0), null, 0.60);
  // Torso
  addPart(new THREE.BoxGeometry(0.88, 0.85, 0.52), solidMat, V(0, 1.45, 0), null, 0.68);
  // Chest plate
  addPart(new THREE.BoxGeometry(0.58, 0.58, 0.06), accentMat, V(0, 1.5, 0.28), null, 0.78);
  // Chest core
  addPart(new THREE.CylinderGeometry(0.12, 0.12, 0.06, 28), eyeMat, V(0, 1.5, 0.33), new E(Math.PI/2, 0, 0), 0.88);
  addPart(new THREE.CylinderGeometry(0.05, 0.05, 0.08, 24), eyeMat, V(0, 1.5, 0.35), new E(Math.PI/2, 0, 0), 0.92);
  // Shoulders
  addPart(new THREE.SphereGeometry(0.19, 20, 14), accentMat, V(-0.57, 1.78, 0), null, 0.95);
  addPart(new THREE.SphereGeometry(0.19, 20, 14), accentMat, V( 0.57, 1.78, 0), null, 0.98);
  // Upper arms
  addPart(new THREE.CylinderGeometry(0.10, 0.09, 0.55, 14), solidMat, V(-0.64, 1.42, 0), null, 1.05);
  addPart(new THREE.CylinderGeometry(0.10, 0.09, 0.55, 14), solidMat, V( 0.64, 1.42, 0), null, 1.08);
  // Elbows
  addPart(new THREE.SphereGeometry(0.11, 16, 12), darkMat, V(-0.64, 1.1, 0), null, 1.15);
  addPart(new THREE.SphereGeometry(0.11, 16, 12), darkMat, V( 0.64, 1.1, 0), null, 1.17);
  // Forearms
  addPart(new THREE.CylinderGeometry(0.09, 0.085, 0.5, 14), solidMat, V(-0.64, 0.78, 0), null, 1.25);
  addPart(new THREE.CylinderGeometry(0.09, 0.085, 0.5, 14), solidMat, V( 0.64, 0.78, 0), null, 1.28);
  // Hands
  addPart(new THREE.BoxGeometry(0.17, 0.20, 0.13), darkMat, V(-0.64, 0.44, 0), null, 1.38);
  addPart(new THREE.BoxGeometry(0.17, 0.20, 0.13), darkMat, V( 0.64, 0.44, 0), null, 1.4);
  // Neck
  addPart(new THREE.CylinderGeometry(0.085, 0.085, 0.18, 14), darkMat, V(0, 1.97, 0), null, 1.5);
  // Head
  addPart(new THREE.BoxGeometry(0.52, 0.36, 0.52), solidMat, V(0, 2.24, 0), null, 1.6);
  // Face plate
  addPart(new THREE.BoxGeometry(0.44, 0.30, 0.04), accentMat, V(0, 2.24, 0.27), null, 1.7);
  // Antenna
  addPart(new THREE.CylinderGeometry(0.02, 0.02, 0.18, 12), accentMat, V(0, 2.52, 0), null, 1.78);
  addPart(new THREE.SphereGeometry(0.04, 18, 14), eyeMat, V(0, 2.63, 0), null, 1.82);
  // Eyes
  const eyeL = addPart(new THREE.SphereGeometry(0.05, 18, 14), eyeMatL, V(-0.11, 2.26, 0.28), null, 1.92);
  const eyeR = addPart(new THREE.SphereGeometry(0.05, 18, 14), eyeMatR, V( 0.11, 2.26, 0.28), null, 1.94);
  // Mouth-grille
  addPart(new THREE.BoxGeometry(0.18, 0.04, 0.03), darkMat, V(0, 2.16, 0.28), null, 2.0);

  // Initialise all parts offset + invisible
  parts.forEach(p => {
    p.mesh.position.copy(p.fromPos);
    p.mesh.scale.setScalar(0.001);
  });

  const wireMats = parts.map(p => p.wire.material);
  const allMats = [solidMat, accentMat, darkMat, eyeMat, eyeMatL, eyeMatR];

  /* ---------- INTRO STATE ---------- */
  const INTRO_DURATION = 30; // seconds
  const introState = {
    t0: 0,
    started: false,
    finished: false,
  };

  function startIntro() {
    introState.t0 = performance.now();
    introState.started = true;
  }

  /* ---------- ANIMATION LOOP ---------- */
  let scrollProgress = 0;
  let mouseX = 0, mouseY = 0;

  function smoothstep(a, b, x) {
    const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  }

  function animate() {
    requestAnimationFrame(animate);
    const now = performance.now();

    if (introState.started && !introState.finished) {
      const t = (now - introState.t0) / 1000;
      const T = Math.min(t, INTRO_DURATION);

      /* Continuous spin throughout intro — eases from slow to faster */
      const spinSpeed = 0.4 + smoothstep(0, 15, T) * 1.0;
      robot.rotation.y += (spinSpeed * 0.016);

      /* Robot bob & subtle floor rise */
      robot.position.y = -0.6 + smoothstep(2, 8, T) * 0.6 + Math.sin(T * 0.7) * 0.04;

      /* Orbiting hero light */
      const orbitR = 3.2;
      heroLight.position.x = Math.cos(T * 1.1) * orbitR;
      heroLight.position.z = Math.sin(T * 1.1) * orbitR + 1.0;
      heroLight.position.y = 1.6 + Math.sin(T * 0.8) * 0.8;
      heroLight.intensity = 6 + Math.sin(T * 2.5) * 2;

      /* Key/fill/rim ramp in over first 12s */
      const lampRamp = smoothstep(2, 12, T);
      key.intensity = 24 * lampRamp;
      fill.intensity = 10 * lampRamp;
      rim.intensity = 14 * lampRamp;

      /* Ground + rings */
      groundMat.opacity = smoothstep(3, 8, T) * 0.6;
      ringMat.opacity = smoothstep(2, 6, T) * 0.55 * (0.6 + 0.4 * Math.sin(T * 1.5));
      ringMat2.opacity = smoothstep(3, 7, T) * 0.35 * (0.6 + 0.4 * Math.sin(T * 1.5 + 1));
      ring.rotation.z += 0.003;
      ring2.rotation.z -= 0.002;

      /* PHASE 1 — wireframe assembly (1.5s → 7s) */
      if (T >= 1.0) {
        parts.forEach((p) => {
          const localT = T - 1.0 - p.delay * 0.7;
          if (localT > 0) {
            const k = Math.min(1, localT / 1.2);
            const eased = 1 - Math.pow(1 - k, 3);
            p.mesh.position.lerpVectors(p.fromPos, p.restPos, eased);
            p.mesh.scale.setScalar(0.001 + eased * 1);
            // wireframe pulses on entry
            const pulse = 0.5 + 0.5 * Math.sin((T - 1.0) * 6);
            p.wire.material.opacity = Math.min(1, eased) * (0.55 + 0.45 * pulse);
          }
        });
      }

      /* PHASE 2 — solidify (8s → 14s) */
      if (T >= 8.0) {
        const k = smoothstep(8, 14, T);
        solidMat.opacity = k;
        accentMat.opacity = k;
        darkMat.opacity = k;
        eyeMat.opacity = k;
        eyeMatL.opacity = k;
        eyeMatR.opacity = k;
        // wireframe fades out
        wireMats.forEach(m => m.opacity = (1 - k) * 0.9);
      }

      /* PHASE 3 — fog clears (14s → 22s) */
      if (T >= 14.0) {
        const k = smoothstep(14, 22, T);
        scene.fog.density = 0.018 - k * 0.015;
      }

      /* PHASE 4 — eye glow ramps (18s → 26s) */
      if (T >= 18.0) {
        const k = smoothstep(18, 26, T);
        const pulse = 0.75 + 0.25 * Math.sin(T * 6);
        eyeMatL.emissiveIntensity = k * 3.5 * pulse;
        eyeMatR.emissiveIntensity = k * 3.5 * pulse;
        eyeMat.emissiveIntensity = k * 2.0 * pulse;
      }

      /* PHASE 5 — camera dolly forward (8s → 22s) */
      if (T >= 8.0) {
        const k = smoothstep(8, 22, T);
        const eased = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
        camera.position.z = 7 - eased * 3.2;
        camera.position.y = 1.3 - eased * 0.05;
      }

      /* Slight final pose at the very end (28s → 30s) — slow the spin */
      if (T >= 28.0) {
        const k = smoothstep(28, 30, T);
        // gradually align robot to face camera by lerping rotation
        // (we don't snap; let it keep rotating but slower)
      }

      if (T >= INTRO_DURATION) {
        introState.finished = true;
      }
    } else {
      /* ---- AFTER intro: ambient rotation tied to scroll + idle drift ---- */
      // Slow constant rotation
      robot.rotation.y += 0.0035 + scrollProgress * 0.01;
      robot.position.y = 0 + Math.sin(now * 0.0009) * 0.04;

      // gentle eye pulse
      const pulse = 0.7 + 0.3 * Math.sin(now * 0.005);
      eyeMatL.emissiveIntensity = 3.2 * pulse;
      eyeMatR.emissiveIntensity = 3.2 * pulse;

      // Camera based on scroll progress (clamped)
      const zTarget = 3.5 + Math.min(scrollProgress, 1.5) * 2.5;
      camera.position.z += (zTarget - camera.position.z) * 0.06;
      // ring rotation continues
      ring.rotation.z += 0.002;
      ring2.rotation.z -= 0.0015;
    }

    /* Mouse parallax on camera (subtle) */
    camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.04;
    camera.lookAt(0, 1.3, 0);

    renderer.render(scene, camera);
  }

  /* ---------- RESIZE ---------- */
  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', onResize);

  /* ---------- INPUT ---------- */
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = (e.clientY / window.innerHeight) * 2 - 1;
  });
  window.addEventListener('scroll', () => {
    const h = window.innerHeight;
    scrollProgress = Math.max(0, window.scrollY / h);
  });

  /* ---------- PUBLIC HOOK ---------- */
  window.NEXUS_SCENE = {
    startIntro,
    skip: () => {
      introState.finished = true;
      introState.started = true;
      wireMats.forEach(m => m.opacity = 0);
      allMats.forEach(m => m.opacity = 1);
      eyeMat.emissiveIntensity = 1.8;
      eyeMatL.emissiveIntensity = 3.2;
      eyeMatR.emissiveIntensity = 3.2;
      parts.forEach(p => { p.mesh.position.copy(p.restPos); p.mesh.scale.setScalar(1); });
      scene.fog.density = 0.003;
      camera.position.z = 3.8;
      key.intensity = 24;
      fill.intensity = 10;
      rim.intensity = 14;
      groundMat.opacity = 0.6;
      ringMat.opacity = 0.4;
      ringMat2.opacity = 0.3;
      robot.position.y = 0;
    },
    isFinished: () => introState.finished,
  };

  animate();
})();
