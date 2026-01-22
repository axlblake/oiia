// Three.js IAAI Cat Meme
let scene, camera, renderer, cat, particles = [], confetti = [];
let isSpinning = false;
let startTime = 0;
let completedSequence = false;
let spinFrames = [];
let currentFrameIndex = 0;
let lastFrameTime = 0;
let glowRings = [];
let defaultCatTexture = null;
const SCANNING_TEXT = "🐱 Scanning strategies... 🐱";
const STRATEGY_PREFIXES = ["📈", "💰", "🔥", "🎯", "💎", "🚀", "⚡"];
const STRATEGY_SUFFIXES = ["🚀", "💎", "⚡", "🌟", "💰", "🎊", "🎯"];
let strategyTexts = [];
let currentStrategyIndex = 0;
let lastStrategyTime = 0;
let lastStrategyText = "";
let strategyHideTimeoutId = null;
let fireworks = [];
let lastFireworkTime = 0;
let activeInputSource = null;
let pressTextTimeoutId = null;
let hasStartedOnce = false;
let totalPlayTimeMs = 0;
let playSessionStartMs = 0;
let strategyDelayMs = 1200;

/**
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function getRandomInt(min, max) {
    const minValue = Math.ceil(min);
    const maxValue = Math.floor(max);
    return Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
}

/**
 * @param {number} percent
 * @param {number} index
 * @returns {string}
 */
function formatStrategyText(percent, index) {
    const prefix = STRATEGY_PREFIXES[index % STRATEGY_PREFIXES.length];
    const suffix = STRATEGY_SUFFIXES[index % STRATEGY_SUFFIXES.length];
    return `${prefix} + ${percent}% Strategy Found! ${suffix}`;
}

/**
 * @param {number} start
 * @param {number} end
 * @returns {number[]}
 */
function generatePercentSequence(start, end) {
    const values = [start];
    let current = start;
    while (current < end) {
        const remaining = end - current;
        const minStep = Math.max(3, Math.floor(remaining / 6));
        const maxStep = Math.max(minStep, Math.floor(remaining / 3));
        const step = getRandomInt(minStep, maxStep);
        current = Math.min(end, current + step);
        values.push(current);
        if (values.length > 12 && current < end) {
            current = end;
            values[values.length - 1] = current;
        }
    }
    return values;
}

/**
 * @returns {string[]}
 */
function buildStrategyTexts() {
    const targetPercent = getRandomInt(148, 223);
    const values = generatePercentSequence(3, targetPercent);
    const percentTexts = values.map((value, index) => formatStrategyText(value, index));
    return [SCANNING_TEXT, ...percentTexts];
}

/**
 * @returns {HTMLDivElement | null}
 */
function getStrategyTextElement() {
    const element = document.getElementById('strategy-text');
    return element instanceof HTMLDivElement ? element : null;
}

/**
 * @param {HTMLElement} element
 * @returns {number}
 */
function getMaxFontSizePx(element) {
    const stored = element.dataset.maxFontSize;
    if (stored) {
        return Number(stored);
    }
    const computed = window.getComputedStyle(element);
    const size = Number.parseFloat(computed.fontSize);
    element.dataset.maxFontSize = String(size);
    return size;
}

/**
 * @param {HTMLElement} element
 * @param {number} minPx
 */
function fitTextToSingleLine(element, minPx) {
    const maxPx = getMaxFontSizePx(element);
    if (!element.clientWidth) {
        return;
    }
    let low = Math.max(1, Math.floor(minPx));
    let high = Math.max(low, Math.floor(maxPx));
    let best = low;
    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        element.style.fontSize = `${mid}px`;
        if (element.scrollWidth <= element.clientWidth) {
            best = mid;
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }
    element.style.fontSize = `${best}px`;
}

/**
 * Fit strategy and press text to one row.
 */
function fitAllTextToSingleLine() {
    const strategyText = getStrategyTextElement();
    if (strategyText) {
        fitTextToSingleLine(strategyText, 10);
    }
    const pressText = getPressTextElement();
    if (pressText) {
        fitTextToSingleLine(pressText, 10);
    }
}

function isPercentStrategyText(text) {
    return /\+\s*\d+%/.test(text);
}

function isScanningStrategyText(text) {
    return text.includes("Scanning strategies");
}

function getStrategyTextColor(text) {
    return isPercentStrategyText(text) ? "#6bcf7f" : "white";
}

function hasMoreStrategyText() {
    return currentStrategyIndex < strategyTexts.length;
}

function getStrategyTextAtIndex(index) {
    if (index < strategyTexts.length) {
        return strategyTexts[index];
    }
    return strategyTexts[strategyTexts.length - 1];
}

function getRandomStrategyDelayMs() {
    return 2000 + Math.floor(Math.random() * 3001);
}

function setActiveInputSource(source) {
    activeInputSource = source;
}

function isActiveInputSource(source) {
    return activeInputSource === source;
}

function clearActiveInputSource() {
    activeInputSource = null;
}

/**
 * @returns {HTMLDivElement | null}
 */
function getPressTextElement() {
    const element = document.getElementById('press-text');
    return element instanceof HTMLDivElement ? element : null;
}

/**
 * Hide the press text.
 */
function hidePressText() {
    const pressText = getPressTextElement();
    if (!pressText) {
        return;
    }
    pressText.classList.add('hidden');
}

/**
 * Show the press text.
 */
function showPressText() {
    const pressText = getPressTextElement();
    if (!pressText) {
        return;
    }
    pressText.classList.remove('hidden');
}

/**
 * Schedule the press text hide after first play.
 */
function schedulePressTextHide() {
    if (pressTextTimeoutId !== null) {
        clearTimeout(pressTextTimeoutId);
        pressTextTimeoutId = null;
    }
    pressTextTimeoutId = setTimeout(() => {
        hidePressText();
    }, 5000);
}

function createFireworkParticle(positionX) {
    const geometry = new THREE.SphereGeometry(0.05, 8, 8);
    const material = new THREE.MeshBasicMaterial({
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        transparent: true,
        opacity: 1
    });
    const particle = new THREE.Mesh(geometry, material);
    particle.position.set(positionX, 1.6, 0);
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.08 + Math.random() * 0.08;
    particle.userData.velocity = {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed + 0.05,
        z: (Math.random() - 0.5) * speed
    };
    particle.userData.life = 1.0;
    scene.add(particle);
    fireworks.push(particle);
}

function spawnFireworkBurst(positionX) {
    for (let i = 0; i < 18; i++) {
        createFireworkParticle(positionX);
    }
}

function updateFireworks() {
    const gravity = -0.0025;
    fireworks.forEach((particle) => {
        particle.userData.velocity.y += gravity;
        particle.position.x += particle.userData.velocity.x;
        particle.position.y += particle.userData.velocity.y;
        particle.position.z += particle.userData.velocity.z;
        particle.userData.life -= 0.02;
        particle.material.opacity = Math.max(0, particle.userData.life);
    });
    const remaining = fireworks.filter(particle => particle.userData.life > 0);
    fireworks.filter(particle => particle.userData.life <= 0).forEach((particle) => {
        scene.remove(particle);
    });
    fireworks = remaining;
}

// Confetti colors for IAAI explosion
const confettiColors = [
    0xff6b6b, 0x4ecdc4, 0xffd93d, 0x6bcf7f, 0x4d96ff, 0x9c6ade,
    0xff69b4, 0x00ff7f, 0xff4500, 0x32cd32, 0xff1493, 0x00bfff,
    0xffd700, 0xdc143c, 0x8a2be2, 0x00ff00
];

// Initialize Three.js scene
function init() {
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);

    // Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('container').appendChild(renderer.domElement);

    // Lighting
    setupLighting();

    // Create cat
    createCatAsset();

    // Create particle system
    createParticles();

    // Event listeners
    setupEventListeners();

    // Hide loading
    document.getElementById('loading').style.display = 'none';
    fitAllTextToSingleLine();

    // Start animation loop
    animate();
}

// Setup lighting
function setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    ambientLight.name = 'ambientLight';
    scene.add(ambientLight);

    // Directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Point lights for color effects
    const pointLight1 = new THREE.PointLight(0xff6b6b, 0.5, 100);
    pointLight1.position.set(-5, 5, 5);
    pointLight1.name = 'pointLight1';
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x4ecdc4, 0.5, 100);
    pointLight2.position.set(5, -5, 5);
    pointLight2.name = 'pointLight2';
    scene.add(pointLight2);
}

/**
 * Load default cat and spin frames.
 */
function createCatAsset() {
    const loader = new THREE.TextureLoader();
    const totalFrames = 8;

    loader.load(
        'oiia-cat-standing.png',
        (texture) => {
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            defaultCatTexture = texture;
            createCatSprite(texture);
        },
        undefined,
        () => {
            console.warn('Default cat image not found, using fallback');
            createCat();
        }
    );

    for (let i = 1; i <= totalFrames; i++) {
        loader.load(
            `spins/${i}.png`,
            (texture) => {
                texture.minFilter = THREE.LinearFilter;
                texture.magFilter = THREE.LinearFilter;
                spinFrames[i - 1] = texture;
            },
            undefined,
            () => {}
        );
    }
}

/**
 * Create a chroma-keyed material to remove green/white.
 * @param {THREE.Texture} texture
 * @returns {THREE.ShaderMaterial}
 */
function createChromaKeyMaterial(texture) {
    return new THREE.ShaderMaterial({
        uniforms: {
            map: { value: texture },
            keyGreen: { value: new THREE.Color(0x00ff00) },
            greenThreshold: { value: 0.2 },
            greenSoftness: { value: 0.12 },
            whiteThreshold: { value: 0.85 },
            whiteSoftness: { value: 0.08 }
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform sampler2D map;
            uniform vec3 keyGreen;
            uniform float greenThreshold;
            uniform float greenSoftness;
            uniform float whiteThreshold;
            uniform float whiteSoftness;
            varying vec2 vUv;
            void main() {
                vec4 color = texture2D(map, vUv);
                float greenDiff = color.g - max(color.r, color.b);
                float greenMask = smoothstep(greenThreshold, greenThreshold + greenSoftness, greenDiff) * step(0.35, color.g);
                float whiteMin = min(color.r, min(color.g, color.b));
                float whiteMask = smoothstep(whiteThreshold, whiteThreshold + whiteSoftness, whiteMin);
                float alpha = 1.0 - max(greenMask, whiteMask);
                if (alpha <= 0.01) {
                    discard;
                }
                gl_FragColor = vec4(color.rgb, color.a * alpha);
            }
        `,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: true
    });
}

/**
 * Create a 2D sprite cat from a texture.
 * @param {THREE.Texture} texture
 */
function createCatSprite(texture) {
    cat = new THREE.Group();
    const planeGeometry = new THREE.PlaneGeometry(3.5, 3.5);
    const material = createChromaKeyMaterial(texture);
    const plane = new THREE.Mesh(planeGeometry, material);
    plane.position.set(0, 0, 0);
    cat.add(plane);
    cat.scale.set(1.2, 1.2, 1.2);
    cat.position.y = 0;

    const dummy = new THREE.Object3D();
    cat.userData = {
        legs: [],
        paws: [],
        mouth: dummy,
        leftEye: dummy,
        rightEye: dummy,
        head: dummy,
        initialScale: cat.scale.clone(),
        initialPawPositions: [],
        isSprite: true,
        material: material,
        plane: plane,
        defaultTexture: texture
    };

    scene.add(cat);
}

// Create IAAI meme cat model (ultra-compact, folded position like the meme)
function createCat() {
    cat = new THREE.Group();

    // Main body (The "Loaf" - very flattened sphere)
    const bodyGeometry = new THREE.SphereGeometry(0.7, 32, 32);
    const bodyMaterial = new THREE.MeshPhongMaterial({
        color: 0xffdbac,
        shininess: 20
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.scale.set(1.4, 0.6, 1.4); 
    body.position.set(0, -0.3, 0); 
    body.castShadow = true;
    cat.add(body);

    // Head (Tucked in tight)
    const headGeometry = new THREE.SphereGeometry(0.38, 24, 24);
    const head = new THREE.Mesh(headGeometry, bodyMaterial);
    head.position.set(0, 0.05, 0.15); 
    head.scale.set(1.1, 0.8, 1.1); 
    head.castShadow = true;
    cat.add(head);

    // Ears (Folded flat against head)
    const earGeometry = new THREE.ConeGeometry(0.1, 0.18, 6);
    const earMaterial = new THREE.MeshPhongMaterial({ color: 0xffdbac });

    const leftEar = new THREE.Mesh(earGeometry, earMaterial);
    leftEar.position.set(-0.2, 0.35, 0.1);
    leftEar.rotation.set(0.6, 0, -0.4); 
    cat.add(leftEar);

    const rightEar = new THREE.Mesh(earGeometry, earMaterial);
    rightEar.position.set(0.2, 0.35, 0.1);
    rightEar.rotation.set(0.6, 0, 0.4); 
    cat.add(rightEar);

    // Eyes (Sleepy slits)
    const eyeGeometry = new THREE.SphereGeometry(0.045, 12, 12);
    const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });

    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.14, 0.15, 0.45);
    leftEye.scale.set(1.8, 0.15, 1); 
    cat.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.14, 0.15, 0.45);
    rightEye.scale.set(1.8, 0.15, 1); 
    cat.add(rightEye);

    // Mouth/Jaw (For the "Funny Yaw" / IAAI scream)
    const mouthGeometry = new THREE.SphereGeometry(0.12, 16, 16);
    const mouthMaterial = new THREE.MeshPhongMaterial({ color: 0x330000 }); // Dark inside mouth
    const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
    mouth.position.set(0, 0.05, 0.48);
    mouth.scale.set(1, 0.1, 0.5); // Start closed
    cat.add(mouth);

    // Nose (Tiny pink dot)
    const noseGeometry = new THREE.SphereGeometry(0.02, 8, 8);
    const noseMaterial = new THREE.MeshPhongMaterial({ color: 0xffb6c1 });
    const nose = new THREE.Mesh(noseGeometry, noseMaterial);
    nose.position.set(0, 0.12, 0.5);
    cat.add(nose);

    // Legs (Completely hidden/tucked in folded state)
    const legGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.25, 12);
    const legMaterial = new THREE.MeshPhongMaterial({ color: 0xffdbac });

    const legs = [];
    const legPositions = [
        { pos: [-0.2, -0.5, 0.2], rot: [Math.PI/2, 0, -0.8], name: 'frontLeft' },
        { pos: [0.2, -0.5, 0.2], rot: [Math.PI/2, 0, 0.8], name: 'frontRight' },
        { pos: [-0.2, -0.5, -0.2], rot: [Math.PI/2, 0, -0.5], name: 'backLeft' },
        { pos: [0.2, -0.5, -0.2], rot: [Math.PI/2, 0, 0.5], name: 'backRight' }
    ];

    legPositions.forEach((legData) => {
        const leg = new THREE.Mesh(legGeometry, legMaterial);
        leg.position.set(...legData.pos);
        leg.rotation.set(...legData.rot);
        leg.scale.set(0.1, 0.1, 0.1); // Start tiny/hidden
        leg.castShadow = true;
        leg.name = legData.name;
        legs.push(leg);
        cat.add(leg);
    });

    // Paws (Tucked)
    const pawGeometry = new THREE.SphereGeometry(0.06, 12, 12);
    const paws = [];
    const pawPositions = [
        { pos: [-0.2, -0.6, 0.25] },
        { pos: [0.2, -0.6, 0.25] },
        { pos: [-0.2, -0.6, -0.25] },
        { pos: [0.2, -0.6, -0.25] }
    ];

    pawPositions.forEach((pawData) => {
        const paw = new THREE.Mesh(pawGeometry, legMaterial);
        paw.position.set(...pawData.pos);
        paw.scale.set(0.1, 0.1, 0.1); // Start hidden
        paw.castShadow = true;
        paws.push(paw);
        cat.add(paw);
    });

    cat.scale.set(0.8, 0.8, 0.8);

    cat.userData = {
        legs: legs,
        paws: paws,
        mouth: mouth,
        leftEye: leftEye,
        rightEye: rightEye,
        head: head,
        initialScale: cat.scale.clone(),
        initialPawPositions: pawPositions.map(p => ({ ...p.pos }))
    };

    scene.add(cat);
}

// Create particle system
function createParticles() {
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 200;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 20;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.05,
        transparent: true,
        opacity: 0
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);
    particles.push(particleSystem);
}

/**
 * Create expanding glow rings effect.
 */
function createGlowRings() {
    for (let i = 0; i < 3; i++) {
        const ringGeometry = new THREE.RingGeometry(0.1, 0.3, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.position.set(0, 0, 0);
        ring.rotation.x = Math.PI / 2;
        ring.userData.startTime = Date.now() + (i * 200);
        ring.userData.maxScale = 8 + Math.random() * 4;
        scene.add(ring);
        glowRings.push(ring);
    }

    // Add starburst particles
    for (let i = 0; i < 50; i++) {
        const starGeometry = new THREE.SphereGeometry(0.05, 8, 8);
        const starMaterial = new THREE.MeshBasicMaterial({
            color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
            transparent: true,
            opacity: 1
        });
        const star = new THREE.Mesh(starGeometry, starMaterial);
        
        const angle = (Math.PI * 2 * i) / 50;
        const speed = 0.08 + Math.random() * 0.06;
        
        star.position.set(0, 0, 0);
        star.userData.velocity = {
            x: Math.cos(angle) * speed,
            y: (Math.random() - 0.5) * 0.04,
            z: Math.sin(angle) * speed
        };
        star.userData.life = 1.0;
        
        scene.add(star);
        particles.push(star);
    }
}

// Create explosive IAAI-style confetti
function createConfetti() {

    // Create more confetti pieces for explosive effect
    for (let i = 0; i < 200; i++) {
        const geometry = new THREE.PlaneGeometry(0.08, 0.25);
        const material = new THREE.MeshBasicMaterial({
            color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.9
        });

        const confettiPiece = new THREE.Mesh(geometry, material);

        // Start confetti from cat position and explode outward
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 2 + 1;
        const height = Math.random() * 3 + 2;

        confettiPiece.position.set(
            Math.cos(angle) * radius,
            height,
            Math.sin(angle) * radius
        );

        confettiPiece.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );

        // Explosive velocity - shoots confetti outward and up
        const speed = Math.random() * 0.15 + 0.1;
        confettiPiece.velocity = {
            x: Math.cos(angle) * speed,
            y: Math.random() * 0.08 + 0.05, // Upward force
            z: Math.sin(angle) * speed
        };

        confettiPiece.rotationSpeed = {
            x: (Math.random() - 0.5) * 0.2,
            y: (Math.random() - 0.5) * 0.2,
            z: (Math.random() - 0.5) * 0.2
        };

        // Add gravity effect
        confettiPiece.gravity = -0.002;

        scene.add(confettiPiece);
        confetti.push(confettiPiece);
    }
}

// Setup event listeners
function setupEventListeners() {
    const canvas = renderer.domElement;

    // Mouse/Touch events - Click and hold to play
    canvas.addEventListener('mousedown', () => {
        if (isActiveInputSource('touch')) {
            return;
        }
        setActiveInputSource('mouse');
        startIAAI();
    });
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (isActiveInputSource('mouse')) {
            return;
        }
        setActiveInputSource('touch');
        startIAAI();
    });

    canvas.addEventListener('mouseup', () => {
        if (!isActiveInputSource('mouse')) {
            return;
        }
        clearActiveInputSource();
        stopIAAI();
    });
    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        if (!isActiveInputSource('touch')) {
            return;
        }
        clearActiveInputSource();
        stopIAAI();
    });
    canvas.addEventListener('touchcancel', () => {
        if (!isActiveInputSource('touch')) {
            return;
        }
        clearActiveInputSource();
        stopIAAI();
    });

    // Also stop on mouse leave
    canvas.addEventListener('mouseleave', () => {
        if (!isActiveInputSource('mouse')) {
            return;
        }
        clearActiveInputSource();
        stopIAAI();
    });

    window.addEventListener('keydown', (event) => {
        if (event.code !== 'Space' || event.repeat) {
            return;
        }
        event.preventDefault();
        if (activeInputSource && !isActiveInputSource('keyboard')) {
            return;
        }
        setActiveInputSource('keyboard');
        startIAAI();
    });

    window.addEventListener('keyup', (event) => {
        if (event.code !== 'Space') {
            return;
        }
        event.preventDefault();
        if (!isActiveInputSource('keyboard')) {
            return;
        }
        clearActiveInputSource();
        stopIAAI();
    });

    window.addEventListener('blur', () => {
        clearActiveInputSource();
        stopIAAI();
    });

    // Window resize
    window.addEventListener('resize', onWindowResize);
}

// Start IAAI sequence when clicked/pressed
function startIAAI() {
    if (isSpinning) return;

    isSpinning = true;
    startTime = Date.now();
    playSessionStartMs = startTime;
    completedSequence = false;
    strategyTexts = buildStrategyTexts();
    currentStrategyIndex = 0;
    lastStrategyTime = 0;
    lastStrategyText = "";
    strategyDelayMs = getRandomStrategyDelayMs();
    hidePressText();

    if (!hasStartedOnce) {
        hasStartedOnce = true;
        schedulePressTextHide();
    }

    if (window.playIAAISound) {
        window.playIAAISound();
    }

    createConfetti();
    createGlowRings();
    showNextStrategy();
}

// Stop IAAI sequence when released
function stopIAAI() {
    if (window.stopIAAISound) {
        window.stopIAAISound();
    }

    if (!isSpinning) return;

    if (playSessionStartMs) {
        totalPlayTimeMs += Date.now() - playSessionStartMs;
        playSessionStartMs = 0;
    }

    if (totalPlayTimeMs < 5000) {
        showPressText();
    }

    // If sequence is completed, keep the final state
    if (completedSequence) {
        return;
    }

    // Stop spinning and reset to default state
    isSpinning = false;

    // Reset camera position
    camera.position.x = 0;
    camera.position.y = 0;

    // Reset cat to initial position
    cat.rotation.set(0, 0, 0);
    cat.position.set(0, 0, 0);
    
    if (cat.userData.isSprite) {
        cat.scale.set(1.2, 1.2, 1.2);
        currentFrameIndex = 0;
        if (cat.userData.material && cat.userData.defaultTexture) {
            if (cat.userData.material.uniforms && cat.userData.material.uniforms.map) {
                cat.userData.material.uniforms.map.value = cat.userData.defaultTexture;
            }
        }
    } else {
        cat.scale.set(0.8, 0.8, 0.8);

        if (cat.userData.legs) {
            cat.userData.legs.forEach(leg => leg.scale.set(0.1, 0.1, 0.1));
        }
        if (cat.userData.paws) {
            cat.userData.paws.forEach(paw => paw.scale.set(0.1, 0.1, 0.1));
        }

        if (cat.userData.mouth) {
            cat.userData.mouth.scale.set(1, 0.1, 0.5);
            cat.userData.mouth.position.y = 0.05;
        }

        if (cat.userData.leftEye && cat.userData.rightEye) {
            cat.userData.leftEye.scale.set(1.8, 0.15, 1);
            cat.userData.rightEye.scale.set(1.8, 0.15, 1);
        }
    }

    // Clear effects only if not completed
    if (!completedSequence) {
        const strategyText = document.getElementById('strategy-text');
        const currentText = strategyText.textContent;
        if (isScanningStrategyText(currentText)) {
            strategyText.classList.remove('show');
            strategyText.textContent = "";
        } else if (currentText) {
            strategyText.classList.add('show');
            strategyText.style.color = getStrategyTextColor(currentText);
        }
        currentStrategyIndex = 0;
        lastStrategyTime = 0;
    }
}

// Show next strategy text (cycles continuously)
function showNextStrategy() {
    const strategyText = getStrategyTextElement();
    if (!strategyText) {
        return;
    }
    if (strategyHideTimeoutId !== null) {
        clearTimeout(strategyHideTimeoutId);
        strategyHideTimeoutId = null;
    }

    // Cycle through strategy texts continuously
    const textToShow = getStrategyTextAtIndex(currentStrategyIndex);
    const percentMatch = textToShow.match(/\+\s*\d+%/);
    if (percentMatch) {
        const percentText = percentMatch[0];
        const htmlText = textToShow.replace(
            percentText,
            `<span class="percent-boost">${percentText}</span>`
        );
        strategyText.innerHTML = htmlText;
    } else {
        strategyText.textContent = textToShow;
    }
    const isPercentBoost = isPercentStrategyText(textToShow);
    const isScanning = isScanningStrategyText(textToShow);
    strategyText.style.color = getStrategyTextColor(textToShow);
    if (isPercentBoost) {
        lastStrategyText = textToShow; // Track the last shown percent text
    }
    strategyText.classList.add('show');
    requestAnimationFrame(() => {
        fitTextToSingleLine(strategyText, 10);
    });

    currentStrategyIndex++;
    lastStrategyTime = Date.now();
    strategyDelayMs = getRandomStrategyDelayMs();
    const shouldHideText = isScanning;

    // Hide after 1.5 seconds (unless sequence is completed)
    if (shouldHideText) {
        strategyHideTimeoutId = setTimeout(() => {
            if (!completedSequence) {
                strategyText.classList.remove('show');
            }
        }, 1500);
    }
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    const currentTime = Date.now();

    if (isSpinning || completedSequence) {
        // OIIA-style spinning animation (only when spinning or completed)
        if (isSpinning) {
            const elapsed = currentTime - startTime;
            const isSprite = cat.userData.isSprite;

            if (isSprite && spinFrames.length > 0) {
                // Cycle through spin frames rapidly (25ms = 40 FPS)
                if (currentTime - lastFrameTime > 25) {
                    currentFrameIndex = (currentFrameIndex + 1) % spinFrames.length;
                    if (cat.userData.material && spinFrames[currentFrameIndex]) {
                        if (cat.userData.material.uniforms && cat.userData.material.uniforms.map) {
                            cat.userData.material.uniforms.map.value = spinFrames[currentFrameIndex];
                        }
                    }
                    lastFrameTime = currentTime;
                }

                // Energetic floating
                cat.position.y = Math.sin(elapsed * 0.012) * 0.4;
                cat.position.x = Math.cos(elapsed * 0.015) * 0.2;
                
                // Scale pulse
                const pulse = Math.sin(elapsed * 0.02) * 0.15;
                cat.scale.set(1.2 + pulse, 1.2 + pulse, 1.2 + pulse);

                // Camera shake effect
                camera.position.x = Math.sin(elapsed * 0.05) * 0.15;
                camera.position.y = Math.cos(elapsed * 0.04) * 0.15;
            } else {
                // 3D model version: complex animation
                const unfoldProgress = Math.min(elapsed / 1200, 1);

                cat.rotation.y += 0.18;
                cat.rotation.x += 0.06;
                cat.rotation.z += 0.1;

                cat.position.y = Math.sin(elapsed * 0.015) * 0.6;
                cat.position.x = Math.cos(elapsed * 0.018) * 0.4;

                if (unfoldProgress < 1) {
                    const legScale = 0.1 + unfoldProgress * 0.9;
                    cat.userData.legs.forEach(leg => leg.scale.set(legScale, legScale, legScale));
                    cat.userData.paws.forEach(paw => paw.scale.set(legScale, legScale, legScale));

                    const mouthOpen = Math.sin(elapsed * 0.02) * 0.5 + 0.5;
                    cat.userData.mouth.scale.set(1.2, mouthOpen * 1.5, 0.8);
                    cat.userData.mouth.position.y = -0.1 - (mouthOpen * 0.1);

                    const eyeOpenScale = 0.15 + unfoldProgress * 2.5;
                    cat.userData.leftEye.scale.set(2, eyeOpenScale, 1);
                    cat.userData.rightEye.scale.set(2, eyeOpenScale, 1);

                    const growScale = 0.8 + unfoldProgress * 0.5;
                    cat.scale.set(growScale, growScale, growScale);
                }

                if (unfoldProgress >= 1) {
                    const pulse = Math.sin(elapsed * 0.03) * 0.2;
                    cat.scale.set(1.3 + pulse, 1.3 + pulse, 1.3 + pulse);

                    const mouthScream = Math.sin(elapsed * 0.025) * 0.4 + 0.6;
                    cat.userData.mouth.scale.set(1.3, mouthScream * 2, 0.8);
                }
            }
        }

        // Update particles (always animate when present)
        particles.forEach(particle => {
            particle.rotation.x += 0.01;
            particle.rotation.y += 0.01;
            
            if (particle.userData.velocity) {
                // Starburst particles
                particle.position.x += particle.userData.velocity.x;
                particle.position.y += particle.userData.velocity.y;
                particle.position.z += particle.userData.velocity.z;
                
                particle.userData.life -= 0.01;
                particle.material.opacity = Math.max(0, particle.userData.life);
                
                if (particle.userData.life <= 0 && (isSpinning || completedSequence)) {
                    // Respawn from center
                    particle.position.set(0, 0, 0);
                    particle.userData.life = 1.0;
                    particle.material.color.setHex(confettiColors[Math.floor(Math.random() * confettiColors.length)]);
                }
            } else {
                // Original particles
                if (particle.material.opacity < 1) {
                    particle.material.opacity += 0.02;
                }
            }
        });

        // Update glow rings
        glowRings.forEach((ring, index) => {
            const ringElapsed = currentTime - ring.userData.startTime;
            if (ringElapsed > 0) {
                const progress = Math.min(ringElapsed / 1500, 1);
                const scale = progress * ring.userData.maxScale;
                ring.scale.set(scale, scale, 1);
                ring.material.opacity = (completedSequence ? 0.6 : 0.8) * (1 - progress);
                
                if (progress >= 1 && (isSpinning || completedSequence)) {
                    ring.userData.startTime = currentTime;
                    ring.material.color.setHex(confettiColors[Math.floor(Math.random() * confettiColors.length)]);
                }
            }
        });

        // Dynamic lighting and background during spin
        if (isSpinning) {
            const elapsed = currentTime - startTime;
            const light1 = scene.getObjectByName('pointLight1');
            const light2 = scene.getObjectByName('pointLight2');
            
            if (light1) {
                light1.intensity = 0.5 + Math.sin(elapsed * 0.01) * 0.3;
                light1.color.setHex(confettiColors[Math.floor(elapsed * 0.003) % confettiColors.length]);
            }
            if (light2) {
                light2.intensity = 0.5 + Math.cos(elapsed * 0.01) * 0.3;
                light2.color.setHex(confettiColors[Math.floor(elapsed * 0.005) % confettiColors.length]);
            }

            // Pulsating background color
            const bgColorIndex = Math.floor(elapsed * 0.002) % confettiColors.length;
            const bgColor = new THREE.Color(confettiColors[bgColorIndex]);
            const darkBg = new THREE.Color(0x1a1a2e);
            scene.background.lerpColors(darkBg, bgColor, 0.3 + Math.sin(elapsed * 0.01) * 0.2);
        } else if (completedSequence) {
            // Keep colorful background after completion
            const elapsed = currentTime - startTime;
            const bgColorIndex = Math.floor(elapsed * 0.001) % confettiColors.length;
            const bgColor = new THREE.Color(confettiColors[bgColorIndex]);
            const darkBg = new THREE.Color(0x1a1a2e);
            scene.background.lerpColors(darkBg, bgColor, 0.2);
        } else {
            // Reset to dark background
            scene.background.set(0x1a1a2e);
        }

        // Update confetti with gravity and realistic physics (always animate when present)
        confetti.forEach(piece => {
            // Apply gravity to velocity
            piece.velocity.y += piece.gravity;

            // Update position
            piece.position.x += piece.velocity.x;
            piece.position.y += piece.velocity.y;
            piece.position.z += piece.velocity.z;

            // Update rotation
            piece.rotation.x += piece.rotationSpeed.x;
            piece.rotation.y += piece.rotationSpeed.y;
            piece.rotation.z += piece.rotationSpeed.z;

            // Fade out over time (slower fade for completed sequence)
            if (piece.material.opacity > 0 && !completedSequence) {
                piece.material.opacity -= 0.003;
            } else if (completedSequence && piece.material.opacity < 0.9) {
                piece.material.opacity += 0.01;
            }

            // Reset confetti that falls too low or fades out
            if ((isSpinning || completedSequence) && (piece.position.y < -3 || (!completedSequence && piece.material.opacity <= 0))) {
                // Respawn with new random properties
                const angle = Math.random() * Math.PI * 2;
                const radius = Math.random() * 1.5 + 0.5;
                const height = Math.random() * 2 + 1;

                piece.position.set(
                    Math.cos(angle) * radius,
                    height,
                    Math.sin(angle) * radius
                );

                const speed = Math.random() * 0.12 + 0.08;
                piece.velocity = {
                    x: Math.cos(angle) * speed,
                    y: Math.random() * 0.06 + 0.03,
                    z: Math.sin(angle) * speed
                };

                piece.rotation.set(
                    Math.random() * Math.PI,
                    Math.random() * Math.PI,
                    Math.random() * Math.PI
                );

                piece.material.opacity = 0.9;
                piece.material.color.setHex(confettiColors[Math.floor(Math.random() * confettiColors.length)]);
            }
        });

        // Show strategy text continuously while holding (only when spinning)
        if (isSpinning && currentTime - lastStrategyTime > strategyDelayMs && hasMoreStrategyText()) {
            showNextStrategy();
        }

        // Show "Start Earn!" button after 10 seconds and mark as completed (only when spinning)
        if (isSpinning && currentTime - startTime > 10000 && !completedSequence) {

            // Keep the last strategy text visible permanently above the button
            const strategyText = getStrategyTextElement();
            if (lastStrategyText) {
                const percentMatch = lastStrategyText.match(/\+\s*\d+%/);
                if (percentMatch) {
                    const percentText = percentMatch[0];
                    const htmlText = lastStrategyText.replace(
                        percentText,
                        `<span class="percent-boost">${percentText}</span>`
                    );
                    if (strategyText) {
                        strategyText.innerHTML = htmlText;
                    }
                } else {
                    if (strategyText) {
                        strategyText.textContent = lastStrategyText;
                    }
                }
                if (strategyText) {
                    strategyText.classList.add('show');
                    strategyText.style.color = getStrategyTextColor(lastStrategyText);
                    requestAnimationFrame(() => {
                        fitTextToSingleLine(strategyText, 10);
                    });
                }
            }

            // Show the button
            document.getElementById('start-earn-btn').classList.remove('hidden');
            completedSequence = true; // Sequence is now complete, won't reset on release
            isSpinning = false; // Stop the spinning animation but keep effects

            // Show default cat image on completion
            if (cat.userData.isSprite && cat.userData.defaultTexture) {
                if (cat.userData.material && cat.userData.material.uniforms && cat.userData.material.uniforms.map) {
                    cat.userData.material.uniforms.map.value = cat.userData.defaultTexture;
                }
            }
        }
    }

    if (completedSequence) {
        if (currentTime - lastFireworkTime > 700) {
            spawnFireworkBurst(-2.2);
            spawnFireworkBurst(2.2);
            lastFireworkTime = currentTime;
        }
        updateFireworks();
    }

    renderer.render(scene, camera);
}

// Window resize handler
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    fitAllTextToSingleLine();
}

// Create a simple IAAI sound using Web Audio API (fallback)
function createIAAISound() {
    // This creates a simple IAAI-like sound effect
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.1);
    oscillator.frequency.exponentialRampToValueAtTime(660, audioContext.currentTime + 0.2);
    oscillator.frequency.exponentialRampToValueAtTime(440, audioContext.currentTime + 0.3);

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
}

// Initialize when page loads
window.addEventListener('load', init);