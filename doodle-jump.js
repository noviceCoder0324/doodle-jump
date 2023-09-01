//board
let board; //refer to the board in index.html
const boardWidth =360; //640
const boardHeight =576; //1024
let context; //used for drawing on the canvas

//doodler
const doodlerWidth = 46; //92
const doodlerHeight = 46; //92
let doodlerX = boardWidth/2 - doodlerWidth/2;
let doodlerY = boardHeight*7/8 - doodlerHeight;
let doodlerRightImg;
let doodlerLeftImg;

let doodler = {
  img: null,
  x: doodlerX,
  y: doodlerY,
  width: doodlerWidth,
  height: doodlerHeight
}

//physics
let velocityX = 0;
let velocityY = 0; //doodler jump spped
let initialVelocityY = -8; //starting velocity Y
const gravity = 0.4;

//platforms
let platformArray = [];
const platformWidth = 60;
const platformHeight = 18;
let platformImg;

let score = 0;
let maxScore = 0;
let gameOver = false;

window.onload = () => {
  board = document.getElementById("board");
  board.height = boardHeight;
  board.width = boardWidth;
  context = board.getContext("2d");


  //draw doodler
  // context.fillStyle = "green";
  // context.fillRect(doodler.x, doodler.y, doodler.width, doodler.height)

  //load images
  doodlerRightImg = new Image();
  doodlerRightImg.src = "/pic/doodler-right.png";
  doodler.img = doodlerRightImg;
  doodlerRightImg.onload = () => {
    context.drawImage(doodler.img, doodler.x, doodler.y, doodler.width, doodler.height);
  }

  doodlerLeftImg = new Image();
  doodlerLeftImg.src = "/pic/doodler-left.png";

  platformImg = new Image();
  platformImg.src = "/pic/platform.png";

  velocityY = initialVelocityY;

  placePlatforms();

  requestAnimationFrame(update);
  document.addEventListener("keydown", moveDoodler);
}

function update() {
  requestAnimationFrame(update);
  if (gameOver) {
    return;
  }
  context.clearRect(0, 0, board.width, board.height);

  //doodler
  doodler.x += velocityX;
  if (doodler.x > boardWidth) {
    doodler.x = -doodler.width;
  } else if (doodler.x + doodler.width < 0) {
    doodler.x = boardWidth;
  }

  velocityY += gravity;
  doodler.y += velocityY;
  if (doodler.y > board.height) {
    gameOver = true;
  }
  context.drawImage(doodler.img, doodler.x, doodler.y, doodler.width, doodler.height);

  //platform
  for (let i = 0; i < platformArray.length; i++) {
    let platform = platformArray[i];
    if (velocityY < 0 && doodler.y < boardHeight*3/4) {
      platform.y -= initialVelocityY; //slide platform down
    }
    if (detectCollision(doodler, platform) && velocityY >= 0) {
      velocityY = initialVelocityY;
    }
    context.drawImage(platform.img, platform.x, platform.y, platform.width, platform.height);
  }
  
  //clear platforms and add new platform
  while (platformArray.length > 0 && platformArray[0].y >= boardHeight) {
    platformArray.shift(); //remove first element from the array
    newPlatform();
  }

  //score
  updateScore();
  context.fillStyle = "black";
  context.font = "16px sans-serif";
  context.fillText(score, 5, 20);

  if (gameOver) {
    context.fillText("Game Over: Press 'Space' to Restart", boardWidth/7, boardHeight*7/8);
  }
}

function moveDoodler(e) {
  if (e.code === "ArrowRight" || e.code === "KeyD") {
    velocityX = 4;
    doodler.img = doodlerRightImg;
  } else if (e.code === "ArrowLeft" || e.code === "KeyA") {
    velocityX = -4;
    doodler.img = doodlerLeftImg;
  } else if (e.code === "Space" && gameOver) {
    //reset
    doodler = {
      img: doodlerRightImg,
      x: doodlerX,
      y: doodlerY,
      width: doodlerWidth,
      height: doodlerHeight
    }

    velocityX = 0;
    velocityY = initialVelocityY;
    score = 0;
    maxScore = 0;
    gameOver = false;
    placePlatforms();
  }
}

function placePlatforms() {
  platformArray = [];
  //starting platforms
  let platform = {
    img: platformImg,
    x: boardWidth/2,
    y: boardHeight - 50,
    width: platformWidth,
    height: platformHeight
  }

  platformArray.push(platform);

  for (let i = 0; i < 6; i++) {
    let randomX = Math.floor(Math.random() * boardWidth * 3/4); //(0-1)*boardWidth*3/4
    let platform = {
      img: platformImg,
      x: randomX,
      y: boardHeight - 75*i - 150,
      width: platformWidth,
      height: platformHeight
    }
  
    platformArray.push(platform);
  }
}

function newPlatform() {
  let randomX = Math.floor(Math.random() * boardWidth * 3/4); //(0-1)*boardWidth*3/4
  let platform = {
    img: platformImg,
    x: randomX,
    y: -platformHeight,
    width: platformWidth,
    height: platformHeight
  }

  platformArray.push(platform);
}

function detectCollision(a, b) {
  return a.x < b.x + b.width && //a的左上角不到b的右上角
         a.x + a.width > b.x && //a的右上角过了b的左上角
         a.y < b.y + b.height && //a的左上角没到b的左下角
         a.y + a.height > b.y; //a的左下角过了b的左上角
}

function updateScore() {
  let points = Math.floor(50*Math.random());
  if (velocityY < 0) {
    maxScore += points;
    if (score < maxScore) {
      score = maxScore;
    }
  } else if (velocityY >= 0) {
    maxScore -= points;
  }
}