// Trevor Villwock 2022-2023
// Tone.js documentation: https://tonejs.github.io/docs/14.7.77/index.html

// Declare variables here so they have the right scope
let startButton;
let volSlider;
let vol;
let span;
let reverb;
let currentSquare; // Holds square object mouse is currently hovering over
const frequencies = [200, 300, 400, 500, 600, 700, 800, 900]; // starting pitches of the squares in Hertz

// Attack Decay Sustain Release (ADSR) Envelope used for all synthesizers
let synthEnvelope = {
    attack: 0.5, // seconds it takes for the sound to fade in
    decay: 0, // seconds it takes for the sound to fade down from 
              // full volume (1.0) to the sustain level. If the decay is
              // 0, the volume goes directly from 0 to the sustain level.
    sustain: 0.4, // volume
    release: 5 // seconds it takes for the sound to fade out once the mouse leaves
               // the square
};

// Boolean flag determining whether mouse movement within the square affects pitch
let controlPitch = false;

document.onkeydown = (event) => {
    console.log(event);
    if (event.key == "Shift") {
        controlPitch = !controlPitch;
        console.log("changed control of pitch");
    } else if (event.key == " ") {
        console.log("reset pitches");
        controlPitch = false;
        square1.synth.frequency.value = square1.baseFrequency;
        square2.synth.frequency.value = square2.baseFrequency;
        square3.synth.frequency.value = square3.baseFrequency;
        square4.synth.frequency.value = square4.baseFrequency;
        square5.synth.frequency.value = square5.baseFrequency;
        square6.synth.frequency.value = square6.baseFrequency;
        square7.synth.frequency.value = square7.baseFrequency;
        square8.synth.frequency.value = square8.baseFrequency;
    } 
}

document.onmousemove = (event) => {
    //console.log("horizontal position: " + event.clientX);
    //console.log("vertical position: " + event.clientY);
    if (controlPitch) {
        console.log("controlling pitch");
        currentSquare.synth.frequency.value = currentSquare.baseFrequency - (event.clientY - currentSquare.top) / 2;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // Get necessary elements from html once page is loaded
    startButton = document.getElementById("startBtn");
    span = document.getElementById("theSpan");
    console.log("span:");
    console.log(span);
    volSlider = document.getElementById("volumeSlider");
    vol = new Tone.Volume(-25).toDestination();
    vol.volume.value = -1 * (100 - 13 * Math.log2(volSlider.value)) - 40;
    
    // For some reason the Tone.Reverb object only has toMaster() and not toDestination()
    // Reverb time initiated to 100 seconds
    let reverb = new Tone.Reverb(100).connect(vol);
    reverb.generate();

    /* You might notice here that the volumes of the pitches are different. Why is this?
    The human ear is naturally more sensitive to higher sounds, so they are percieved as slightly
    louder than low sounds even if the measured amplitude (height) of the waves was the same.
    Be careful not to confuse amplitude and frequency however. The amplitude of a wave is what we perceive 
    as volume and is the measurement of a soundwave from crest to trough. On an x-y graph of a soundwave, this
    is the vertical axis or y-axis. The frequency is the rate at which the wave oscillates and is measured in Hertz (Hz). 
    One Hertz is one complete cycle of the wave per second, 2 is twice per second, etc.
    
    More explanation:
    https://www.quora.com/Why-are-higher-frequency-sounds-louder-than-lower-frequency-sounds
    */
    square1 = {
        synth: new Tone.Synth({
        oscillator: {
            type: "sine",
            volume: -5,
            frequency: 200
        },
        envelope: synthEnvelope
    }).connect(reverb),
        baseFrequency: frequencies[0],
        top: 0,
        left: 0,
    }
    
    square2 = {
        synth: new Tone.Synth({
            oscillator: {
                type: "sine",
                volume: -15,
                frequency: 300
            },
            envelope: synthEnvelope
        }).connect(reverb),
        baseFrequency: frequencies[1],
        top: 0,
        left: 250
    }
    
    square3 = {
        synth: new Tone.Synth({
            oscillator: {
                type: "sine",
                volume: -15,
                frequency: 400
            },
            envelope: synthEnvelope
        }).connect(reverb),
        baseFrequency: frequencies[2],
        top: 0,
        left: 500
    }
    
    square4 = {
        synth: new Tone.Synth({
            oscillator: {
                type: "sine",
                volume: -20,
                frequency: 500
            },
            envelope: synthEnvelope
        }).connect(reverb),
        baseFrequency: frequencies[3],
        top: 0,
        left: 750
    }

    square5 = {
        synth: new Tone.Synth({
            oscillator: {
                type: "sine",
                volume: -20,
                frequency: 600
            },
            envelope: synthEnvelope
        }).connect(reverb),
        baseFrequency: frequencies[4],
        top: 250,
        left: 0
    }
    
    square6 = {
        synth: new Tone.Synth({ 
            oscillator: {
                type: "sine",
                volume: -20,
                frequency: 700
            }, 
            envelope: synthEnvelope
        }).connect(reverb),
        baseFrequency: frequencies[5],
        top: 250,
        left: 250
    }
    
    square7 = {
        synth: new Tone.Synth({
            oscillator: {
                type: "sine",
                volume: -20,
                frequency: 800
            },
            envelope: synthEnvelope
        }).connect(reverb),
        baseFrequency: frequencies[6],
        top: 250,
        left: 500
    }
    
    square8 = {
        synth: new Tone.Synth({
            oscillator: {
                type: "sine",
                volume: -20,
                frequency: 900
            },
            envelope: synthEnvelope
        }).connect(reverb),
        baseFrequency: frequencies[7],
        top: 250,
        left: 750
    }

    Tone.start();
    Tone.Transport.start();
});

// Set the time delay between when the user's mouse leaves a square
// and the triggerRelease message is sent
let releaseDelay = "+0.5"

function playSquare1() {
    console.log("playing square 1");
    currentSquare = square1;
    square1.synth.triggerAttack(square1.synth.frequency.value);
}

function playSquare2() {
    currentSquare = square2;
    square2.synth.triggerAttack(square2.synth.frequency.value);
}

function playSquare3() {
    currentSquare = square3;
    square3.synth.triggerAttack(square3.synth.frequency.value);
}

function playSquare4() {
    currentSquare = square4;
    square4.synth.triggerAttack(square4.synth.frequency.value);
}

function playSquare5() {
    currentSquare = square5;
    square5.synth.triggerAttack(square5.synth.frequency.value);
}

function playSquare6() {
    currentSquare = square6;
    square6.synth.triggerAttack(square6.synth.frequency.value);
}

function playSquare7() {
    currentSquare = square7;
    square7.synth.triggerAttack(square7.synth.frequency.value);
}

function playSquare8() {
    currentSquare = square8;
    square8.synth.triggerAttack(square8.synth.frequency.value);
}

function stopSquare1() {
    square1.synth.triggerRelease(releaseDelay);
}

function stopSquare2() {
    square2.synth.triggerRelease(releaseDelay);
}

function stopSquare3() {
    square3.synth.triggerRelease(releaseDelay);
}

function stopSquare4() {
    square4.synth.triggerRelease(releaseDelay);
}

function stopSquare5() {
    square5.synth.triggerRelease(releaseDelay);
}

function stopSquare6() {
    square6.synth.triggerRelease(releaseDelay);
}

function stopSquare7() {
    square7.synth.triggerRelease(releaseDelay);
}

function stopSquare8() {
    square8.synth.triggerRelease(releaseDelay);
}

function setVolume() {
    
    /************************************************************
    The html slider gives us values 0-200, which we map
    to be between -100 and 0 dB because that's what the
    Tone.js Volume object expects.
    For an explanation of how decibels work check out this page:
    https://ehomerecordingstudio.com/decibels/

    *************************************************************/ 
  
    // log2(0) is undefined and will throw an error since there's no power of 2 that equals zero.
    if (volSlider.value != 0) {
      vol.volume.value = -1 * (100 - 13 * Math.log2(volSlider.value)) - 20;
      console.log(vol.volume.value);
    }
}

// Close "Click to start" window
function closeModal() {
    let modal = document.getElementById("popup");
    console.log("modal:")
    console.log(modal)
    console.log("closing modal");
    modal.style.display="none";
}
