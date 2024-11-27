let font;
let tSize = 100; // Text Size
let tposX; // X position of text (calculated dynamically)
let tposY; // Y position of text (calculated dynamically)
let pointCount = 0.1; // between 0 - 1 // point count

let speed = 10; // speed of the particles
let comebackSpeed = 120; // lower the number less interaction
let dia = 120; // diameter of interaction
let randomPos = false; // starting points
let pointsDirection = "general"; // left right up down general
let interactionDirection = -1; // -1 and 1

let textPoints = [];
let word = "Hello";
let scattered = false; // Track if particles are scattered

let pg; // PGraphics object for sharp text

function preload() {
  font = loadFont("AvenirNextLTPro-Demi.otf");
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  pg = createGraphics(width, height); // Offscreen buffer for text
  pg.textFont(font);
  pg.noStroke();

  textFont(font);
  calculateTextPosition();
  setupWord(word);
}

function calculateTextPosition() {
  tSize = min(width, height) * 0.15; // Scale text size based on window size
  tposX = width / 2 - (word.length * tSize * 0.3); // Center text horizontally
  tposY = height / 2 + tSize / 2; // Center text vertically
}

function setupWord(newWord) {
  let points = font.textToPoints(newWord, tposX, tposY, tSize, {
    sampleFactor: pointCount,
  });

  if (textPoints.length === 0) {
    // First time setup
    for (let pt of points) {
      let textPoint = new Interact(
        pt.x,
        pt.y,
        speed,
        dia,
        randomPos,
        comebackSpeed,
        pointsDirection,
        interactionDirection
      );
      textPoints.push(textPoint);
    }
  } else {
    // Morph existing points to new word
    for (let i = 0; i < points.length; i++) {
      if (i < textPoints.length) {
        textPoints[i].setTarget(points[i].x, points[i].y);
      } else {
        let textPoint = new Interact(
          points[i].x,
          points[i].y,
          speed,
          dia,
          randomPos,
          comebackSpeed,
          pointsDirection,
          interactionDirection
        );
        textPoints.push(textPoint);
      }
    }

    // Remove extra particles
    if (points.length < textPoints.length) {
      textPoints.splice(points.length);
    }
  }
}

function draw() {
  background(0);

  // Render sharp clue text on the buffer
  pg.clear();
  pg.fill(255);
  pg.textSize(24);
  pg.textAlign(CENTER, CENTER);
  pg.text("Press 'R' to change pages", width / 2, 50);
  image(pg, 0, 0); // Draw the buffer to the canvas

  for (let v of textPoints) {
    v.update();
    v.show();
    v.behaviors();
  }
}

function keyPressed() {
  if (key === 'r' || key === 'R') {
    word = random(["Home", "Projects", "About us", "Contact"]);
    calculateTextPosition();
    setupWord(word);
  }
}

// Particle class
class Interact {
  constructor(x, y, speed, dia, randomPos, comebackSpeed, pointsDirection, interactionDirection) {
    this.x = randomPos ? random(width) : x;
    this.y = randomPos ? random(height) : y;
    this.targetX = x;
    this.targetY = y;
    this.speed = speed;
    this.dia = dia;
    this.comebackSpeed = comebackSpeed;
    this.pointsDirection = pointsDirection;
    this.interactionDirection = interactionDirection;
  }

  setTarget(x, y) {
    this.targetX = x;
    this.targetY = y;
  }

  update() {
    // Move towards target
    this.x = lerp(this.x, this.targetX, 0.1);
    this.y = lerp(this.y, this.targetY, 0.1);
  }

  show() {
    fill(255);
    noStroke();
    ellipse(this.x, this.y, 5, 5);
  }

  behaviors() {
    // Implement interaction behaviors if needed
  }
}
