// Trevor Villwock 2022-2023
// Tone.js documentation: https://tonejs.github.io/docs/14.7.77/index.html

/* We declare variables to hold html elements here so they have the right scope. Scope refers to what variables
the computer can access as it steps through the program.  In modern JavaScript, a variable declared inside a set of curly braces cannot be
accessed outside of those curly braces. We need to wait for the content
of the DOM to load before we can get these elements but they need to have global scope so we declare them here
without initializing them. Once the page has loaded the function at line 58 is executed which retrieves the 
necessary html elements and assigns them to the variables. */
let startButton;
let currentSquare; // holds square object mouse is currently hovering over
let square1html; // holds html for first square element
let square1Xslider; // holds html for slider controlling square1 horizontal position
let square1XNum; // holds html for number displaying square1 horizontal position
let square1Yslider; // holds html for slider controlling square1 vertical position
let square1YNum; // holds html for number displaying square1 vertical position

// Boolean flag determining whether mouse movement within the square affects pitch
let controlPitch = false;

document.addEventListener("DOMContentLoaded", () => {
    // Get necessary elements from html once page is loaded
    startButton = document.getElementById("startBtn");
    square1html = document.getElementById("square-1");
    square1XSlider = document.getElementById("square-1-x-pos-slider");
    square1YSlider = document.getElementById("square-1-y-pos-slider");
});

document.onmousemove = (event) => {
    
}

function setSquare1XPos() {
    square1html.style.left = square1XSlider.value + "px";  
    console.log(square1html.style.left);
}

function setSquare1YPos() {
    square1html.style.top = square1YSlider.value + "px";  
    console.log(square1html.style.top);
}
