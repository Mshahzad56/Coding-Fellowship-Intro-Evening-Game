// This functionality can access the HTML in the index.html file and store HTML elements 
// as variables (or containers for values) within the our JavaScript programs
const clouds = document.getElementsByClassName('clouds')[0];
const layerOne = document.getElementById('layer-one');
const buildings = document.getElementsByClassName('buildings')[0];
const layerTwo = document.getElementById('layer-two');
const obstacles = document.getElementsByClassName('obstacles')[0];
const obstacle = obstacles.children[0];
const layersContainer = document.getElementById('layers-container');
const startMessage = document.getElementById('start-message');
const player = document.getElementById('player');
const message = document.getElementById('start-message');

// Set some potnetial X positions for our obstacles
const obstaclePositions = [100, 150, 175, 200];

// Stores the animation loop function in a variable, the functionality it uses depends on the browser support available
const requestAnim = window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  setInterval;


// This is typical syntax for calling a function
// Here we are calling our setup function
setup();

// Get coordinates and dimensions of our player so we can detect collisions
const playerOb = {
  x: player.getBoundingClientRect().x,
  y: player.getBoundingClientRect().y,
  velocity: 0,
  height: player.getBoundingClientRect().height,
  width: player.getBoundingClientRect().width,
}

// Here we will store data about our obstacles in order to detect collisions
let obstacleArray = [];

function setGameCoordinates() {
  // Get coordinates and dimensions of our obstacles so we can detect collisions
  obstacleArray = Array.from(document.getElementsByClassName('obstacle')).map(obstacle => ({
    element: obstacle,
    x: obstacle.getBoundingClientRect().x,
    y: obstacle.getBoundingClientRect().y,
    height: obstacle.getBoundingClientRect().height,
    width: obstacle.getBoundingClientRect().width,
  }));

  playerOb.x = player.getBoundingClientRect().x;
}


// Define the settings for our game
// Has the game started? Has the user pressed a key? Track the screens X position and the rate at which it moves across the screen
const gameSettings = {
  hasStarted: false,
  jumpKeyPressed: false,
  screenX: 0,
  speed: 5,
  gravity: 0.17
}

// Function that is used to clone our clouds and buildings
function cloneNodes(element, layer) {
  for (let index = 0; index < 75; index++) {
    const newElement = element.cloneNode(true);
    layer.appendChild(newElement);
  }
}

// Function that is used to clone the obstacles
// Also sets random X positions for the obstacles so that the game isnt too boring...
function cloneObstacles() {
  for (let index = 0; index < 75; index++) {
    const newObstacle = obstacle.cloneNode(true);
    const child = newObstacle.children[0];
    child.setAttribute('transform', 
      'translate('+obstaclePositions[Math.floor(Math.random() * obstaclePositions.length)]+', 0)'
    );
    obstacles.appendChild(newObstacle);
  }
}

// Checks the x and y values of both the player and obstacle to see if they overlap
function distance(x1, y1, x2, y2) {
  let collision = false;
  const xDist = x2 - x1;
  const yDist = y2 - y1;

  if((Math.abs(xDist) < 10) && (Math.abs(yDist) < 20)) {
    collision = true;
  }
  return collision;
}

// Once we have passed an obstacle we remove it from our variables as we no longer need to detect a collision
function removePassedObstacles() {
  const obstacle = obstacleArray[0];
  if(obstacle.x + obstacle.width + playerOb.width < playerOb.x) obstacleArray.shift();
}

// Calls the distance function passing in relevant x and y values for both the player and obstacles, checking for a collision
function detectCollision() {
  let outcome = false;
  const obstacle = obstacleArray[0];
  const heightDifference = Math.abs(obstacle.height - playerOb.height);
  if(distance(playerOb.x + (playerOb.width / 2), playerOb.y - heightDifference, obstacle.x + (obstacle.width / 2), obstacle.y + heightDifference )) {
    outcome = true;
  };

  removePassedObstacles();

  return outcome
}

// Our setup and clone functions from earlier
function setup() {
  cloneNodes(clouds, layerOne);
  cloneNodes(buildings, layerTwo);
}

// Function which makes the player jump on UP key press
// Updates the players Y value to move them up and down
// Depending on whether the up key has been pressed
function jump() {
  if (playerOb.y + playerOb.velocity + 36 > 500) {
      playerOb.velocity = 0;
      playerOb.y = 500 - 36;
  } else {
      playerOb.velocity += gameSettings.gravity;
      playerOb.y += playerOb.velocity;
  } 

  player.setAttribute('cy', playerOb.y - 349);
}

// When we collide with an obstacle, reset our game settings
function restartGame() {
  gameSettings.hasStarted = false;
  gameSettings.jumpKeyPressed = false;
  gameSettings.screenX = 0;
  layersContainer.style.left = '0px';

  message.classList.remove('fade-out');
  message.style.background = 'red';
  message.children[0].textContent = 'Oops! Hit any key start again.'
}

// Moves the screen and obstacles to the left when the game starts using negative X values
function moveScreen() {
  obstacleArray.forEach(obstacle => obstacle.x -= gameSettings.speed);
  gameSettings.screenX -= gameSettings.speed;
  layersContainer.style.left = gameSettings.screenX +'px';
}

// Animation loop used in all HTML5/JavaScript games
// Calls all of our earlier defined functions to render jumping, detect collisions and finally end the game
requestAnim(function loop() {
    if(gameSettings.hasStarted) {
      if (gameSettings.jumpKeyPressed && !playerOb.velocity) {
        playerOb.velocity = -4;
        gameSettings.jumpKeyPressed = false;
      }
      moveScreen();
      if(detectCollision()) {
        restartGame();
      }
    }
    jump();

    requestAnim(loop);
});

// EVENT LISTENERS
// Once a click or keypress occurs the game will start and instructions fade out
// Here will also call the functions which clone the created obstacles and map their co-ordinates to our obstacles array, so we can effectively detect collisions

// Wait for the user to click
addEventListener('click', () => {
  if(!gameSettings.hasStarted) {
    cloneObstacles();
    setGameCoordinates();
  }
  gameSettings.hasStarted = true;
  startMessage.classList.add('fade-out');
});

// Wait for the user to press a key
// Also checks if the key pressed was the up key - and if so, will make the player jump
addEventListener('keydown', (e) => {
  if(e.key === 'ArrowUp') {
    gameSettings.jumpKeyPressed = true;
  }
  if(!gameSettings.hasStarted) {
    cloneObstacles();
    setGameCoordinates();
  }
  gameSettings.hasStarted = true;
    startMessage.classList.add('fade-out');
});