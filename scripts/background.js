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

  // --- PARTICLES WITH ANIME.JS MORPHING ---
  const particlesGeometry = new THREE.BufferGeometry();
  const particlesCount = 1500; // Increased count for better shapes

  // Position Arrays for Morphing
  const randomPos = new Float32Array(particlesCount * 3);
  const spherePos = new Float32Array(particlesCount * 3);
  const helixPos = new Float32Array(particlesCount * 3);
  const currentPos = new Float32Array(particlesCount * 3); // The one we render

  const colorArray = new Float32Array(particlesCount * 3); // Dynamic colors
  const scaleArray = new Float32Array(particlesCount);

  // We need an array of objects for Anime.js to tween
  const particleTargets = [];

  for (let i = 0; i < particlesCount; i++) {
    const i3 = i * 3;

    // 1. Random Galaxy Dust
    randomPos[i3] = (Math.random() - 0.5) * 50;
    randomPos[i3 + 1] = (Math.random() - 0.5) * 50;
    randomPos[i3 + 2] = (Math.random() - 0.5) * 50;

    // 2. Sphere Formation
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);
    const radius = 15;
    spherePos[i3] = radius * Math.sin(phi) * Math.cos(theta);
    spherePos[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    spherePos[i3 + 2] = radius * Math.cos(phi);

    // 3. Double Helix Formation
    const helixRadius = 6;
    const helixHeight = 40;
    const t = i / particlesCount;
    const angle = t * Math.PI * 15; // Twists
    const strand = i % 2 === 0 ? 1 : -1;
    helixPos[i3] = Math.cos(angle) * helixRadius * strand;
    helixPos[i3 + 1] = (t - 0.5) * helixHeight;
    helixPos[i3 + 2] = Math.sin(angle) * helixRadius * strand;

    // Initial State is Random
    currentPos[i3] = randomPos[i3];
    currentPos[i3 + 1] = randomPos[i3 + 1];
    currentPos[i3 + 2] = randomPos[i3 + 2];

    scaleArray[i] = Math.random();

    // Create targeting object for Anime.js
    particleTargets.push({
      x: randomPos[i3],
      y: randomPos[i3 + 1],
      z: randomPos[i3 + 2],
      // Store all forms
      randomX: randomPos[i3],
      randomY: randomPos[i3 + 1],
      randomZ: randomPos[i3 + 2],
      sphereX: spherePos[i3],
      sphereY: spherePos[i3 + 1],
      sphereZ: spherePos[i3 + 2],
      helixX: helixPos[i3],
      helixY: helixPos[i3 + 1],
      helixZ: helixPos[i3 + 2],
    });
  }

  particlesGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(currentPos, 3),
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
    // Check current actual theme from html attribute directly
    const isLight =
      document.documentElement.getAttribute("data-theme") === "light";

    // Colors
    let c1, c2, c3;

    if (isLight) {
      // LIGHT MODE COLORS: Needs to be darker/colorful to show on light mesh
      c1 = new THREE.Color("#4f46e5"); // Indigo 600
      c2 = new THREE.Color("#db2777"); // Pink 600
      c3 = new THREE.Color("#7e22ce"); // Purple 700
      particlesMaterial.blending = THREE.NormalBlending; // Better visibility on light
      particlesMaterial.opacity = 0.8;
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

  // Listen for actual HTML data-theme Changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "data-theme"
      ) {
        updateParticleColors();
      }
    });
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  // --- EPIC ANIME.JS DRIVEN ANIMATIONS ---

  // Create a wrapper group to decouple mouse parallax from continuous auto-rotation
  const mouseGroup = new THREE.Group();
  scene.add(mouseGroup);
  scene.remove(particlesMesh);
  mouseGroup.add(particlesMesh);

  // Function to apply frame updates to BufferGeometry when AnimeJS tweens the array of objects
  const updateParticles = () => {
    for (let i = 0; i < particlesCount; i++) {
      const i3 = i * 3;
      currentPos[i3] = particleTargets[i].x;
      currentPos[i3 + 1] = particleTargets[i].y;
      currentPos[i3 + 2] = particleTargets[i].z;
    }
    particlesGeometry.attributes.position.needsUpdate = true;
  };

  // Define our morphing sequence
  const morphSequence = () => {
    anime
      .timeline({
        loop: true,
        direction: "alternate",
        update: updateParticles,
      })
      // Random -> Sphere
      .add({
        targets: particleTargets,
        x: (el) => el.sphereX,
        y: (el) => el.sphereY,
        z: (el) => el.sphereZ,
        duration: 3000,
        easing: "easeOutElastic(1, .8)",
        delay: anime.stagger(2), // Epic ripple stagger effect across 1500 particles!
        endDelay: 4000,
      })
      // Sphere -> Helix
      .add({
        targets: particleTargets,
        x: (el) => el.helixX,
        y: (el) => el.helixY,
        z: (el) => el.helixZ,
        duration: 3000,
        easing: "easeInOutSine",
        delay: anime.stagger(1.5),
        endDelay: 4000,
      })
      // Helix -> Random
      .add({
        targets: particleTargets,
        x: (el) => el.randomX,
        y: (el) => el.randomY,
        z: (el) => el.randomZ,
        duration: 3000,
        easing: "easeOutBack",
        delay: anime.stagger(1, { from: "center" }),
      });
  };

  // 1. Initial State for Entrance
  camera.position.z = 150;
  particlesMesh.scale.set(0, 0, 0);
  particlesMesh.rotation.x = Math.PI / 4;
  particlesMesh.rotation.y = Math.PI;

  // 2. Entrance Animation Timeline, then start Morph sequence
  anime
    .timeline({
      complete: morphSequence, // Trigger the massive shape morph after entrance
    })
    .add({
      targets: camera.position,
      z: 20,
      duration: 4000,
      easing: "easeOutCubic",
    })
    .add(
      {
        targets: particlesMesh.scale,
        x: 1,
        y: 1,
        z: 1,
        duration: 3000,
        easing: "easeOutExpo",
      },
      "-=3500",
    )
    .add(
      {
        targets: particlesMesh.rotation,
        x: 0,
        y: 0,
        duration: 5000,
        easing: "easeOutQuart",
      },
      "-=4000",
    );

  // 3. Continuous Base Animation Loops
  // Slow Space Rotation
  anime({
    targets: particlesMesh.rotation,
    y: Math.PI * 2,
    duration: 80000,
    loop: true,
    easing: "linear",
  });

  // 4. Smooth Mouse Parallax
  const windowHalfX = window.innerWidth / 2;
  const windowHalfY = window.innerHeight / 2;

  document.addEventListener("mousemove", (event) => {
    // Calculate normalized mouse coordinates
    const mouseX = (event.clientX - windowHalfX) * 0.001;
    const mouseY = (event.clientY - windowHalfY) * 0.001;

    // Tween the wrapper group, leaving internal particle rotation intact
    anime({
      targets: mouseGroup.rotation,
      x: mouseY,
      y: mouseX,
      duration: 2000,
      easing: "easeOutCirc",
    });
  });

  // 5. Immersive Scroll Dive
  window.addEventListener("scroll", () => {
    // Get total scrollable distance
    const scrollMax = document.body.scrollHeight - window.innerHeight;
    const scrollPercent = window.scrollY / scrollMax;

    // Tween camera to fly IN to the particles and pan down
    anime({
      targets: camera.position,
      y: -scrollPercent * 15,
      z: 20 - scrollPercent * 25, // Dive deep through the stars
      duration: 1000,
      easing: "easeOutQuart",
    });
  });

  // 6. Tick Loop (Now just renders, physics handled perfectly by Anime.js)
  const tick = () => {
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
