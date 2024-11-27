let font;
let tSize = 100; // Text Size
let tposX; // X position of text (calculated dynamically)
let tposY; // Y position of text (calculated dynamically)
let pointCount = 0.1; // between 0 - 1 // point count

let speed = 5; // speed of the particles
let comebackSpeed = 120; // lower the number less interaction
let dia = 120; // diameter of interaction
let randomPos = false; // starting points
let pointsDirection = "general"; // left right up down general
let interactionDirection = -1; // -1 and 1

let textPoints = [];
let word = "Hallo";
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
  textPoints = [];
  let points = font.textToPoints(newWord, tposX, tposY, tSize, {
    sampleFactor: pointCount,
  });

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
}

function draw() {
  background(0);

  // Render sharp clue text on the buffer
  pg.clear();
  pg.fill(255);
  pg.textSize(24);
  pg.textAlign(CENTER, CENTER);
  pg.text("Press 'R' to form a new word", width / 2, 50);
  image(pg, 0, 0); // Draw the buffer to the canvas

  for (let v of textPoints) {
    v.behaviors();
    v.update();
    v.show();
  }
}

function mousePressed() {
  scattered = !scattered; // Toggle scatter state
  for (let v of textPoints) {
    v.toggleScatter(scattered);
  }
}

// Interact class to manage particles
class Interact {
  constructor(x, y, speed, dia, randomPos, comebackSpeed, pointsDirection, interactionDirection) {
    this.home = createVector(x, y);
    this.pos = randomPos
      ? createVector(random(width), random(height))
      : this.home.copy();
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.speed = speed;
    this.dia = dia;
    this.scattered = false;
    this.comebackSpeed = comebackSpeed;
  }

  applyForce(force) {
    this.acc.add(force);
  }

  behaviors() {
    let mouse = createVector(mouseX, mouseY);
    let d = p5.Vector.dist(this.pos, mouse);

    if (d < this.dia) {
      // Repel behavior
      let repel = p5.Vector.sub(this.pos, mouse);
      repel.setMag(map(d, 0, this.dia, this.speed, 0));
      this.applyForce(repel);
    }

    if (!this.scattered) {
      // Attract behavior back to home position
      let homeForce = p5.Vector.sub(this.home, this.pos);
      homeForce.setMag(1 / this.comebackSpeed);
      this.applyForce(homeForce);
    }
  }

  toggleScatter(state) {
    this.scattered = state;
    if (state) {
      this.vel = p5.Vector.random2D().mult(this.speed);
    }
  }

  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.speed);
    this.pos.add(this.vel);
    this.acc.mult(0); // Reset acceleration
  }

  show() {
    fill(255);
    noStroke();
    ellipse(this.pos.x, this.pos.y, 4, 4);
  }
}
