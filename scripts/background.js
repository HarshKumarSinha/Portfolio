// Three.js Background Animation
/* 
  Creates a "La Rose" inspired dark atmospheric particle field.
  Features:
  - Slow floating particles (Stars/Dust)
  - Subtle mouse interaction (Parallax)
  - Elegant color palette matching the site
*/

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.querySelector("#canvas3d");

  // Safety check
  if (!canvas) return;

  // Scene Setup
  const scene = new THREE.Scene();
  // Transparent background handled by renderer alpha:true

  // Camera
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );
  camera.position.z = 20; // Move back to see the field

  // Renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true, // Allow CSS background to show through (gradients)
    antialias: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // --- PARTICLES ---
  const particlesGeometry = new THREE.BufferGeometry();
  const particlesCount = 700; // Elegant density

  const posArray = new Float32Array(particlesCount * 3);
  const colorArray = new Float32Array(particlesCount * 3);
  const scaleArray = new Float32Array(particlesCount);

  // Colors: Indigo (#6366f1) and Purple (#a855f7)
  const color1 = new THREE.Color("#6366f1");
  const color2 = new THREE.Color("#a855f7");
  const color3 = new THREE.Color("#ffffff"); // Sparkles

  for (let i = 0; i < particlesCount * 3; i += 3) {
    // Random Spread
    posArray[i] = (Math.random() - 0.5) * 45; // x
    posArray[i + 1] = (Math.random() - 0.5) * 45; // y
    posArray[i + 2] = (Math.random() - 0.5) * 45; // z

    // Randomly pick a color
    const mixedColor = Math.random();
    if (mixedColor < 0.33) {
      colorArray[i] = color1.r;
      colorArray[i + 1] = color1.g;
      colorArray[i + 2] = color1.b;
    } else if (mixedColor < 0.66) {
      colorArray[i] = color2.r;
      colorArray[i + 1] = color2.g;
      colorArray[i + 2] = color2.b;
    } else {
      colorArray[i] = color3.r;
      colorArray[i + 1] = color3.g;
      colorArray[i + 2] = color3.b;
    }

    // Random sizes
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
  ); // for shader if needed

  // Create Circular Texture for soft particles
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
    vertexColors: true, // Enable per-particle colors
    blending: THREE.AdditiveBlending,
    depthWrite: false, // Don't occlude other particles
    sizeAttenuation: true,
  });

  const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particlesMesh);

  // Mouse Interaction
  let mouseX = 0;
  let mouseY = 0;

  let targetX = 0;
  let targetY = 0;

  const windowHalfX = window.innerWidth / 2;
  const windowHalfY = window.innerHeight / 2;

  const onDocumentMouseMove = (event) => {
    mouseX = event.clientX - windowHalfX;
    mouseY = event.clientY - windowHalfY;
  };

  document.addEventListener("mousemove", onDocumentMouseMove);

  // Scroll Interaction
  let scrollY = 0;
  window.addEventListener("scroll", () => {
    scrollY = window.scrollY;
  });

  // Animation Loop
  const clock = new THREE.Clock();

  const tick = () => {
    targetX = mouseX * 0.001;
    targetY = mouseY * 0.001;

    const elapsedTime = clock.getElapsedTime();

    // Constant Slow Rotation (Nebula feel)
    particlesMesh.rotation.y = 0.1 * elapsedTime;
    particlesMesh.rotation.x = 0.05 * elapsedTime;

    // Mouse Parallax (Ease)
    particlesMesh.rotation.y += 0.5 * (targetX - particlesMesh.rotation.y);
    particlesMesh.rotation.x += 0.5 * (targetY - particlesMesh.rotation.x);

    // Scroll Parallax (Move camera)
    // Helps site feel deep
    camera.position.y = -scrollY * 0.01;

    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
  };

  tick();

  // Handle Resize
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
});
