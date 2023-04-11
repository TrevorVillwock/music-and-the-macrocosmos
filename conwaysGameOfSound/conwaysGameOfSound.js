let grid; // will eventually hold html element to which all grid squares are attached as children
const ROWS = 10;
const COLUMNS = 10;
let running = false; // Boolean for whether clock is running 
let notesClock;
let gridClock;
let clockId;
const TEMPO = 1000; // milliseconds per clock tick
let presets = {}; // dictionary of supplied and user created presets which themselves are dictionaries
                  // will eventually convert this to save presets in a json file
let savePresetButton;
let presetMenu;
let presetInput;

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

let reverb = new Tone.Reverb({decay: 10}).toDestination();

let envelope = new Tone.AmplitudeEnvelope({
    attack: 0.25,
    decay: 0,
    sustain: 0.25,
    release: 0.25
}).connect(reverb);

function closeModal() {
    let modal = document.getElementById("popup");
    modal.style.display="none";
    Tone.start();
}

document.addEventListener("keypress", (event) => {
  console.log(event.code);
  if (event.code == "Space") {
      // by default, space scrolls down. this prevents this
      event.preventDefault();
        if (running) {    
            console.log("stopping");
            stop();
        } else { 
            console.log("starting");
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
    console.log(grid);

    presetMenu = document.getElementById("preset-menu");
    presetInput = document.getElementById("preset-input");

    savePresetButton = document.getElementById("save-preset-button");
    savePresetButton.addEventListener("click", () => {
        let presetName = presetInput.value
        console.log(`saving ${presetName}`);
        savePreset(presetName);
    });

    for (let i = 0; i < COLUMNS; ++i) {
        let octave = 2 + i % octaves;
        for (let j = 0; j < ROWS; ++j) {
            const squareHtml = document.createElement("div");
            // Rows and columns will start with 1 and not 0. This is referred to as one-based array indexing.
            const divId = `r${i+1}c${j+1}`;
            squareHtml.id = divId;
            squareHtml.style.backgroundColor = "blue";
            grid.appendChild(squareHtml);
            const pitchName = pitches[j % pitches.length] + octave;
            
            console.log(`${divId} ${pitchName}`);

            // Volume is in decibels
            const synth = new Tone.Synth({volume: -30}).connect(envelope);
            
            const newCurrentSquare = {
                html: squareHtml,
                alive: false,
                pitch: pitchName,
                instrument: synth
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
    console.log("playing notes");
    // The 0.5 here means that the envelope will trigger the release 0.5 seconds after the attack
    envelope.triggerAttackRelease("0.5");

    for (let i = 0; i < COLUMNS; ++i) {
        for (let j = 0; j < ROWS; ++j) {
            if (currentSquares[i][j].alive) {
                console.log(`${currentSquares[i][j].html.id}: ${currentSquares[i][j].pitch}`);
                currentSquares[i][j].instrument.triggerAttackRelease(currentSquares[i][j].pitch, 1.0);
            }
        }
    }
}

function updateGrid() {
    console.log("updating grid")
    for (let i = 0; i < ROWS; ++i) {
        for (let j = 0; j < COLUMNS; ++j) {
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
    console.log("advancing clock");
    playNotes();
    setTimeout(()=>{updateGrid();}, TEMPO * 0.9);
}

function start() {
    running = true;
    advanceClock();
    clockId = setInterval(advanceClock, TEMPO);
    console.log(`clockId: ${clockId}`);
};

function stop() {
    running = false;
    clearInterval(clockId);
}

function savePreset(name) {
    let boardState = {};
    for (let i = 0; i < COLUMNS; ++i) {
        for (let j = 0; j < ROWS; ++j) {
            let squareId = `r${i}c${j}`;

            // array method
            boardState[squareId] = currentSquares[i][j].alive;
        }
    }
    presets[name] = boardState;
    console.log(presets);

    console.log(`presetMenu.options.length: ${presetMenu.options.length}`)

    presetMenu.options[presetMenu.options.length] = new Option(name);
}

function loadPreset() {
    let presetName = presetMenu.value;
    console.log(`presetName: ${presetName}`)
    console.log(presets[presetName]);

    // json method
    // fetch("./presets.json").then((response)=>response.json()).then((json) => console.log(json));

    // array method
    for (let i = 0; i < COLUMNS; ++i) {
        for (let j = 0; j < ROWS; ++j) { 
            currentSquares[i][j].alive = presets[presetName][`r${i}c${j}`];
            if (currentSquares[i][j].alive) 
                currentSquares[i][j].html.style.backgroundColor = "green";
            else
                currentSquares[i][j].html.style.backgroundColor = "blue";
        }
    }
}