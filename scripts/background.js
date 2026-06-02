// Three.js Background Animation - Scroll-Linked Morphing Particle Field
document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.querySelector("#canvas3d");

  // Safety check to verify Three.js and Canvas exist
  if (!canvas || typeof THREE === "undefined") {
    console.warn("Three.js not loaded or canvas #canvas3d not found. Background animation disabled.");
    return;
  }

  // Scene Setup
  const scene = new THREE.Scene();

  // Camera
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 20;

  // Renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Particle Setup
  const isMobile = window.innerWidth <= 768;
  const particlesGeometry = new THREE.BufferGeometry();
  const particlesCount = isMobile ? 250 : 600; // Performance friendly count

  // Coordinates Arrays
  const randomPos = new Float32Array(particlesCount * 3);
  const spherePos = new Float32Array(particlesCount * 3);
  const helixPos = new Float32Array(particlesCount * 3);
  const torusPos = new Float32Array(particlesCount * 3);
  const currentPos = new Float32Array(particlesCount * 3);
  
  const colorArray = new Float32Array(particlesCount * 3);
  const scaleArray = new Float32Array(particlesCount);

  // Generate layouts
  for (let i = 0; i < particlesCount; i++) {
    const i3 = i * 3;

    // 1. Random Space Galaxy Dust (Home Section)
    randomPos[i3] = (Math.random() - 0.5) * 45;
    randomPos[i3 + 1] = (Math.random() - 0.5) * 45;
    randomPos[i3 + 2] = (Math.random() - 0.5) * 45;

    // 2. Revolving Sphere (About Section)
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);
    const sphereRadius = 14;
    spherePos[i3] = sphereRadius * Math.sin(phi) * Math.cos(theta);
    spherePos[i3 + 1] = sphereRadius * Math.sin(phi) * Math.sin(theta);
    spherePos[i3 + 2] = sphereRadius * Math.cos(phi);

    // 3. Double Helix (Skills / Experience Section)
    const helixRadius = 5.5;
    const helixHeight = 35;
    const t = i / particlesCount;
    const angle = t * Math.PI * 18; // Spiral twists
    const strand = (i % 2 === 0) ? 1 : -1;
    helixPos[i3] = Math.cos(angle) * helixRadius * strand;
    helixPos[i3 + 1] = (t - 0.5) * helixHeight;
    helixPos[i3 + 2] = Math.sin(angle) * helixRadius * strand;

    // 4. Torus Ring (Contact Section)
    const torusRadius = 11;
    const tubeRadius = 3.5;
    const u = Math.random() * Math.PI * 2;
    const v = Math.random() * Math.PI * 2;
    torusPos[i3] = (torusRadius + tubeRadius * Math.cos(v)) * Math.cos(u);
    torusPos[i3 + 1] = (torusRadius + tubeRadius * Math.cos(v)) * Math.sin(u);
    torusPos[i3 + 2] = tubeRadius * Math.sin(v);

    // Initialize with Galaxy positions
    currentPos[i3] = randomPos[i3];
    currentPos[i3 + 1] = randomPos[i3 + 1];
    currentPos[i3 + 2] = randomPos[i3 + 2];

    scaleArray[i] = Math.random();
  }

  particlesGeometry.setAttribute("position", new THREE.BufferAttribute(currentPos, 3));
  particlesGeometry.setAttribute("color", new THREE.BufferAttribute(colorArray, 3));
  particlesGeometry.setAttribute("aScale", new THREE.BufferAttribute(scaleArray, 1));

  // Dynamic Radial Gradient Texture
  const getTexture = () => {
    const texCanvas = document.createElement("canvas");
    texCanvas.width = 32;
    texCanvas.height = 32;
    const ctx = texCanvas.getContext("2d");
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, "rgba(255, 255, 255, 1)");
    grad.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);

    const texture = new THREE.Texture(texCanvas);
    texture.needsUpdate = true;
    return texture;
  };

  const particlesMaterial = new THREE.PointsMaterial({
    size: 0.16,
    map: getTexture(),
    transparent: true,
    opacity: 0.85,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });

  const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);

  // Group for mouse parallax
  const mouseGroup = new THREE.Group();
  scene.add(mouseGroup);
  mouseGroup.add(particlesMesh);

  // Particle Colors matching Theme
  const updateParticleColors = () => {
    const isLight = document.documentElement.getAttribute("data-theme") === "light";
    let c1, c2, c3;

    if (isLight) {
      // Light Theme Colors (Darker and richer to be visible)
      c1 = new THREE.Color("#4f46e5"); // Indigo 600
      c2 = new THREE.Color("#7e22ce"); // Purple 700
      c3 = new THREE.Color("#db2777"); // Pink 600
      particlesMaterial.blending = THREE.NormalBlending;
      particlesMaterial.opacity = 0.75;
    } else {
      // Dark Theme Colors (Glowing neon shades)
      c1 = new THREE.Color("#6366f1"); // Indigo 500
      c2 = new THREE.Color("#a855f7"); // Purple 500
      c3 = new THREE.Color("#06b6d4"); // Cyan 500
      particlesMaterial.blending = THREE.AdditiveBlending;
      particlesMaterial.opacity = 0.85;
    }

    const colors = particlesGeometry.attributes.color.array;
    for (let i = 0; i < particlesCount * 3; i += 3) {
      const randVal = Math.random();
      let chosenColor;
      if (randVal < 0.4) chosenColor = c1;
      else if (randVal < 0.75) chosenColor = c2;
      else chosenColor = c3;

      colors[i] = chosenColor.r;
      colors[i + 1] = chosenColor.g;
      colors[i + 2] = chosenColor.b;
    }

    particlesGeometry.attributes.color.needsUpdate = true;
    particlesMaterial.needsUpdate = true;
  };

  updateParticleColors();

  // Listen for theme attribute mutations
  const themeObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "attributes" && mutation.attributeName === "data-theme") {
        updateParticleColors();
      }
    });
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  // Mouse Parallax Trackers
  const windowHalfX = window.innerWidth / 2;
  const windowHalfY = window.innerHeight / 2;
  let targetRotationX = 0;
  let targetRotationY = 0;

  document.addEventListener("mousemove", (event) => {
    targetRotationY = (event.clientX - windowHalfX) * 0.0006;
    targetRotationX = (event.clientY - windowHalfY) * 0.0006;
  });

  // Scroll Morphing Setup
  let targetScrollPercent = 0;
  let currentScrollPercent = 0;
  let lastScrollPercent = -1;
  let scrollMax = document.body.scrollHeight - window.innerHeight;

  const handleScroll = () => {
    if (scrollMax > 0) {
      targetScrollPercent = window.scrollY / scrollMax;
    } else {
      targetScrollPercent = 0;
    }
  };

  window.addEventListener("scroll", handleScroll, { passive: true });

  // Render & Animation Loop
  const tick = () => {
    // Smooth interpolation for scroll progress (Lerp)
    const scrollDiff = targetScrollPercent - currentScrollPercent;
    if (Math.abs(scrollDiff) > 0.0001) {
      currentScrollPercent += scrollDiff * 0.06;
    } else {
      currentScrollPercent = targetScrollPercent;
    }

    // Smooth interpolation for mouse parallax
    mouseGroup.rotation.x += (targetRotationX - mouseGroup.rotation.x) * 0.05;
    mouseGroup.rotation.y += (targetRotationY - mouseGroup.rotation.y) * 0.05;

    // Smooth camera zoom/dive links
    camera.position.y += (-currentScrollPercent * 18 - camera.position.y) * 0.05;
    camera.position.z += ((20 - currentScrollPercent * 12) - camera.position.z) * 0.05;

    // Continuous slow background rotation
    particlesMesh.rotation.y += 0.0008;
    particlesMesh.rotation.x += 0.0003;

    // Only update position buffer if shape morph progress actually changed
    if (Math.abs(currentScrollPercent - lastScrollPercent) > 0.00005) {
      // Interpolate positions between Galaxy Dust -> Sphere -> Helix -> Torus
      let progress = 0;
      let fromPos, toPos;

      if (currentScrollPercent < 0.33) {
        // Phase 1: Galaxy -> Sphere
        progress = currentScrollPercent / 0.33;
        fromPos = randomPos;
        toPos = spherePos;
      } else if (currentScrollPercent < 0.66) {
        // Phase 2: Sphere -> Helix
        progress = (currentScrollPercent - 0.33) / 0.33;
        fromPos = spherePos;
        toPos = helixPos;
      } else {
        // Phase 3: Helix -> Torus
        progress = (currentScrollPercent - 0.66) / 0.34;
        fromPos = helixPos;
        toPos = torusPos;
      }

      // Clamp progress between 0 and 1
      progress = Math.max(0, Math.min(1, progress));

      // Smoothstep easing for an organic warp feeling
      const easeT = progress * progress * (3 - 2 * progress);

      const positions = particlesGeometry.attributes.position.array;
      for (let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;
        positions[i3] = fromPos[i3] + (toPos[i3] - fromPos[i3]) * easeT;
        positions[i3 + 1] = fromPos[i3 + 1] + (toPos[i3 + 1] - fromPos[i3 + 1]) * easeT;
        positions[i3 + 2] = fromPos[i3 + 2] + (toPos[i3 + 2] - fromPos[i3 + 2]) * easeT;
      }
      particlesGeometry.attributes.position.needsUpdate = true;
      lastScrollPercent = currentScrollPercent;
    }

    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
  };

  tick();

  // Resize Handler
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    scrollMax = document.body.scrollHeight - window.innerHeight;
  });
});
