// Trevor Villwock and Eric Mulhern 2022-2023
// Tone.js documentation: https://tonejs.github.io/docs/14.7.77/index.html
let grid; // will eventually hold html element to which all grid squares are attached as children
let volSlider; // will eventually hold html slider element that controls volume
let envelope;
let reverb;
let vol;
let compressor;
let synths;

const ROWS = 10;
const COLUMNS = 10;
let running = false; // Boolean for whether clock is running 
let clockId;
const TEMPO = 1000; // milliseconds per clock tick

// Create a 2D Array to represent the current state of the grid for conway's game of life
let currentSquares = Array(ROWS);
for (let i = 0; i < ROWS; ++i) {
    currentSquares[i] = new Array(COLUMNS);
}

// Create a 2D Array to represent the state of the grid after the next clock tick
let nextSquares = Array(ROWS);
for (let i = 0; i < ROWS; ++i) {
    nextSquares[i] = new Array(COLUMNS);
}

/* We need two separate arrays because each square should change based on its present
/ surrounding conditions, not those after the next clock tick when the cells around it
/ may have changed. For example, cells in the second row shouldn't be affected by cells
/ in the first row becoming alive or dead in the same pass of the for loops through the
/ grid. */

// Specify frequencies for squares
let pitches = ["G", "A", "B", "D", "E"];
let octaves = 5;

function closeModal() {
    let modal = document.getElementById("popup");
    modal.style.display="none";
    Tone.start();
}

document.addEventListener("keypress", (event) => {
    // console.log(event.code);
    if (event.code == "Space") {
        // by default, space scrolls down. this prevents this
        event.preventDefault();
        let testSynth = new Tone.Synth({volume: -30});
        testSynth.connect(reverb);
        testSynth.triggerAttackRelease("G3", "8n");
        if (running) {    
            // console.log("stopping");
            stop();
        } else { 
            // console.log("starting");
            start();
        } 
    }
})

function updateSquare(newCurrentSquare, divId) {
  if (newCurrentSquare.html.style.backgroundColor == "green") { 
      newCurrentSquare.html.style.backgroundColor = "blue";
      newCurrentSquare.alive = false;
  } else {
      newCurrentSquare.html.style.backgroundColor = "green";
      newCurrentSquare.alive = true;
  } 
  console.log("toggling square " + divId);
}

window.onload = () => {
    // Create grid of squares
    grid = document.getElementById("grid");
    // console.log(grid);
    volSlider = document.getElementById("volSlider");
    vol = new Tone.Volume().toDestination();
    vol.volume.value = -100;
    compressor = new Tone.Compressor(-30, 10).connect(vol); // Threshold of -30db and compression ratio of 10:1
    reverb = new Tone.Reverb({decay: 10}).connect(compressor);
    envelope = new Tone.AmplitudeEnvelope({
        attack: 0.25,
        decay: 0,
        sustain: 0.25,
        release: 0.25
    }).connect(reverb);

    let baseVolume = -50;
    synths = {
        "G2": new Tone.Synth({volume: baseVolume}).connect(envelope),
        "A2": new Tone.Synth({volume: baseVolume}).connect(envelope),
        "B2": new Tone.Synth({volume: baseVolume}).connect(envelope),
        "D2": new Tone.Synth({volume: baseVolume}).connect(envelope),
        "E2": new Tone.Synth({volume: baseVolume}).connect(envelope),
        "G3": new Tone.Synth({volume: baseVolume}).connect(envelope),
        "A3": new Tone.Synth({volume: baseVolume}).connect(envelope),
        "B3": new Tone.Synth({volume: baseVolume}).connect(envelope),
        "D3": new Tone.Synth({volume: baseVolume}).connect(envelope),
        "E3": new Tone.Synth({volume: baseVolume}).connect(envelope),
        "G4": new Tone.Synth({volume: baseVolume}).connect(envelope),
        "A4": new Tone.Synth({volume: baseVolume}).connect(envelope),
        "B4": new Tone.Synth({volume: baseVolume}).connect(envelope),
        "D4": new Tone.Synth({volume: baseVolume}).connect(envelope),
        "E4": new Tone.Synth({volume: baseVolume}).connect(envelope),
        "G5": new Tone.Synth({volume: baseVolume}).connect(envelope),
        "A5": new Tone.Synth({volume: baseVolume}).connect(envelope),
        "B5": new Tone.Synth({volume: baseVolume}).connect(envelope),
        "D5": new Tone.Synth({volume: baseVolume}).connect(envelope),
        "E5": new Tone.Synth({volume: baseVolume}).connect(envelope),
        "G6": new Tone.Synth({volume: baseVolume}).connect(envelope),
        "A6": new Tone.Synth({volume: baseVolume}).connect(envelope),
        "B6": new Tone.Synth({volume: baseVolume}).connect(envelope),
        "D6": new Tone.Synth({volume: baseVolume}).connect(envelope),
        "E6": new Tone.Synth({volume: baseVolume}).connect(envelope)
    };      

    for (let i = 0; i < COLUMNS; ++i) {
        let octave = 6 - i % octaves; // This will start with the highest pitches on the top row
        for (let j = 0; j < ROWS; ++j) {
            const squareHtml = document.createElement("div");
            // Rows and columns will start with 1 and not 0. This is referred to as one-based array indexing.
            const divId = `r${i+1}c${j+1}`;
            squareHtml.id = divId;
            squareHtml.style.backgroundColor = "blue";
            grid.appendChild(squareHtml);
            let pitchName = pitches[j % pitches.length] + octave;
            
            console.log(`${divId} ${pitchName}`);
            
            const newCurrentSquare = {
                html: squareHtml,
                alive: false,
                pitch: pitchName
            };

            const newNextSquare = {
                color: "blue",
                alive: false,
                pitch: pitchName
            };

            squareHtml.addEventListener("mousedown", (e) => {
                updateSquare(newCurrentSquare, divId);
            });
            squareHtml.addEventListener("mouseover", (e) => {
                if (e.buttons === 1) {
                    updateSquare(newCurrentSquare, divId);
                }
            });

            currentSquares[i][j] = newCurrentSquare;
            nextSquares[i][j] = newNextSquare;
        }
    }
}

function playNotes() {
    // console.log("playing notes");
    // The 0.5 here means that the envelope will trigger the release 0.5 seconds after the attack
    envelope.triggerAttackRelease("0.5");
    let liveSquares = {};

    // This creates a list of pitches of live squares. There may be duplicates!
    for (let i = 0; i < COLUMNS; ++i) {
        for (let j = 0; j < ROWS; ++j) {
            if (currentSquares[i][j].alive) {
                //console.log(`${currentSquares[i][j].html.id}: ${currentSquares[i][j].pitch}`);
                
                // We create an object that stores the name of each pitch to play and keep track of
                // which pitches have been played so they don't get triggered twice. A 0 signifies a pitch
                // that has been played.
                liveSquares[currentSquares[i][j]] = 0;
            }
        }
    }

    console.log("liveSquares:");
    console.log(liveSquares);

    for (let i = 0; i < liveSquares.length; ++i) {
        synths[liveSquares[i]].volume.value += 10;
    }

    for (let i = 0; i < COLUMNS; ++i) {
        for (let j = 0; j < ROWS; ++j) {
            if (currentSquares[i][j].alive && !liveSquares[currentSquares[i][j].pitch]) {
                synths[currentSquares[i][j].pitch].triggerAttackRelease(currentSquares[i][j].pitch, "4n");
            }
        }
    }        
}

function updateGrid() {
    // console.log("updating grid")
    for (let i = 0; i < ROWS; ++i) {
        for (let j = 0; j < COLUMNS; ++j) {
            // Count number of neighbors alive
            let neighborCount = 0;
            
            if (j > 0 && currentSquares[i][j-1].alive)
                neighborCount++;
            if (j < COLUMNS - 1 && currentSquares[i][j+1].alive)
                neighborCount++;
            if (i > 0 && currentSquares[i-1][j].alive)
                neighborCount++;
            if (i > 0 && j > 0 && currentSquares[i-1][j-1].alive)
                neighborCount++;
            if (i > 0 && j < COLUMNS - 1 && currentSquares[i-1][j+1].alive)
                neighborCount++;
            if (i < ROWS - 1 && j > 0 && currentSquares[i+1][j-1].alive)
                neighborCount++;
            if (i < ROWS - 1 && currentSquares[i+1][j].alive)
                neighborCount++;
            if (i < ROWS - 1 && j < COLUMNS - 1 && currentSquares[i+1][j+1].alive)
                neighborCount++;

            // The algorithm for Conway's Game of Life
            if ((neighborCount == 3) || (neighborCount == 2 && currentSquares[i][j].alive)) {
                nextSquares[i][j].alive = true;
                nextSquares[i][j].color = "green";
            } else {
                nextSquares[i][j].alive = false;
                nextSquares[i][j].color = "blue";
            }

            // console.log("neighborCount for row " + i + " column " + j + ": " + neighborCount);
        }
    }

    for (let i = 0; i < COLUMNS; ++i) {
        for (let j = 0; j < ROWS; ++j) {
            currentSquares[i][j].alive = nextSquares[i][j].alive;
            currentSquares[i][j].html.style.backgroundColor = nextSquares[i][j].color;
        }
    }

}

function advanceClock() {
    // console.log("advancing clock");
    playNotes();
    setTimeout(()=>{updateGrid();}, TEMPO * 0.9);
}

function start() {
    running = true;
    advanceClock();
    clockId = setInterval(advanceClock, TEMPO);
    // console.log(`clockId: ${clockId}`);
}

function stop() {
    running = false;
    clearInterval(clockId);
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
      vol.volume.value = -1 * (100 - 13 * Math.log2(volSlider.value));
      console.log(vol.volume.value);
    }

    // console.log("setting volume");
}