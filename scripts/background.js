// Three.js Background Animation
/* 
  Creates a "La Rose" inspired atmospheric particle field.
  Features:
  - Slow floating particles (Stars/Dust)
  - Subtle mouse interaction (Parallax)
  - Theme Awareness (Dark vs Light Mode)
*/

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.querySelector("#canvas3d");

  // Safety check
  if (!canvas) return;

  // Scene Setup
  const scene = new THREE.Scene();

  // Camera
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
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

  // --- PARTICLES ---
  const particlesGeometry = new THREE.BufferGeometry();
  const particlesCount = 700;

  const posArray = new Float32Array(particlesCount * 3);
  const colorArray = new Float32Array(particlesCount * 3); // Dynamic colors
  const scaleArray = new Float32Array(particlesCount);

  for (let i = 0; i < particlesCount * 3; i += 3) {
    posArray[i] = (Math.random() - 0.5) * 45;
    posArray[i + 1] = (Math.random() - 0.5) * 45;
    posArray[i + 2] = (Math.random() - 0.5) * 45;

    scaleArray[i / 3] = Math.random();
  }

  particlesGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(posArray, 3),
  );
  particlesGeometry.setAttribute(
    "color",
    new THREE.BufferAttribute(colorArray, 3),
  );
  particlesGeometry.setAttribute(
    "aScale",
    new THREE.BufferAttribute(scaleArray, 1),
  );

  // Texture
  const getTexture = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext("2d");
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);

    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
  };

  const particlesMaterial = new THREE.PointsMaterial({
    size: 0.15,
    map: getTexture(),
    transparent: true,
    opacity: 0.8,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });

  const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particlesMesh);

  // --- THEME COLOR LOGIC ---
  const updateParticleColors = () => {
    // Check current actual theme from body or localStorage
    // Note: The toggle script sets attribute on the theme-toggle div, but styles apply based on body/root usually.
    // Let's check the theme toggle state.
    const themeToggle = document.querySelector(".theme-toggle");
    const isLight = themeToggle
      ? themeToggle.getAttribute("data-active") === "light"
      : false;

    // Colors
    let c1, c2, c3;

    if (isLight) {
      // LIGHT MODE COLORS: Needs to be darker/colorful to show on white
      c1 = new THREE.Color("#4f46e5"); // Indigo 600
      c2 = new THREE.Color("#9333ea"); // Purple 600
      c3 = new THREE.Color("#0f172a"); // Slate 900 (Dark specks)
      particlesMaterial.blending = THREE.NormalBlending; // Better visibility on light
      particlesMaterial.opacity = 0.7;
    } else {
      // DARK MODE COLORS: Glowing light colors
      c1 = new THREE.Color("#6366f1"); // Indigo 500
      c2 = new THREE.Color("#a855f7"); // Purple 500
      c3 = new THREE.Color("#ffffff"); // White sparkles
      particlesMaterial.blending = THREE.AdditiveBlending; // Glow
      particlesMaterial.opacity = 0.8;
    }

    const colors = particlesGeometry.attributes.color.array;

    for (let i = 0; i < particlesCount * 3; i += 3) {
      const mixedColor = Math.random();
      let selectedColor;

      if (mixedColor < 0.33) selectedColor = c1;
      else if (mixedColor < 0.66) selectedColor = c2;
      else selectedColor = c3;

      colors[i] = selectedColor.r;
      colors[i + 1] = selectedColor.g;
      colors[i + 2] = selectedColor.b;
    }

    particlesGeometry.attributes.color.needsUpdate = true;
    particlesMaterial.needsUpdate = true;
  };

  // Initial Set
  updateParticleColors();

  // Listen for Theme Changes (Observer)
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "data-active"
      ) {
        updateParticleColors();
      }
    });
  });

  const themeToggle = document.querySelector(".theme-toggle");
  if (themeToggle) {
    observer.observe(themeToggle, { attributes: true });
  }

  // Mouse Interaction
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;

  const windowHalfX = window.innerWidth / 2;
  const windowHalfY = window.innerHeight / 2;

  document.addEventListener("mousemove", (event) => {
    mouseX = event.clientX - windowHalfX;
    mouseY = event.clientY - windowHalfY;
  });

  // Scroll Interaction
  let scrollY = 0;
  window.addEventListener("scroll", () => {
    scrollY = window.scrollY;
  });

  const clock = new THREE.Clock();

  const tick = () => {
    targetX = mouseX * 0.001;
    targetY = mouseY * 0.001;
    const elapsedTime = clock.getElapsedTime();

    particlesMesh.rotation.y = 0.1 * elapsedTime;
    particlesMesh.rotation.x = 0.05 * elapsedTime;

    particlesMesh.rotation.y += 0.5 * (targetX - particlesMesh.rotation.y);
    particlesMesh.rotation.x += 0.5 * (targetY - particlesMesh.rotation.x);

    camera.position.y = -scrollY * 0.01;

    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
  };
  tick();

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
});
