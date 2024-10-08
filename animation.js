const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const tileSize = Math.min(canvas.width, canvas.height) / 15;

let cols = Math.floor(canvas.width / tileSize);
let rows = Math.floor(canvas.height / tileSize);

let maze = [];
for (let i = 0; i < rows; i++) {
  maze[i] = [];
  for (let j = 0; j < cols; j++) {
    maze[i][j] = Math.random() < 0.2 ? 1 : 0; // wall for 1 and path for 0
  }
}

maze[0][0] = 0; // Entry
maze[rows - 1][cols - 1] = 0; // Exit

maze[1][1] = 0; // Valid start position

let player = {
  x: 1,
  y: 1,
};

let ghosts = [];
for (let i = 0; i < 6; i++) {
  let gx, gy;
  do {
    gx = Math.floor(Math.random() * cols);
    gy = Math.floor(Math.random() * rows);
  } while (
    maze[gy][gx] === 1 ||
    (gx === 0 && gy === 0) ||
    (gx === cols - 1 && gy === rows - 1)
  );
  ghosts.push({
    x: gx,
    y: gy,
    direction: Math.random() < 0.5 ? 1 : -1,
    moveCounter: 0,
  });
}

function drawMaze() {
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      ctx.fillStyle = maze[row][col] === 1 ? "#333" : "#ddd";
      ctx.fillRect(col * tileSize, row * tileSize, tileSize, tileSize);
    }
  }

  ctx.fillStyle = "#00ff00";
  ctx.fillRect(0, 0, tileSize, tileSize);

  ctx.fillStyle = "#ff0000";
  ctx.fillRect(
    (cols - 1) * tileSize,
    (rows - 1) * tileSize,
    tileSize,
    tileSize
  );
}

function drawHuman(x, y) {
  const centerX = x * tileSize + tileSize / 2;
  const centerY = y * tileSize + tileSize / 2;

  ctx.beginPath();
  ctx.arc(centerX, centerY - 10, 8, 0, Math.PI * 2);
  ctx.fillStyle = "#f5c6aa";
  ctx.fill();
  ctx.closePath();

  ctx.fillStyle = "#0000ff";
  ctx.fillRect(centerX - 5, centerY - 2, 10, 20);

  ctx.strokeStyle = "#0000ff";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(centerX - 10, centerY + 2);
  ctx.lineTo(centerX + 10, centerY + 2); //arms
  ctx.stroke();

  ctx.strokeStyle = "#000";
  ctx.beginPath();
  ctx.moveTo(centerX - 5, centerY + 18); //legs
  ctx.lineTo(centerX - 5, centerY + 30);
  ctx.moveTo(centerX + 5, centerY + 18);
  ctx.lineTo(centerX + 5, centerY + 30);
  ctx.stroke();
}

function drawGhosts() {
  ghosts.forEach((ghost) => {
    const centerX = ghost.x * tileSize + tileSize / 2;
    const centerY = ghost.y * tileSize + tileSize / 2;

    ctx.shadowColor = "rgba(255, 0, 0, 0.5)";
    ctx.shadowBlur = 20;

    ctx.fillStyle = "#ff0000"; // Red for devils
    ctx.beginPath();
    ctx.arc(centerX, centerY, tileSize / 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();

    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.moveTo(centerX - 15, centerY - 30); // horns
    ctx.lineTo(centerX - 10, centerY - 40);
    ctx.lineTo(centerX - 5, centerY - 30);
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.moveTo(centerX + 15, centerY - 30);
    ctx.lineTo(centerX + 10, centerY - 40);
    ctx.lineTo(centerX + 5, centerY - 30);
    ctx.fill();
    ctx.closePath();

    // eyes
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(centerX - 10, centerY - 10, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.arc(centerX + 10, centerY - 10, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();

    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(centerX - 10, centerY - 10, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.arc(centerX + 10, centerY - 10, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();

    ctx.shadowColor = "transparent";
  });
}

function moveGhosts() {
  ghosts.forEach((ghost) => {
    ghost.moveCounter++;
    // 30 frames delay in speed
    if (ghost.moveCounter > 30) {
      ghost.moveCounter = 0;
      const possibleDirections = [
        { x: 0, y: -1 },
        { x: 0, y: 1 },
        { x: -1, y: 0 },
        { x: 1, y: 0 },
      ];

      let direction =
        possibleDirections[
          Math.floor(Math.random() * possibleDirections.length)
        ];
      let newGhostX = ghost.x + direction.x;
      let newGhostY = ghost.y + direction.y;

      if (maze[newGhostY] && maze[newGhostY][newGhostX] === 0) {
        ghost.x = newGhostX;
        ghost.y = newGhostY;
      }
    }
  });
}

function checkGameOver() {
  ghosts.forEach((ghost) => {
    const ghostX = ghost.x * tileSize + tileSize / 2;
    const ghostY = ghost.y * tileSize + tileSize / 2;
    const playerX = player.x * tileSize + tileSize / 2;
    const playerY = player.y * tileSize + tileSize / 2;

    const distance = Math.sqrt(
      (ghostX - playerX) ** 2 + (ghostY - playerY) ** 2
    );

    if (distance < 50) {
      alert("Game Over! You were caught by a devil!");
      document.location.reload();
    }
  });
}

window.addEventListener("keydown", (event) => {
  const originalX = player.x;
  const originalY = player.y;

  switch (event.key) {
    case "ArrowUp":
      if (maze[player.y - 1] && maze[player.y - 1][player.x] === 0) player.y--;
      break;
    case "ArrowDown":
      if (maze[player.y + 1] && maze[player.y + 1][player.x] === 0) player.y++;
      break;
    case "ArrowLeft":
      if (maze[player.y][player.x - 1] === 0) player.x--;
      break;
    case "ArrowRight":
      if (maze[player.y][player.x + 1] === 0) player.x++;
      break;
  }

  checkGameOver();
});

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawMaze();
  drawHuman(player.x, player.y);
  drawGhosts();
  moveGhosts();
  checkGameOver();
  requestAnimationFrame(gameLoop);
}

gameLoop();
