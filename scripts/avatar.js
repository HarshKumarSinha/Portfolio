// Interactive 3D Parallax Bitmoji Avatar using Three.js
document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.querySelector("#avatarCanvas");

  if (!canvas || typeof THREE === "undefined") {
    console.warn("Three.js not loaded or #avatarCanvas not found. Avatar disabled.");
    return;
  }

  // Dimension helpers
  let width = canvas.clientWidth || 320;
  let height = canvas.clientHeight || 320;

  // Scene setup
  const scene = new THREE.Scene();

  // Camera
  const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
  camera.position.set(0, 0, 6.5); // Position camera to fit the card

  // Renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance"
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Lighting (Subtle ambient + directional lights)
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
  dirLight.position.set(2, 4, 5);
  scene.add(dirLight);

  // Avatar parent group for mouse rotation
  const avatarGroup = new THREE.Group();
  scene.add(avatarGroup);

  // Helper: Chrome-Key/Background Removal for Bitmoji JPG
  const removeBackground = (imgElement) => {
    const procCanvas = document.createElement("canvas");
    procCanvas.width = imgElement.naturalWidth || imgElement.width;
    procCanvas.height = imgElement.naturalHeight || imgElement.height;
    const procCtx = procCanvas.getContext("2d");
    procCtx.drawImage(imgElement, 0, 0);

    const imgData = procCtx.getImageData(0, 0, procCanvas.width, procCanvas.height);
    const data = imgData.data;

    // Helper to get pixel RGB
    const getPixel = (x, y) => {
      const idx = (y * procCanvas.width + x) * 4;
      return { r: data[idx], g: data[idx + 1], b: data[idx + 2] };
    };

    // Sample background colors from 10x10 blocks in the 4 corners for stability
    let bgR = 0, bgG = 0, bgB = 0, count = 0;
    const sampleBox = 10;
    
    const sampleCorner = (startX, startY) => {
      for (let y = startY; y < startY + sampleBox; y++) {
        for (let x = startX; x < startX + sampleBox; x++) {
          const p = getPixel(x, y);
          bgR += p.r;
          bgG += p.g;
          bgB += p.b;
          count++;
        }
      }
    };
    
    sampleCorner(0, 0);
    sampleCorner(procCanvas.width - sampleBox, 0);
    sampleCorner(0, procCanvas.height - sampleBox);
    sampleCorner(procCanvas.width - sampleBox, procCanvas.height - sampleBox);

    bgR /= count;
    bgG /= count;
    bgB /= count;

    const centerX = procCanvas.width / 2;
    const centerY = procCanvas.height * 0.58; // Center around chest/head
    const maxRadius = Math.min(procCanvas.width, procCanvas.height) * 0.48;

    // Chroma-key + Radial fade background matching
    for (let y = 0; y < procCanvas.height; y++) {
      for (let x = 0; x < procCanvas.width; x++) {
        const i = (y * procCanvas.width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Calculate Euclidean color distance to background
        const distance = Math.sqrt(
          Math.pow(r - bgR, 2) +
          Math.pow(g - bgG, 2) +
          Math.pow(b - bgB, 2)
        );

        // Check if pixel is neutral grey/black/white
        const isNeutral = Math.abs(r - g) < 20 && Math.abs(g - b) < 20 && Math.abs(r - b) < 20;

        // Protect very dark black/grey elements (hair, beard, headphones, shirt lines)
        // Since the background space is a glowing blue, its blue channel (b) is higher than the black hair
        const isVeryDark = r < 28 && g < 28 && b < 42;

        // Key out background colors
        if (!isVeryDark && (distance < 42 || (!isNeutral && r < 40 && g < 45 && b < 85))) {
          data[i + 3] = 0; // Make transparent
        } else {
          // Soften edges slightly (feathering)
          if (!isVeryDark && distance < 58) {
            const factor = (distance - 42) / 16;
            data[i + 3] = Math.round(data[i + 3] * factor);
          }
        }

        // Apply a radial vignette/fade mask to clean up stars/noise near outer borders
        // Except at the bottom edge (since shirt is cropped there)
        if (y < procCanvas.height - 15) {
          const dx = x - centerX;
          const dy = y - centerY;
          const distFromCenter = Math.sqrt(dx * dx + dy * dy);

          if (distFromCenter > maxRadius) {
            data[i + 3] = 0;
          } else {
            const fadeStart = maxRadius * 0.82;
            if (distFromCenter > fadeStart) {
              const opacityFactor = 1 - (distFromCenter - fadeStart) / (maxRadius - fadeStart);
              data[i + 3] = Math.max(0, Math.min(data[i + 3], Math.round(data[i + 3] * opacityFactor)));
            }
          }
        }
      }
    }

    procCtx.putImageData(imgData, 0, 0);
    return procCanvas;
  };

  // 1. Interactive 3D Background Glowing Aura
  const auraGeo = new THREE.PlaneGeometry(3.6, 3.6);
  const auraCanvas = document.createElement("canvas");
  auraCanvas.width = 64;
  auraCanvas.height = 64;
  const auraCtx = auraCanvas.getContext("2d");
  const auraGrad = auraCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
  auraGrad.addColorStop(0, "rgba(99, 102, 241, 0.4)"); // Indigo glow
  auraGrad.addColorStop(0.5, "rgba(168, 85, 247, 0.15)"); // Purple glow
  auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  auraCtx.fillStyle = auraGrad;
  auraCtx.fillRect(0, 0, 64, 64);

  const auraTexture = new THREE.CanvasTexture(auraCanvas);
  const isLight = () => document.documentElement.getAttribute("data-theme") === "light";
  
  const auraMat = new THREE.MeshBasicMaterial({
    map: auraTexture,
    transparent: true,
    blending: isLight() ? THREE.NormalBlending : THREE.AdditiveBlending,
    opacity: isLight() ? 0.35 : 0.8,
    depthWrite: false
  });
  const auraMesh = new THREE.Mesh(auraGeo, auraMat);
  auraMesh.position.set(0, 0, -0.4); // Put behind avatar
  avatarGroup.add(auraMesh);

  // 2. Character Plane (Displays the transparent-keyed Bitmoji)
  const charGeo = new THREE.PlaneGeometry(3.3, 3.3);
  const charMat = new THREE.MeshBasicMaterial({
    transparent: true,
    side: THREE.DoubleSide
  });
  const charMesh = new THREE.Mesh(charGeo, charMat);
  avatarGroup.add(charMesh);

  // Load Bitmoji Image & Apply Background Keying
  const img = new Image();
  img.src = "img/my_bitmoji.jpg";
  img.crossOrigin = "anonymous";
  img.onload = () => {
    const transparentCanvas = removeBackground(img);
    charMat.map = new THREE.CanvasTexture(transparentCanvas);
    charMat.needsUpdate = true;
  };
  img.onerror = () => {
    console.error("Failed to load my_bitmoji.jpg. Loading fallback directly.");
    // Fallback load directly if processing fails
    const loader = new THREE.TextureLoader();
    charMat.map = loader.load("img/my_bitmoji.jpg");
    charMat.needsUpdate = true;
  };

  // Cursor tracking coordinates
  let mouse = { x: 0, y: 0 };
  let targetRotation = { x: 0, y: 0 };
  let currentRotation = { x: 0, y: 0 };
  let targetAuraPos = { x: 0, y: 0 };
  let currentAuraPos = { x: 0, y: 0 };

  // Mouse Move listener
  document.addEventListener("mousemove", (event) => {
    // Normalise mouse positions [-1, 1]
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Set 3D rotation targets (subtle tilt)
    targetRotation.y = mouse.x * 0.35;
    targetRotation.x = -mouse.y * 0.25;

    // Set 3D background parallax position target (opposite direction!)
    targetAuraPos.x = -mouse.x * 0.45;
    targetAuraPos.y = -mouse.y * 0.35;
  });

  // Scroll reaction variables
  let targetScrollY = 0;
  let currentScrollY = 0;
  let scrollVelocity = 0;

  window.addEventListener("scroll", () => {
    targetScrollY = window.scrollY;
  });

  // Resize handler
  const handleResize = () => {
    width = canvas.clientWidth || 320;
    height = canvas.clientHeight || 320;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  };
  window.addEventListener("resize", handleResize);

  const clock = new THREE.Clock();

  // Animation Loop
  const animate = () => {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    // Dynamically adjust background aura blending based on theme to prevent white washing in light mode
    const isL = isLight();
    auraMat.blending = isL ? THREE.NormalBlending : THREE.AdditiveBlending;
    auraMat.opacity = isL ? 0.35 : 0.8;

    // 1. Lerp head rotation towards cursor position (inertia)
    currentRotation.y += (targetRotation.y - currentRotation.y) * 0.08;
    currentRotation.x += (targetRotation.x - currentRotation.x) * 0.08;

    avatarGroup.rotation.y = currentRotation.y;
    avatarGroup.rotation.x = currentRotation.x;

    // 2. Parallax background movement (moves in the opposite direction)
    currentAuraPos.x += (targetAuraPos.x - currentAuraPos.x) * 0.08;
    currentAuraPos.y += (targetAuraPos.y - currentAuraPos.y) * 0.08;
    auraMesh.position.x = currentAuraPos.x;
    auraMesh.position.y = currentAuraPos.y;

    // 3. Scroll-linked reaction (playful sideways tilt + body bobbing)
    const diff = targetScrollY - currentScrollY;
    scrollVelocity = diff * 0.15;
    currentScrollY += diff * 0.15;

    avatarGroup.rotation.z = -scrollVelocity * 0.0035; // Gentle lean sideways
    avatarGroup.position.y = Math.sin(elapsedTime * 2.2) * 0.035 + (-scrollVelocity * 0.003); // Idle hover bounce + scroll bounce

    renderer.render(scene, camera);
  };

  animate();
});
