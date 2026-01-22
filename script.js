// Three.js IAAI Cat Meme
let scene, camera, renderer, cat, particles = [], confetti = [];
let isSpinning = false;
let startTime = 0;
let completedSequence = false;
let strategyTexts = [
    "🐱 Scanning strategies... 🐱",
    "📈 + 23% Strategy Found! 🚀",
    "💰 + 67% Strategy Found! 💎",
    "🔥 + 128% Strategy Found! ⚡",
    "🎯 + 178% Strategy Found! 🌟",
    "💎 + 256% Strategy Found! 💰",
    "🚀 + 345% Strategy Found! 🎊",
    "⚡ + 512% Strategy Found! 🎯"
];
let currentStrategyIndex = 0;
let lastStrategyTime = 0;

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
    createCat();

    // Create particle system
    createParticles();

    // Event listeners
    setupEventListeners();

    // Hide loading
    document.getElementById('loading').style.display = 'none';

    // Start animation loop
    animate();
}

// Setup lighting
function setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
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
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x4ecdc4, 0.5, 100);
    pointLight2.position.set(5, -5, 5);
    scene.add(pointLight2);
}

// Create IAAI meme cat model (ultra-compact, folded position like the meme)
function createCat() {
    cat = new THREE.Group();

    // Main body (ultra-compact sphere, very small and curled up)
    const bodyGeometry = new THREE.SphereGeometry(0.6, 20, 20);
    const bodyMaterial = new THREE.MeshPhongMaterial({
        color: 0xffdbac,
        shininess: 40
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.scale.set(1.4, 0.6, 1.4); // Very flattened and compact
    body.position.set(0, -0.3, 0); // Lower position
    body.castShadow = true;
    cat.add(body);

    // Head (tiny and adorable, barely visible above the body)
    const headGeometry = new THREE.SphereGeometry(0.35, 20, 20);
    const head = new THREE.Mesh(headGeometry, bodyMaterial);
    head.position.set(0, 0.2, 0.1); // Close to body
    head.scale.set(1.2, 0.8, 1.2); // Flattened like real cat
    head.castShadow = true;
    cat.add(head);

    // Ears (small and folded back, barely visible)
    const earGeometry = new THREE.ConeGeometry(0.12, 0.25, 6);
    const earMaterial = new THREE.MeshPhongMaterial({ color: 0xffdbac });

    const leftEar = new THREE.Mesh(earGeometry, earMaterial);
    leftEar.position.set(-0.2, 0.5, 0.05);
    leftEar.rotation.set(0.5, 0, -0.3); // Folded back
    cat.add(leftEar);

    const rightEar = new THREE.Mesh(earGeometry, earMaterial);
    rightEar.position.set(0.2, 0.5, 0.05);
    rightEar.rotation.set(0.5, 0, 0.3); // Folded back
    cat.add(rightEar);

    // Eyes (very small, almost closed in the folded position)
    const eyeGeometry = new THREE.SphereGeometry(0.04, 8, 8);
    const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });

    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.12, 0.28, 0.4);
    leftEye.scale.set(1.5, 0.5, 1); // Very narrow, almost closed
    cat.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.12, 0.28, 0.4);
    rightEye.scale.set(1.5, 0.5, 1); // Very narrow, almost closed
    cat.add(rightEye);

    // Tiny pupils (barely visible)
    const pupilGeometry = new THREE.SphereGeometry(0.015, 6, 6);
    const pupilMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });

    const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    leftPupil.position.set(-0.1, 0.3, 0.45);
    cat.add(leftPupil);

    const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    rightPupil.position.set(0.1, 0.3, 0.45);
    cat.add(rightPupil);

    // Nose (tiny pink dot)
    const noseGeometry = new THREE.SphereGeometry(0.02, 6, 6);
    const noseMaterial = new THREE.MeshPhongMaterial({ color: 0xffb6c1 });
    const nose = new THREE.Mesh(noseGeometry, noseMaterial);
    nose.position.set(0, 0.18, 0.42);
    cat.add(nose);

    // Legs (ALL TUCKED TIGHTLY UNDER THE BODY - this is the key IAAI look)
    const legGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.3, 8);
    const legMaterial = new THREE.MeshPhongMaterial({ color: 0xffdbac });

    // Legs tucked completely under the body - very compact
    const legs = [];
    const legPositions = [
        { pos: [-0.15, -0.5, 0.15], rot: [Math.PI/2, 0, -0.5], name: 'frontLeft' },  // front left
        { pos: [0.15, -0.5, 0.15], rot: [Math.PI/2, 0, 0.5], name: 'frontRight' },   // front right
        { pos: [-0.12, -0.5, -0.15], rot: [Math.PI/2, 0, -0.3], name: 'backLeft' }, // back left
        { pos: [0.12, -0.5, -0.15], rot: [Math.PI/2, 0, 0.3], name: 'backRight' }   // back right
    ];

    legPositions.forEach((legData, index) => {
        const leg = new THREE.Mesh(legGeometry, legMaterial);
        leg.position.set(...legData.pos);
        leg.rotation.set(...legData.rot);
        leg.scale.set(1, 0.6, 1); // Very short and stubby
        leg.castShadow = true;
        leg.name = legData.name;
        legs.push(leg);
        cat.add(leg);
    });

    // Tiny paws (barely visible, tucked under)
    const pawGeometry = new THREE.SphereGeometry(0.06, 8, 8);
    const paws = [];
    const pawPositions = [
        { pos: [-0.15, -0.65, 0.15], name: 'frontLeftPaw' },  // front left paw
        { pos: [0.15, -0.65, 0.15], name: 'frontRightPaw' },   // front right paw
        { pos: [-0.12, -0.65, -0.15], name: 'backLeftPaw' }, // back left paw
        { pos: [0.12, -0.65, -0.15], name: 'backRightPaw' }   // back right paw
    ];

    pawPositions.forEach((pawData, index) => {
        const paw = new THREE.Mesh(pawGeometry, legMaterial);
        paw.position.set(...pawData.pos);
        paw.scale.set(1.5, 0.4, 1.5); // Very flat
        paw.castShadow = true;
        paw.name = pawData.name;
        paws.push(paw);
        cat.add(paw);
    });

    // Tail (tightly curled under the body, almost invisible)
    const tailGeometry = new THREE.TorusGeometry(0.12, 0.06, 8, 12, Math.PI * 1.8);
    const tailMaterial = new THREE.MeshPhongMaterial({ color: 0xffdbac });
    const tail = new THREE.Mesh(tailGeometry, tailMaterial);
    tail.position.set(0, -0.4, -0.3);
    tail.rotation.set(Math.PI/2, 0, Math.PI/4);
    tail.castShadow = true;
    tail.name = 'tail';
    cat.add(tail);

    // Whiskers (very fine, barely visible)
    const whiskerMaterial = new THREE.MeshBasicMaterial({ color: 0xdddddd });

    // Left whiskers (3 whiskers)
    for (let i = 0; i < 3; i++) {
        const whiskerGeometry = new THREE.CylinderGeometry(0.003, 0.003, 0.2, 4);
        const whisker = new THREE.Mesh(whiskerGeometry, whiskerMaterial);
        whisker.position.set(-0.25, 0.25 + i * 0.03, 0.25);
        whisker.rotation.z = Math.PI / 8;
        cat.add(whisker);
    }

    // Right whiskers (3 whiskers)
    for (let i = 0; i < 3; i++) {
        const whiskerGeometry = new THREE.CylinderGeometry(0.003, 0.003, 0.2, 4);
        const whisker = new THREE.Mesh(whiskerGeometry, whiskerMaterial);
        whisker.position.set(0.25, 0.25 + i * 0.03, 0.25);
        whisker.rotation.z = -Math.PI / 8;
        cat.add(whisker);
    }

    // Scale the entire cat to be very small and compact (like the IAAI meme)
    cat.scale.set(0.6, 0.6, 0.6);

    // Store references for unfolding animation
    cat.userData = {
        legs: legs,
        paws: paws,
        tail: tail,
        initialScale: cat.scale.clone(),
        initialPawPositions: pawPositions.map(p => ({ ...p.pos })) // Store initial positions
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

// Create explosive IAAI-style confetti
function createConfetti() {

    // Create more confetti pieces for explosive effect
    for (let i = 0; i < 150; i++) {
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
    canvas.addEventListener('mousedown', startIAAI);
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startIAAI();
    });

    canvas.addEventListener('mouseup', stopIAAI);
    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        stopIAAI();
    });

    // Also stop on mouse leave
    canvas.addEventListener('mouseleave', stopIAAI);

    // Window resize
    window.addEventListener('resize', onWindowResize);
}

// Start IAAI sequence when clicked/pressed
function startIAAI() {
    if (isSpinning) return;

    isSpinning = true;
    startTime = Date.now();
    completedSequence = false; // Reset completion flag

    // Play IAAI sound continuously while holding
    if (window.playIAAISound) {
        window.playIAAISound();
    }

    // Create confetti
    createConfetti();

    // Start strategy text sequence
    showNextStrategy();
}

// Stop IAAI sequence when released
function stopIAAI() {
    if (!isSpinning) return;

    // If sequence is completed, keep the final state
    if (completedSequence) {
        return;
    }

    // Stop spinning and reset to default state
    isSpinning = false;

    // Reset cat to initial compact folded position
    cat.rotation.set(0, 0, 0);
    cat.position.set(0, 0, 0);
    cat.scale.set(0.6, 0.6, 0.6);

    // Reset legs to folded position
    if (cat.userData.legs) {
        cat.userData.legs[0].rotation.z = -0.5; // front left
        cat.userData.legs[1].rotation.z = 0.5;  // front right
        cat.userData.legs[2].rotation.z = -0.3; // back left
        cat.userData.legs[3].rotation.z = 0.3;  // back right
    }

    // Reset paws to initial position
    if (cat.userData.paws && cat.userData.initialPawPositions) {
        cat.userData.paws.forEach((paw, index) => {
            if (cat.userData.initialPawPositions[index]) {
                paw.position.set(...cat.userData.initialPawPositions[index]);
            }
        });
    }

    // Reset tail to curled position
    if (cat.userData.tail) {
        cat.userData.tail.rotation.z = Math.PI/4;
    }

    // Clear confetti
    confetti.forEach(piece => {
        scene.remove(piece);
    });
    confetti = [];

    // Clear particles
    particles.forEach(particle => {
        scene.remove(particle);
    });
    particles = [];

    // Reset strategy text
    const strategyText = document.getElementById('strategy-text');
    strategyText.classList.remove('show');
    strategyText.textContent = "";
    currentStrategyIndex = 0;
    lastStrategyTime = 0;

    // Hide start earn button if not completed
    document.getElementById('start-earn-btn').classList.add('hidden');
}

// Show next strategy text (cycles continuously)
function showNextStrategy() {
    const strategyText = document.getElementById('strategy-text');

    // Cycle through strategy texts continuously
    strategyText.textContent = strategyTexts[currentStrategyIndex % strategyTexts.length];
    strategyText.classList.add('show');

    // Hide after 1 second
    setTimeout(() => {
        strategyText.classList.remove('show');
        currentStrategyIndex++;
        lastStrategyTime = Date.now();
    }, 1000);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    const currentTime = Date.now();

    if (isSpinning || completedSequence) {
        // IAAI-style rolling and bouncing animation (only when spinning or completed)
        if (isSpinning) {
            const elapsed = currentTime - startTime;
            const unfoldProgress = Math.min(elapsed / 2000, 1); // Unfold over 2 seconds

            // Fast spinning rotation (like cat rolling)
            cat.rotation.y += 0.08;

            // Bouncing motion (cat tumbling)
            cat.rotation.x = Math.sin(elapsed * 0.003) * 0.3;
            cat.rotation.z = Math.cos(elapsed * 0.004) * 0.2;

            // Up and down bouncing
            cat.position.y = Math.sin(elapsed * 0.006) * 0.3;

            // Side-to-side rolling motion
            cat.position.x = Math.sin(elapsed * 0.004) * 0.2;

            // Unfolding animation - cat gradually opens up
            if (unfoldProgress < 1) {
                // Legs unfold outward
                const legSpread = unfoldProgress * 0.8;
                cat.userData.legs[0].rotation.z = -0.5 + legSpread; // front left unfolds
                cat.userData.legs[1].rotation.z = 0.5 - legSpread;  // front right unfolds
                cat.userData.legs[2].rotation.z = -0.3 + legSpread; // back left unfolds
                cat.userData.legs[3].rotation.z = 0.3 - legSpread;  // back right unfolds

                // Paws move down as legs extend
                cat.userData.paws.forEach((paw, index) => {
                    if (cat.userData.initialPawPositions[index]) {
                        const initialY = cat.userData.initialPawPositions[index][1];
                        const pawDrop = unfoldProgress * 0.15;
                        paw.position.y = initialY - pawDrop;
                    }
                });

                // Tail uncurls slightly
                cat.userData.tail.rotation.z = Math.PI/4 - unfoldProgress * 0.3;

                // Cat grows slightly as it "wakes up"
                const growScale = 0.6 + unfoldProgress * 0.4;
                cat.scale.set(growScale, growScale, growScale);
            }

            // Scaling effect for more dynamic feel (only after unfolding)
            if (unfoldProgress >= 1) {
                const scale = 1 + Math.sin(elapsed * 0.008) * 0.1;
                cat.scale.set(scale, scale, scale);
            }
        }

        // Update particles (always animate when present)
        particles.forEach(particle => {
            particle.rotation.x += 0.01;
            particle.rotation.y += 0.01;
            if (particle.material.opacity < 1) {
                particle.material.opacity += 0.02;
            }
        });

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

            // Fade out over time
            if (piece.material.opacity > 0) {
                piece.material.opacity -= 0.003;
            }

            // Reset confetti that falls too low or fades out (only when spinning)
            if (isSpinning && (piece.position.y < -3 || piece.material.opacity <= 0)) {
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
        if (isSpinning && currentTime - lastStrategyTime > 800) {
            showNextStrategy();
        }

        // Show "Start Earn!" button after 10 seconds and mark as completed (only when spinning)
        if (isSpinning && currentTime - startTime > 10000 && !completedSequence) {
            document.getElementById('start-earn-btn').classList.remove('hidden');
            completedSequence = true; // Sequence is now complete, won't reset on release
            isSpinning = false; // Stop the spinning animation but keep effects
        }
    }

    renderer.render(scene, camera);
}

// Window resize handler
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
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