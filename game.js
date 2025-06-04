window.onload = function() {
// Game Constants
const CELL_SIZE = 24;
const MAZE_COLS = 28;
const MAZE_ROWS = 31;
const WIDTH = CELL_SIZE * MAZE_COLS;
const HEIGHT = CELL_SIZE * MAZE_ROWS;

// Colors
const COLORS = {
    BLACK: '#000000',
    YELLOW: '#FFFF00',
    BLUE: '#0000FF',
    WHITE: '#FFFFFF',
    WALL: '#2121DE',
    PINK: '#FFC0CB',
    CYAN: '#00FFFF',
    ORANGE: '#FFA500',
    RED: '#FF0000',
    GREEN: '#00FF00'
};

// Maze layout (0=empty, 1=wall, 2=dot, 3=power pellet, 4=ghost door)
const MAZE = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,3,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,3,1],
    [1,2,1,1,1,1,2,1,1,1,2,1,1,2,1,1,1,2,1,1,1,1,2,1,1,1,2,1],
    [1,2,1,1,1,1,2,1,1,1,2,1,1,2,1,1,1,2,1,1,1,1,2,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1,1],
    [1,2,2,2,2,2,2,1,1,2,2,2,2,4,4,2,2,2,2,1,1,2,2,2,2,2,2,1],
    [1,1,1,1,1,1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,1,1,1,1,1,1],
    [0,0,0,0,0,1,2,1,1,1,1,1,1,0,0,1,1,1,1,1,1,2,1,0,0,0,0,0],
    [1,1,1,1,1,1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1,1],
    [1,3,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,3,1],
    [1,1,1,1,1,1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,1,1,1,1,1,1],
    [0,0,0,0,0,1,2,1,1,1,1,1,1,0,0,1,1,1,1,1,1,2,1,0,0,0,0,0],
    [1,1,1,1,1,1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1,1],
    [1,3,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,3,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

// Pad to 31 rows
while (MAZE.length < MAZE_ROWS) {
    MAZE.push(new Array(MAZE_COLS).fill(1));
}

// Helper to check if a cell is connected to the main maze
function isConnectedToMaze(startX, startY) {
    // We'll use BFS to see if we can reach the left or right edge from (startX, startY)
    const visited = Array.from({length: MAZE_ROWS}, () => Array(MAZE_COLS).fill(false));
    const queue = [[startX, startY]];
    visited[startY][startX] = true;
    while (queue.length > 0) {
        const [x, y] = queue.shift();
        // If we reach a cell on the left or right edge that is not a wall, it's connected
        if ((x === 0 || x === MAZE_COLS-1) && MAZE[y][x] !== 1) return true;
        for (const [dx, dy] of [[-1,0],[1,0],[0,-1],[0,1]]) {
            const nx = x + dx, ny = y + dy;
            if (nx >= 0 && nx < MAZE_COLS && ny >= 0 && ny < MAZE_ROWS && !visited[ny][nx] && MAZE[ny][nx] !== 1) {
                visited[ny][nx] = true;
                queue.push([nx, ny]);
            }
        }
    }
    return false;
}

// Helper to find the closest non-wall cell to the true center (centerX, centerY)
function findTrueCenterNonWall() {
    const centerX = Math.floor(MAZE_COLS / 2);
    const centerY = Math.floor(MAZE_ROWS / 2);
    if (MAZE[centerY][centerX] !== 1) return [centerX, centerY];
    // Spiral search outwards
    for (let r = 1; r < Math.max(MAZE_COLS, MAZE_ROWS); r++) {
        for (let dx = -r; dx <= r; dx++) {
            for (let dy = -r; dy <= r; dy++) {
                const x = centerX + dx;
                const y = centerY + dy;
                if (x >= 0 && x < MAZE_COLS && y >= 0 && y < MAZE_ROWS && MAZE[y][x] !== 1) {
                    return [x, y];
                }
            }
        }
    }
    // Fallback
    return [1, 1];
}

// Helper to find a corridor cell in the center row
function findCenterCorridorCell() {
    const centerY = Math.floor(MAZE_ROWS / 2);
    for (let x = 0; x < MAZE_COLS; x++) {
        if (
            MAZE[centerY][x] !== 1 &&
            x > 0 && x < MAZE_COLS - 1 &&
            MAZE[centerY][x - 1] !== 1 &&
            MAZE[centerY][x + 1] !== 1
        ) {
            return [x, centerY];
        }
    }
    // Fallback: just use center
    return [Math.floor(MAZE_COLS / 2), centerY];
}

// Game state
let score = 0;
let gameOver = false;
let youWin = false;
let frightenedTimer = 0;
const FRIGHTENED_DURATION = 5000; // 5 seconds in milliseconds
const GHOST_RESPAWN_TIME = 5000; // 5 seconds in milliseconds

// Direction mapping
const DIRECTIONS = {
    LEFT: [-1, 0],
    RIGHT: [1, 0],
    UP: [0, -1],
    DOWN: [0, 1]
};

// Pacman state - start in the center corridor
let pacman = {
    pos: findCenterCorridorCell(),
    dir: 'LEFT',
    nextDir: 'LEFT',
    mouthAngle: 0,
    mouthOpening: true,
    moveFrame: 0
};

// Ghosts
const ghosts = [
    { name: 'blinky', color: COLORS.RED, pos: [13, 11], dir: 'LEFT', frightened: false, eaten: false, respawnTime: 0, moveFrame: 0 },
    { name: 'pinky', color: COLORS.PINK, pos: [14, 11], dir: 'UP', frightened: false, eaten: false, respawnTime: 0, moveFrame: 0 },
    { name: 'inky', color: COLORS.CYAN, pos: [13, 12], dir: 'DOWN', frightened: false, eaten: false, respawnTime: 0, moveFrame: 0 },
    { name: 'clyde', color: COLORS.ORANGE, pos: [14, 12], dir: 'DOWN', frightened: false, eaten: false, respawnTime: 0, moveFrame: 0 }
];

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = WIDTH;
canvas.height = HEIGHT;

// Input handling
const keys = {};
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    switch(e.key) {
        case 'ArrowLeft':
            pacman.nextDir = 'LEFT';
            break;
        case 'ArrowRight':
            pacman.nextDir = 'RIGHT';
            break;
        case 'ArrowUp':
            pacman.nextDir = 'UP';
            break;
        case 'ArrowDown':
            pacman.nextDir = 'DOWN';
            break;
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Drawing functions
function drawMaze() {
    for (let row = 0; row < MAZE_ROWS; row++) {
        for (let col = 0; col < MAZE_COLS; col++) {
            const cell = MAZE[row][col];
            const x = col * CELL_SIZE;
            const y = row * CELL_SIZE;

            switch(cell) {
                case 1: // Wall
                    ctx.fillStyle = COLORS.WALL;
                    ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
                    break;
                case 2: // Dot
                    ctx.fillStyle = COLORS.WHITE;
                    ctx.beginPath();
                    ctx.arc(x + CELL_SIZE/2, y + CELL_SIZE/2, 3, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                case 3: // Power pellet
                    ctx.fillStyle = COLORS.BLUE;
                    ctx.beginPath();
                    ctx.arc(x + CELL_SIZE/2, y + CELL_SIZE/2, 6, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                case 4: // Ghost door
                    ctx.fillStyle = COLORS.WHITE;
                    ctx.fillRect(x, y + CELL_SIZE/2 - 2, CELL_SIZE, 4);
                    break;
            }
        }
    }
}

function drawPacman() {
    const x = pacman.pos[0] * CELL_SIZE + CELL_SIZE/2;
    const y = pacman.pos[1] * CELL_SIZE + CELL_SIZE/2;
    const radius = CELL_SIZE/2 - 2;

    // Update mouth angle
    if (pacman.mouthOpening) {
        pacman.mouthAngle += 0.1;
        if (pacman.mouthAngle >= 0.5) pacman.mouthOpening = false;
    } else {
        pacman.mouthAngle -= 0.1;
        if (pacman.mouthAngle <= 0) pacman.mouthOpening = true;
    }

    // Draw Pacman
    ctx.fillStyle = COLORS.YELLOW;
    ctx.beginPath();
    let startAngle, endAngle;
    
    switch(pacman.dir) {
        case 'LEFT':
            startAngle = pacman.mouthAngle;
            endAngle = 2 * Math.PI - pacman.mouthAngle;
            break;
        case 'RIGHT':
            startAngle = Math.PI + pacman.mouthAngle;
            endAngle = Math.PI - pacman.mouthAngle;
            break;
        case 'UP':
            startAngle = Math.PI/2 + pacman.mouthAngle;
            endAngle = 5 * Math.PI/2 - pacman.mouthAngle;
            break;
        case 'DOWN':
            startAngle = 3 * Math.PI/2 + pacman.mouthAngle;
            endAngle = 7 * Math.PI/2 - pacman.mouthAngle;
            break;
    }
    
    ctx.arc(x, y, radius, startAngle, endAngle);
    ctx.lineTo(x, y);
    ctx.fill();
}

function drawGhosts() {
    ghosts.forEach(ghost => {
        if (ghost.eaten) return;

        const x = ghost.pos[0] * CELL_SIZE + CELL_SIZE/2;
        const y = ghost.pos[1] * CELL_SIZE + CELL_SIZE/2;
        const radius = CELL_SIZE/2 - 2;

        // Draw ghost body
        ctx.fillStyle = ghost.frightened ? COLORS.BLUE : ghost.color;
        ctx.beginPath();
        ctx.arc(x, y - radius/2, radius, Math.PI, 0, false);
        ctx.lineTo(x + radius, y + radius/2);
        ctx.lineTo(x - radius, y + radius/2);
        ctx.fill();

        // Draw ghost eyes
        ctx.fillStyle = COLORS.WHITE;
        ctx.beginPath();
        ctx.arc(x - radius/2, y - radius/4, radius/4, 0, Math.PI * 2);
        ctx.arc(x + radius/2, y - radius/4, radius/4, 0, Math.PI * 2);
        ctx.fill();
    });
}

function updateScore() {
    document.getElementById('score').textContent = score;
}

function checkCollision(pos1, pos2) {
    return pos1[0] === pos2[0] && pos1[1] === pos2[1];
}

function canMove(x, y) {
    return x >= 0 && x < MAZE_COLS && y >= 0 && y < MAZE_ROWS && MAZE[y][x] !== 1;
}

// Speed control
let globalFrame = 0;
const PACMAN_MOVE_INTERVAL = 4; // Lower = faster
const GHOST_MOVE_INTERVAL = 5; // Lower = faster (slower than before)

function moveGhost(ghost) {
    if (ghost.eaten) {
        if (Date.now() >= ghost.respawnTime) {
            ghost.eaten = false;
            ghost.frightened = false;
            ghost.pos = [14, 11]; // Respawn position
        }
        return;
    }
    if (globalFrame % GHOST_MOVE_INTERVAL !== 0) return;
    const [dx, dy] = DIRECTIONS[ghost.dir];
    const newX = ghost.pos[0] + dx;
    const newY = ghost.pos[1] + dy;
    if (canMove(newX, newY)) {
        ghost.pos = [newX, newY];
    } else {
        const possibleDirs = Object.keys(DIRECTIONS).filter(dir => {
            const [newDx, newDy] = DIRECTIONS[dir];
            return canMove(ghost.pos[0] + newDx, ghost.pos[1] + newDy);
        });
        if (possibleDirs.length > 0) {
            ghost.dir = possibleDirs[Math.floor(Math.random() * possibleDirs.length)];
        }
    }
}

function movePacman() {
    if (globalFrame % PACMAN_MOVE_INTERVAL !== 0) return;
    const [dx, dy] = DIRECTIONS[pacman.nextDir];
    const newX = pacman.pos[0] + dx;
    const newY = pacman.pos[1] + dy;
    if (canMove(newX, newY)) {
        pacman.dir = pacman.nextDir;
        pacman.pos = [newX, newY];
    } else {
        const [dx2, dy2] = DIRECTIONS[pacman.dir];
        const newX2 = pacman.pos[0] + dx2;
        const newY2 = pacman.pos[1] + dy2;
        if (canMove(newX2, newY2)) {
            pacman.pos = [newX2, newY2];
        }
    }
}

function gameLoop() {
    if (gameOver || youWin) return;
    ctx.fillStyle = COLORS.BLACK;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    globalFrame++;
    movePacman();
    ghosts.forEach(ghost => moveGhost(ghost));
    // Check for dots and power pellets
    const cell = MAZE[pacman.pos[1]][pacman.pos[0]];
    if (cell === 2) {
        MAZE[pacman.pos[1]][pacman.pos[0]] = 0;
        score += 10;
        updateScore();
    } else if (cell === 3) {
        MAZE[pacman.pos[1]][pacman.pos[0]] = 0;
        score += 50;
        updateScore();
        frightenedTimer = Date.now() + FRIGHTENED_DURATION;
        ghosts.forEach(ghost => {
            if (!ghost.eaten) ghost.frightened = true;
        });
    }
    if (frightenedTimer && Date.now() > frightenedTimer) {
        frightenedTimer = 0;
        ghosts.forEach(ghost => ghost.frightened = false);
    }
    ghosts.forEach(ghost => {
        if (ghost.eaten) return;
        if (checkCollision(pacman.pos, ghost.pos)) {
            if (ghost.frightened) {
                ghost.eaten = true;
                ghost.respawnTime = Date.now() + GHOST_RESPAWN_TIME;
                score += 200;
                updateScore();
            } else {
                gameOver = true;
            }
        }
    });
    if (!MAZE.some(row => row.includes(2) || row.includes(3))) {
        youWin = true;
    }
    drawMaze();
    drawPacman();
    drawGhosts();
    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = COLORS.RED;
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over', WIDTH/2, HEIGHT/2);
        return;
    }
    if (youWin) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = COLORS.GREEN;
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('You Win!', WIDTH/2, HEIGHT/2);
        return;
    }
    requestAnimationFrame(gameLoop);
}

gameLoop();
} 