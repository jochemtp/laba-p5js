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
    v.update();
    v.show();
    v.behaviors();
  }
}

function mousePressed() {
  scattered = !scattered; // Toggle scatter state
  for (let v of textPoints) {
    v.toggleScatter(scattered); // Scatter or reset based on state
  }
}

function keyPressed() {
  if (key === "R" || key === "r") {
    word = random(["Hello", "World", "Art", "Code", "P5js"]); // Random words
    calculateTextPosition(); // Recalculate positions for new word
    setupWord(word); // Create new points for the new word
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  calculateTextPosition(); // Recalculate positions for resized window
  setupWord(word); // Recreate the text points
}

// Interact class and methods
function Interact(x, y, m, d, t, s, di, p) {
  this.home = createVector(x, y);
  this.pos = t ? createVector(random(width), random(height)) : this.home.copy();
  this.target = this.home.copy();
  this.vel = createVector();
  this.acc = createVector();
  this.r = 8;
  this.maxSpeed = m;
  this.maxforce = 1;
  this.dia = d;
  this.come = s;
  this.dir = p;
  this.scattered = false;
}

Interact.prototype.toggleScatter = function (scattered) {
  this.scattered = scattered;
  if (scattered) {
    this.target = createVector(random(width), random(height)); // Scatter target
  } else {
    this.target = this.home; // Return to home position
  }
};

Interact.prototype.behaviors = function () {
  let arrive = this.arrive(this.target);
  let mouse = createVector(mouseX, mouseY);
  let flee = this.flee(mouse);

  this.applyForce(arrive);
  this.applyForce(flee);
};

Interact.prototype.applyForce = function (f) {
  this.acc.add(f);
};

Interact.prototype.arrive = function (target) {
  let desired = p5.Vector.sub(target, this.pos);
  let d = desired.mag();
  let speed = this.maxSpeed;
  if (d < this.come) {
    speed = map(d, 0, this.come, 0, this.maxSpeed);
  }
  desired.setMag(speed);
  let steer = p5.Vector.sub(desired, this.vel);
  return steer;
};

Interact.prototype.flee = function (target) {
  let desired = p5.Vector.sub(target, this.pos);
  let d = desired.mag();

  if (d < this.dia) {
    desired.setMag(this.maxSpeed);
    desired.mult(this.dir);
    let steer = p5.Vector.sub(desired, this.vel);
    steer.limit(this.maxForce);
    return steer;
  } else {
    return createVector(0, 0);
  }
};

Interact.prototype.update = function () {
  this.pos.add(this.vel);
  this.vel.add(this.acc);
  this.acc.mult(0);
};

Interact.prototype.show = function () {
  stroke(255);
  strokeWeight(4);
  point(this.pos.x, this.pos.y);
};
