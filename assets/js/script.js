// var touchEvent = 'ontouchstart' in window ? 'touchstart' : 'click';
window.requestAnimFrame = function () {
  return window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  function (callback) {
    window.setTimeout(callback, 1000 / 60);
  };
}();

var canvas = document.getElementById('canvas'),
ctx = canvas.getContext('2d'),
cw = window.innerWidth,
ch = window.innerHeight,
fireworks = [],
particles = [],
hue = 120,
limiterTotal = 5,
limiterTick = 0,
timerTotal = 80,
timerTick = 0,
mousedown = false,
mx,
my;

canvas.width = cw;
canvas.height = ch;


function random(min, max) {
  return Math.random() * (max - min) + min;
}

function calculateDistance(p1x, p1y, p2x, p2y) {
  var xDistance = p1x - p2x,
  yDistance = p1y - p2y;
  return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
}

function Firework(sx, sy, tx, ty) {
  this.x = sx;
  this.y = sy;
  this.sx = sx;
  this.sy = sy;
  this.tx = tx;
  this.ty = ty;
  this.distanceToTarget = calculateDistance(sx, sy, tx, ty);
  this.distanceTraveled = 0;
  this.coordinates = [];
  this.coordinateCount = 3;
  while (this.coordinateCount--) {
    this.coordinates.push([this.x, this.y]);
  }
  this.angle = Math.atan2(ty - sy, tx - sx);
  this.speed = 2;
  this.acceleration = 1.05;
  this.brightness = random(50, 70);
  this.targetRadius = 1;
}

// update firework
Firework.prototype.update = function (index) {
  this.coordinates.pop();
  this.coordinates.unshift([this.x, this.y]);

  if (this.targetRadius < 8) {
    this.targetRadius += 0.3;
  } else {
    this.targetRadius = 1;
  }

  this.speed *= this.acceleration;

  var vx = Math.cos(this.angle) * this.speed,
  vy = Math.sin(this.angle) * this.speed;
  this.distanceTraveled = calculateDistance(this.sx, this.sy, this.x + vx, this.y + vy);

  if (this.distanceTraveled >= this.distanceToTarget) {
    createParticles(this.tx, this.ty);
    fireworks.splice(index, 1);
  } else {
    this.x += vx;
    this.y += vy;
  }
};

// draw firework
Firework.prototype.draw = function () {
  ctx.beginPath();
  ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
  ctx.lineTo(this.x, this.y);
  ctx.strokeStyle = 'hsl(' + hue + ', 100%, ' + this.brightness + '%)';
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(this.tx, this.ty, this.targetRadius, 0, Math.PI * 2);
  ctx.stroke();
};

// create particle
function Particle(x, y) {
  this.x = x;
  this.y = y;
  this.coordinates = [];
  this.coordinateCount = 5;
  while (this.coordinateCount--) {
    this.coordinates.push([this.x, this.y]);
  }
  this.angle = random(0, Math.PI * 2);
  this.speed = random(1, 10);
  this.friction = 0.95;
  this.gravity = 1;
  this.hue = random(hue - 20, hue + 20);
  this.brightness = random(50, 80);
  this.alpha = 1;
  this.decay = random(0.015, 0.03);
}

// update particle
Particle.prototype.update = function (index) {
  this.coordinates.pop();
  this.coordinates.unshift([this.x, this.y]);
  this.speed *= this.friction;
  this.x += Math.cos(this.angle) * this.speed;
  this.y += Math.sin(this.angle) * this.speed + this.gravity;
  this.alpha -= this.decay;

  if (this.alpha <= this.decay) {
    particles.splice(index, 1);
  }
};

// draw particle
Particle.prototype.draw = function () {
  ctx.beginPath();
  ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
  ctx.lineTo(this.x, this.y);
  ctx.strokeStyle = 'hsla(' + this.hue + ', 100%, ' + this.brightness + '%, ' + this.alpha + ')';
  ctx.stroke();
};

// create particle group/explosion
function createParticles(x, y) {
  var particleCount = 30;
  while (particleCount--) {
    particles.push(new Particle(x, y));
  }
}

// main demo loop
function loop() {
  requestAnimFrame(loop);

  hue += 0.5;

  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(0, 0, cw, ch);
  ctx.globalCompositeOperation = 'lighter';

  var i = fireworks.length;
  while (i--) {
    fireworks[i].draw();
    fireworks[i].update(i);
  }

  var i = particles.length;
  while (i--) {
    particles[i].draw();
    particles[i].update(i);
  }

  if (timerTick >= timerTotal) {
    if (!mousedown) {
      fireworks.push(new Firework(cw / 2, ch, random(0, cw), random(0, ch / 2)));
      timerTick = 0;
    }
  } else {
    timerTick++;
  }

  if (limiterTick >= limiterTotal) {
    if (mousedown) {
      fireworks.push(new Firework(cw / 2, ch, mx, my));
      limiterTick = 0;
    }
  } else {
    limiterTick++;
  }
}

window.onload = function () {
  var merrywrap = document.getElementById("merrywrap");
  var box = merrywrap.getElementsByClassName("giftbox")[0];
  var step = 1;
  var stepMinutes = [2000, 2000, 1000, 1000];
  function init() {
    box.addEventListener("click", openBox, false);
    box.addEventListener("touchstart", openBox, false);
  }
  function stepClass(step) {
    merrywrap.className = 'merrywrap';
    merrywrap.className = 'merrywrap step-' + step;
  }
  function openBox() {
    if (step === 1) {
      box.removeEventListener("click", openBox, false);
      box.removeEventListener("touchstart", openBox, false);
    }
    stepClass(step);
    if (step === 3) {
    }
    if (step === 4) {
      reveal();
      return;
    }
    setTimeout(openBox, stepMinutes[step - 1]);
    step++;
  }

  init();

};

function reveal() {
  document.querySelector('.merrywrap').style.backgroundColor = 'transparent';

  loop();

  var w, h;
  if (window.innerWidth >= 1000) {
    w = 295;h = 185;
  } else
  {
    w = 255;h = 155;
  }

  var ifrm = document.createElement("video");
  ifrm.src = "../img/HappyBirthdaysong.mp4"
  // ifrm.setAttribute("onclick", "typeWriter()");
  // ifrm.setAttribute("ontouchstart", "typeWriter()");
  ifrm.controls = true;
  ifrm.muted = false;
  document.querySelector('#video').appendChild(ifrm);

  var divWord = document.createElement("div");
  divWord.setAttribute("class", "word");

  var divContainer = document.createElement("div");
  divContainer.setAttribute("class", "container");

  var divCake = document.createElement("div");
  divCake.setAttribute("class", "cake");
  
  var divCandle = document.createElement("div");
  divCandle.setAttribute("class", "candle");
  divCandle.addEventListener("click", clickText);
  divCandle.addEventListener("touchstart", clickText);
  divCandle.setAttribute("onclick", "clickText()");
  divCandle.setAttribute("ontouchstart", "clickText()");
  divCake.appendChild(divCandle);

  var divTop = document.createElement("div");
  divTop.setAttribute("class", "top-layer");
  divCake.appendChild(divTop);

  var divMid = document.createElement("div");
  divMid.setAttribute("class", "middle-layer");
  divCake.appendChild(divMid);

  var divBot = document.createElement("div");
  divBot.setAttribute("class", "bottom-layer");
  divCake.appendChild(divBot);

  divContainer.appendChild(divCake);
  divContainer.appendChild(divWord);
  document.body.appendChild(divContainer);

  typeWriter();

  function clickText() {
    var beforeCandle = document.getElementsByClassName("candle")[0];
    beforeCandle.style.setProperty('--candleAfterAnimation','none 0 ease 0 1 normal none running');

    var image = document.createElement("img");
    image.setAttribute("src", "../img/hanhlienggg.jpg");
    image.setAttribute("class", "img");
    document.getElementsByClassName("text")[0].appendChild(image);

    $(".text").animate({"opacity": 1}, "normal");
    document.getElementsByClassName("text")[0].style.animation = "waviy 1s infinite";
    $(".container").animate({"opacity": 0}, "normal");
    $("#video").animate({"opacity": 0}, "normal");
  }
}

var blowcandle = "Xem xong vid nhớ thổi nến bánh kem nhaa";
var chiso = 0;

function typeWriter() {
  if (chiso < blowcandle.length) {
    document.getElementsByClassName("word")[0].innerHTML += blowcandle.charAt(chiso);
    chiso++;
    setTimeout(typeWriter, 50);
  }
}