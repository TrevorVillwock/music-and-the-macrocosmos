let mainVolSlider;
let pitchSlider;
let cutoffSlider;
let lfoFreqSlider;
let lfoRangeSlider;
let rhythmMenu;
let pitchNumber;
let filterNumber;
let amNumber;
let lfoRangeNumber;
let lfoFreqNumber;
let delayTimeSlider;
let delayTimeNumber;
let delayFeedbackSlider;
let delayFeedbackNumber;
let delayVolSlider;

window.onload = function () {
    mainVolSlider = document.getElementById("mainVolumeSlider");
    pitchSlider = document.getElementById("pitchSlider");
    cutoffSlider = document.getElementById("cutoffSlider");
    amSlider = document.getElementById("amSlider");
    lfoFreqSlider = document.getElementById("lfoFreqSlider");
    lfoRangeSlider = document.getElementById("lfoRangeSlider");
    rhythmMenu = document.getElementById("notes");
    pitchNumber = document.getElementById("pitchNumber");
    filterNumber = document.getElementById("filterNumber");
    amNumber = document.getElementById("amNumber");
    lfoFreqNumber = document.getElementById("lfoFreqNumber");
    lfoRangeNumber = document.getElementById("lfoRangeNumber");
    delayTimeSlider = document.getElementById("delayTimeSlider");
    delayTimeNumber = document.getElementById("delayTimeNumber");
    delayFeedbackSlider = document.getElementById("delayFeedbackSlider");
    delayFeedbackNumber = document.getElementById("delayFeedbackNumber");
    delayVolSlider = document.getElementById("delayVolumeSlider");
}

// The first 3 octaves and first 8 pitches of the harmonic series starting on approximately G2 (98 Hz), 
// an octave and a fourth below middle C 
let notes = [100, 200, 300, 400, 500, 600, 700, 800];
let noteLength = "+0.5"; // in seconds

// toDestination() connects the sound produced to your computer headphones/speakers
const mainVol = new Tone.Volume(-25).toDestination();
const sawSynth = new Tone.AMOscillator(100, "sawtooth64", "sine", 0.1);
const filter = new Tone.Filter(1500, "lowpass");
const delay = new Tone.FeedbackDelay("8n", 0.5);
delay.maxDelay = 5;

// These lines create the "signal chain" of effects, which we can visualize like this:
// synth ---> filter ---> delay ---> main volume
sawSynth.connect(filter);
filter.connect(delay);
filter.connect(mainVol);
delay.connect(mainVol);

const lfo1 = new Tone.LFO(0, 1, 2);
let lfoRange = 1;
lfo1.connect(sawSynth.frequency);
lfo1.start();

// Boolean variable indicating whether randomness is turned on or off
let randomSpeed = 0;
let randomPitch = 0;

// Set default value for BPM (beats per minute). 60 BPM is one beat per second.
Tone.Transport.bpm.value = 60;

let clock = Tone.Transport.scheduleRepeat(() => {
    //console.log("synth frequency: " + sawSynth.frequency.value)
    sawSynth.start()
    sawSynth.stop(noteLength);
}, "4n");

console.log(`clock: ${clock}`);

// Run when start button is clicked
function start() {
    Tone.Transport.start();
}

// Run when the stop button is clicked
function stop() {
    //Tone.stop();
    Tone.Transport.stop();
}

function setMainVolume() {
    
    /************************************************************
    The html slider gives us values 0-200, which we map
    to be between -100 and 0 dB because that's what the
    Tone.js mainVolume object expects.
    For an explanation of how decibels work check out this page:
    https://ehomerecordingstudio.com/decibels/
    *************************************************************/ 
  
    // log2(0) is undefined and will throw an error since there's no power of 2 that equals zero.
    if (mainVolSlider.value != 0) {
        mainVol.volume.value = -1 * (100 - 13 * Math.log2(mainVolSlider.value));
    }
}

function setPitch() {
    //console.log("setting pitch with LFO");
    //console.log("slider value: " + pitchSlider.value);

    let lfoTop = parseInt(pitchSlider.value) * lfoRange;
    let lfoBottom = parseInt(pitchSlider.value) / lfoRange;
    lfo1.set({max: lfoTop, min: lfoBottom});
    pitchNumber.value = pitchSlider.value;
}

function updateSettings() {
    
    console.log("cancelling Transport");
    Tone.Transport.cancel(clock);
    console.log("transport cancelled");
    console.log("setting new clock");

    if (randomSpeed && randomPitch) {
        console.log("both");
        clock = Tone.Transport.scheduleRepeat(() => {
            setLfoRange();
            Tone.Transport.bpm.value = 40 + Math.random() * 360;
            sawSynth.start();
            sawSynth.stop(noteLength);
            console.log("playing from randomSpeed & randomPitch");
        }, rhythmMenu.value, "0s");
    } else if (randomSpeed) {
        clock = Tone.Transport.scheduleRepeat(() => {
            Tone.Transport.bpm.value = 40 + Math.random() * 360;
            sawSynth.start();
            sawSynth.stop(noteLength);
            console.log("playing from randomSpeed");
        }, rhythmMenu.value, "0s");
    } else if (randomPitch) {
        clock = Tone.Transport.scheduleRepeat(() => {
            setLfoRange();
            sawSynth.start();
            sawSynth.stop(noteLength);
            console.log("playing from randomPitch");
        }, rhythmMenu.value, "0s");
    } else {
        clock = Tone.Transport.scheduleRepeat(() => {
            sawSynth.start();
            sawSynth.stop(noteLength);
            console.log("playing normally");
        }, rhythmMenu.value, "0s");
    }

    console.log("new clock set");
}

function setLfoRange() {
    lfoRange = lfoRangeSlider.value;
    let note = notes[Math.floor(Math.random() * notes.length)]
    let lfoTop = (parseInt(pitchSlider.value) + note) * lfoRange;
    let lfoBottom = (parseInt(pitchSlider.value) + note) / lfoRange;
    lfo1.set({min: lfoBottom, max: lfoTop});
    console.log("lfo top: " + lfoTop);
    console.log("lfo bottom: " + lfoBottom);
    lfoRangeNumber.value = lfoRangeSlider.value;
}

function setLfoFreq() {
    lfo1.set({frequency: Math.log2(lfoFreqSlider.value) - 1});
    lfoFreqNumber.value = Math.log2(lfoFreqSlider.value) - 1;
    // console.log(`lfo frequency: ${lfo1.frequency.value}`);
}

function toggleRandomSpeed() {
    //console.log("toggling random speed");
    randomSpeed = !randomSpeed;
    updateSettings();
}

function toggleRandomPitch() {
    //console.log("toggling random pitch");
    randomPitch = !randomPitch;
    updateSettings();
}

function setRhythm() {
    updateSettings(); 
    //console.log("set rhythmic value");
}

function setFilterCutoff() {
    // Map a cutoff slider value of 1-14.3 to a range of 150 to 
    // 20000 Hertz using exponential scaling. 20000 Hz is the highest 
    // most humans can hear, and 2^14.3 equals approximately 20000.
    // We use exponential scaling to make it so that our ears percieve
    // an even slide across the frequency range.
    filter.frequency.value = 150 + Math.pow(2, cutoffSlider.value);
    filterNumber.value = filter.frequency.value;
    // console.log(filter.frequency.value);
}

function setAMFreq() {
    sawSynth.set({harmonicity: amSlider.value});
    amNumber.value = amSlider.value;
    // console.log("set AM frequency");
}

function setDelayTime() {
    delay.set({delayTime: delayTimeSlider.value});
    delayTimeNumber.value = delayTimeSlider.value;
}

function setDelayFeedback() {
    delay.set({feedback: delayFeedbackSlider.value});
    delayFeedbackNumber.value = delayFeedbackSlider.value;
}

function setDelayVolume() { 

    // The "dry" signal is the signal without effects, and the "wet" signal is the signal with effects
    // 0.0 is a totally dry signal, and 1.0 is totally wet signal
    // For the delay, 1.0 means that the first echo will be the exact same volume as the initial sound. 
    delay.set({wet: delayVolumeSlider.value});
}

function closeModal() {
    let modal = document.getElementById("popup");
    /* console.log("modal:")
    console.log(modal)
    console.log("closing modal"); */
    modal.style.display="none";
    Tone.start();
}