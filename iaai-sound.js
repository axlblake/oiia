// Authentic IAAI Cat Meme Sound Generator - matches the actual meme sound
let audioContext = null;
let soundInterval = null;
let isPlaying = false;

function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
}

function playIAAISound() {
    initAudioContext();
    
    if (isPlaying) return; // Already playing
    isPlaying = true;

    // Play IAAI sound continuously while holding
    const playSingleIAAI = () => {
        if (!isPlaying || !audioContext) return;

        // IAAI meme sound pattern: I-AA-I (high-low-high)
        // This matches the actual meme cat vocalization
        const totalDuration = 0.65; // Total duration of one IAAI sound
        let currentTime = audioContext.currentTime;

        // "I" - High pitched start (around 1000-1100 Hz)
        const osc1 = audioContext.createOscillator();
        const gain1 = audioContext.createGain();
        const filter1 = audioContext.createBiquadFilter();
        
        filter1.type = 'bandpass';
        filter1.frequency.setValueAtTime(2800, currentTime);
        filter1.Q.setValueAtTime(8, currentTime);
        
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(1047, currentTime); // C6
        osc1.frequency.exponentialRampToValueAtTime(1175, currentTime + 0.1); // D6
        
        gain1.gain.setValueAtTime(0, currentTime);
        gain1.gain.linearRampToValueAtTime(0.5, currentTime + 0.02);
        gain1.gain.exponentialRampToValueAtTime(0.3, currentTime + 0.15);
        gain1.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.2);
        
        osc1.connect(filter1);
        filter1.connect(gain1);
        gain1.connect(audioContext.destination);
        
        osc1.start(currentTime);
        osc1.stop(currentTime + 0.2);
        currentTime += 0.2;

        // "AA" - Lower, fuller sound (around 600-700 Hz)
        const osc2 = audioContext.createOscillator();
        const gain2 = audioContext.createGain();
        const filter2 = audioContext.createBiquadFilter();
        
        filter2.type = 'bandpass';
        filter2.frequency.setValueAtTime(1800, currentTime);
        filter2.Q.setValueAtTime(6, currentTime);
        
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(659, currentTime); // E5
        osc2.frequency.exponentialRampToValueAtTime(698, currentTime + 0.15); // F5
        osc2.frequency.exponentialRampToValueAtTime(622, currentTime + 0.25); // D#5
        
        gain2.gain.setValueAtTime(0, currentTime);
        gain2.gain.linearRampToValueAtTime(0.6, currentTime + 0.03);
        gain2.gain.setValueAtTime(0.6, currentTime + 0.1);
        gain2.gain.exponentialRampToValueAtTime(0.4, currentTime + 0.25);
        gain2.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.3);
        
        osc2.connect(filter2);
        filter2.connect(gain2);
        gain2.connect(audioContext.destination);
        
        osc2.start(currentTime);
        osc2.stop(currentTime + 0.3);
        currentTime += 0.3;

        // "I" - High pitched end (around 1000-1100 Hz)
        const osc3 = audioContext.createOscillator();
        const gain3 = audioContext.createGain();
        const filter3 = audioContext.createBiquadFilter();
        
        filter3.type = 'bandpass';
        filter3.frequency.setValueAtTime(3000, currentTime);
        filter3.Q.setValueAtTime(10, currentTime);
        
        osc3.type = 'sawtooth';
        osc3.frequency.setValueAtTime(988, currentTime); // B5
        osc3.frequency.exponentialRampToValueAtTime(1109, currentTime + 0.1); // C#6
        osc3.frequency.exponentialRampToValueAtTime(1047, currentTime + 0.15); // C6
        
        gain3.gain.setValueAtTime(0, currentTime);
        gain3.gain.linearRampToValueAtTime(0.55, currentTime + 0.02);
        gain3.gain.setValueAtTime(0.55, currentTime + 0.08);
        gain3.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.15);
        
        osc3.connect(filter3);
        filter3.connect(gain3);
        gain3.connect(audioContext.destination);
        
        osc3.start(currentTime);
        osc3.stop(currentTime + 0.15);
    };

    // Play immediately
    playSingleIAAI();

    // Then loop continuously every ~0.7 seconds (slight overlap for continuous feel)
    soundInterval = setInterval(() => {
        if (isPlaying && audioContext) {
            playSingleIAAI();
        }
    }, 700);
}

function stopIAAISound() {
    isPlaying = false;
    if (soundInterval) {
        clearInterval(soundInterval);
        soundInterval = null;
    }
}

// Export for use in main script
window.playIAAISound = playIAAISound;
window.stopIAAISound = stopIAAISound;