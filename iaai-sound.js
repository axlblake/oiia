// Authentic IAAI Cat Meme Sound Generator - matches the actual meme sound
let audioContext = null;
let soundInterval = null;
let isPlaying = false;
const AUDIO_ELEMENT_ID = 'iaai-audio';
/**
 * @type {{
 *   offset: number,
 *   oscType: OscillatorType,
 *   filterFrequency: number,
 *   filterQ: number,
 *   freqSteps: { at: number, value: number, ramp: 'linear' | 'exponential' }[],
 *   gainSteps: { at: number, value: number, ramp: 'linear' | 'exponential' }[],
 *   duration: number
 * }[]}
 */
const IAAI_SEGMENTS = [
    {
        offset: 0,
        oscType: 'sawtooth',
        filterFrequency: 2800,
        filterQ: 8,
        freqSteps: [
            { at: 0, value: 900, ramp: 'linear' },
            { at: 0.1, value: 1000, ramp: 'exponential' }
        ],
        gainSteps: [
            { at: 0, value: 0, ramp: 'linear' },
            { at: 0.02, value: 0.4, ramp: 'linear' },
            { at: 0.15, value: 0.3, ramp: 'exponential' },
            { at: 0.2, value: 0.01, ramp: 'exponential' }
        ],
        duration: 0.2
    },
    {
        offset: 0.15,
        oscType: 'sawtooth',
        filterFrequency: 1500,
        filterQ: 6,
        freqSteps: [
            { at: 0, value: 550, ramp: 'linear' },
            { at: 0.15, value: 600, ramp: 'exponential' },
            { at: 0.25, value: 500, ramp: 'exponential' }
        ],
        gainSteps: [
            { at: 0, value: 0, ramp: 'linear' },
            { at: 0.03, value: 0.5, ramp: 'linear' },
            { at: 0.1, value: 0.5, ramp: 'linear' },
            { at: 0.25, value: 0.3, ramp: 'exponential' },
            { at: 0.3, value: 0.01, ramp: 'exponential' }
        ],
        duration: 0.3
    },
    {
        offset: 0.4,
        oscType: 'sawtooth',
        filterFrequency: 2800,
        filterQ: 10,
        freqSteps: [
            { at: 0, value: 850, ramp: 'linear' },
            { at: 0.1, value: 950, ramp: 'exponential' },
            { at: 0.15, value: 900, ramp: 'exponential' }
        ],
        gainSteps: [
            { at: 0, value: 0, ramp: 'linear' },
            { at: 0.02, value: 0.4, ramp: 'linear' },
            { at: 0.08, value: 0.4, ramp: 'linear' },
            { at: 0.15, value: 0.01, ramp: 'exponential' }
        ],
        duration: 0.15
    }
];

/**
 * Initialize the audio context for synth playback.
 */
function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
}

/**
 * @returns {HTMLAudioElement | null}
 */
function getIAAIAudioElement() {
    const element = document.getElementById(AUDIO_ELEMENT_ID);
    return element instanceof HTMLAudioElement ? element : null;
}

/**
 * @param {HTMLAudioElement} audioElement
 */
function playMediaIAAISound(audioElement) {
    if (isPlaying) return;
    isPlaying = true;
    audioElement.play();
}

/**
 * @param {HTMLAudioElement} audioElement
 */
function stopMediaIAAISound(audioElement) {
    isPlaying = false;
    audioElement.pause();
}

/**
 * @param {AudioContext} context
 * @param {number} startTime
 * @param {OscillatorType} oscType
 * @param {number} filterFrequency
 * @param {number} filterQ
 * @param {{ at: number, value: number, ramp: 'linear' | 'exponential' }[]} freqSteps
 * @param {{ at: number, value: number, ramp: 'linear' | 'exponential' }[]} gainSteps
 * @param {number} duration
 */
function scheduleIAAISegment(
    context,
    startTime,
    oscType,
    filterFrequency,
    filterQ,
    freqSteps,
    gainSteps,
    duration
) {
    const osc = context.createOscillator();
    const gain = context.createGain();
    const filter = context.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(filterFrequency, startTime);
    filter.Q.setValueAtTime(filterQ, startTime);

    osc.type = oscType;
    osc.frequency.setValueAtTime(freqSteps[0].value, startTime);
    freqSteps.slice(1).forEach((step) => {
        const time = startTime + step.at;
        const ramp = step.ramp === 'exponential' ? 'exponentialRampToValueAtTime' : 'linearRampToValueAtTime';
        osc.frequency[ramp](step.value, time);
    });

    gain.gain.setValueAtTime(gainSteps[0].value, startTime);
    gainSteps.slice(1).forEach((step) => {
        const time = startTime + step.at;
        const ramp = step.ramp === 'exponential' ? 'exponentialRampToValueAtTime' : 'linearRampToValueAtTime';
        gain.gain[ramp](step.value, time);
    });

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(context.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
}

/**
 * Play a single synthetic IAAI vocalization.
 */
function playSynthIAAIOnce() {
    if (!audioContext) return;
    const startTime = audioContext.currentTime;
    IAAI_SEGMENTS.forEach((segment) => {
        scheduleIAAISegment(
            audioContext,
            startTime + segment.offset,
            segment.oscType,
            segment.filterFrequency,
            segment.filterQ,
            segment.freqSteps,
            segment.gainSteps,
            segment.duration
        );
    });
}

/**
 * Start looping the synth IAAI sound.
 */
function startSynthLoop() {
    initAudioContext();
    if (isPlaying) return;
    isPlaying = true;
    playSynthIAAIOnce();
    soundInterval = setInterval(() => {
        if (isPlaying && audioContext) {
            playSynthIAAIOnce();
        }
    }, 600);
}

/**
 * Stop the synth loop.
 */
function stopSynthLoop() {
    isPlaying = false;
    if (soundInterval) {
        clearInterval(soundInterval);
        soundInterval = null;
    }
}

/**
 * Play IAAI sound using media file when available.
 */
function playIAAISound() {
    const audioElement = getIAAIAudioElement();
    if (audioElement && audioElement.getAttribute('src')) {
        playMediaIAAISound(audioElement);
        return;
    }
    startSynthLoop();
}

/**
 * Stop IAAI sound.
 */
function stopIAAISound() {
    const audioElement = getIAAIAudioElement();
    if (audioElement && audioElement.getAttribute('src')) {
        stopMediaIAAISound(audioElement);
        return;
    }
    stopSynthLoop();
}

// Export for use in main script
window.playIAAISound = playIAAISound;
window.stopIAAISound = stopIAAISound;