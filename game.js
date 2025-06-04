// Game Constants
const CELL_SIZE = 24;
const MAZE_COLS = 25;
const MAZE_ROWS = 25;
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

// Simplified maze layout (0=empty, 1=wall, 2=dot, 3=power pellet)
const MAZE_TEMPLATE = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,3,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,3,1],
    [1,2,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,2,1,2,1,1,1,1,1,1,1,1,1,2,1,2,1,1,1,2,1],
    [1,2,2,2,2,2,1,2,2,2,2,1,1,1,2,2,2,2,1,2,2,2,2,2,1],
    [1,1,1,1,1,2,1,1,1,1,2,1,1,1,2,1,1,1,1,2,1,1,1,1,1],
    [0,0,0,0,1,2,1,2,2,2,2,2,2,2,2,2,2,2,1,2,1,0,0,0,0],
    [1,1,1,1,1,2,1,2,1,1,0,0,0,0,0,1,1,2,1,2,1,1,1,1,1],
    [2,2,2,2,2,2,2,2,1,0,0,0,0,0,0,0,1,2,2,2,2,2,2,2,2],
    [1,1,1,1,1,2,1,2,1,0,0,0,0,0,0,0,1,2,1,2,1,1,1,1,1],
    [0,0,0,0,1,2,1,2,1,1,1,1,1,1,1,1,1,2,1,2,1,0,0,0,0],
    [1,1,1,1,1,2,1,2,2,2,2,2,2,2,2,2,2,2,1,2,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,2,2,1,1,1,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,2,1,1,1,1,2,1,1,1,2,1,1,1,1,2,1,1,1,2,1],
    [1,2,2,2,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,2,2,2,1],
    [1,1,1,2,1,2,1,2,1,1,1,1,1,1,1,1,1,2,1,2,1,2,1,1,1],
    [1,2,2,2,2,2,1,2,2,2,2,1,1,1,2,2,2,2,1,2,2,2,2,2,1],
    [1,2,1,1,1,1,1,1,1,1,2,1,1,1,2,1,1,1,1,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,2,1,1,1,1,1,2,1,2,1,1,1,1,1,2,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,3,1,1,2,1,1,1,1,1,1,2,1,2,1,1,1,1,1,1,2,1,1,3,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

// Create a working copy of the maze
let MAZE = MAZE_TEMPLATE.map(row => [...row]);

// Game state
let score = 0;
let gameOver = false;
let youWin = false;
let frightenedTimer = 0;
let globalFrame = 0;
let gameStarted = false;

const FRIGHTENED_DURATION = 8000;
const GHOST_RESPAWN_TIME = 3000;
const PACMAN_MOVE_INTERVAL = 3;
const GHOST_MOVE_INTERVAL = 4;

// Direction mapping
const DIRECTIONS = {
    LEFT: [-1, 0],
    RIGHT: [1, 0],
    UP: [0, -1],
    DOWN: [0, 1]
};

// Find starting position for Pacman
function findStartPosition() {
    for (let row = 0; row < MAZE_ROWS; row++) {
        for (let col = 0; col < MAZE_COLS; col++) {
            if (MAZE[row][col] !== 1) {
                return [col, row];
            }
        }
    }
    return [12, 18]; // Default position
}

// Pacman state
let pacman = {
    pos: findStartPosition(),
    dir: 'LEFT',
    nextDir: 'LEFT',
    mouthAngle: 0,
    mouthOpening: true
};

// Ghosts
const ghosts = [
    { name: 'blinky', color: COLORS.RED, pos: [12, 9], dir: 'LEFT', frightened: false, eaten: false, respawnTime: 0 },
    { name: 'pinky', color: COLORS.PINK, pos: [11, 9], dir: 'UP', frightened: false, eaten: false, respawnTime: 0 },
    { name: 'inky', color: COLORS.CYAN, pos: [13, 9], dir: 'DOWN', frightened: false, eaten: false, respawnTime: 0 },
    { name: 'clyde', color: COLORS.ORANGE, pos: [12, 10], dir: 'DOWN', frightened: false, eaten: false, respawnTime: 0 }
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
    e.preventDefault();
    
    if (!gameStarted) {
        gameStarted = true;
        hideGameStatus();
    }
    
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
        case ' ':
        case 'Enter':
            if (gameOver || youWin) {
                resetGame();
            }
            break;
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Mobile touch controls
let touchStartX = 0;
let touchStartY = 0;
const MIN_SWIPE_DISTANCE = 30;

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (!gameStarted) {
        gameStarted = true;
        hideGameStatus();
    }
    
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    touchStartX = touch.clientX - rect.left;
    touchStartY = touch.clientY - rect.top;
});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    const rect = canvas.getBoundingClientRect();
    const touchEndX = touch.clientX - rect.left;
    const touchEndY = touch.clientY - rect.top;
    
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    
    if (Math.abs(deltaX) < MIN_SWIPE_DISTANCE && Math.abs(deltaY) < MIN_SWIPE_DISTANCE) {
        if (gameOver || youWin) {
            resetGame();
        }
        return;
    }
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        pacman.nextDir = deltaX > 0 ? 'RIGHT' : 'LEFT';
    } else {
        pacman.nextDir = deltaY > 0 ? 'DOWN' : 'UP';
    }
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
});

// Mobile button controls
function setupMobileControls() {
    const isMobile = 'ontouchstart' in window || window.innerWidth <= 768;
    if (isMobile) {
        const mobileControls = document.getElementById('mobileControls');
        if (mobileControls) {
            mobileControls.style.display = 'block';
        }
    }
    
    function addControlListener(id, direction) {
        const btn = document.getElementById(id);
        if (!btn) return;
        
        ['touchstart', 'mousedown'].forEach(event => {
            btn.addEventListener(event, (e) => {
                e.preventDefault();
                if (!gameStarted) {
                    gameStarted = true;
                    hideGameStatus();
                }
                pacman.nextDir = direction;
            });
        });
    }
    
    addControlListener('upBtn', 'UP');
    addControlListener('downBtn', 'DOWN');
    addControlListener('leftBtn', 'LEFT');
    addControlListener('rightBtn', 'RIGHT');
}

// Game status display
function showGameStatus(mainText, subText) {
    const statusEl = document.getElementById('gameStatus');
    const textEl = document.getElementById('statusText');
    const subtextEl = document.getElementById('statusSubtext');
    
    if (statusEl && textEl && subtextEl) {
        textEl.textContent = mainText;
        textEl.style.fontSize = '48px';
        textEl.style.fontWeight = 'bold';
        textEl.style.color = mainText.includes('WIN') ? COLORS.YELLOW : COLORS.RED;
        textEl.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
        textEl.style.marginBottom = '20px';
        
        subtextEl.textContent = subText;
        subtextEl.style.fontSize = '18px';
        subtextEl.style.color = COLORS.WHITE;
        subtextEl.style.textShadow = '1px 1px 2px rgba(0,0,0,0.8)';
        
        statusEl.style.display = 'block';
    }
}

function hideGameStatus() {
    const statusEl = document.getElementById('gameStatus');
    if (statusEl) {
        statusEl.style.display = 'none';
    }
}

// Utility functions
function canMove(x, y) {
    if (x < 0 || x >= MAZE_COLS || y < 0 || y >= MAZE_ROWS) {
        return false;
    }
    return MAZE[y][x] !== 1;
}

function checkCollision(pos1, pos2) {
    return pos1[0] === pos2[0] && pos1[1] === pos2[1];
}

function updateScore() {
    const scoreEl = document.getElementById('score');
    if (scoreEl) {
        scoreEl.textContent = `Score: ${score}`;
    }
}

function resetGame() {
    // Reset game state
    score = 0;
    gameOver = false;
    youWin = false;
    frightenedTimer = 0;
    globalFrame = 0;
    gameStarted = false;
    
    // Reset maze
    MAZE = MAZE_TEMPLATE.map(row => [...row]);
    
    // Reset pacman
    pacman = {
        pos: findStartPosition(),
        dir: 'LEFT',
        nextDir: 'LEFT',
        mouthAngle: 0,
        mouthOpening: true
    };
    
    // Reset ghosts
    ghosts.forEach((ghost, index) => {
        ghost.frightened = false;
        ghost.eaten = false;
        ghost.respawnTime = 0;
        switch(index) {
            case 0: ghost.pos = [12, 9]; break;
            case 1: ghost.pos = [11, 9]; break;
            case 2: ghost.pos = [13, 9]; break;
            case 3: ghost.pos = [12, 10]; break;
        }
    });
    
    updateScore();
    hideGameStatus();
}

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
                    
                    // Add wall border effect
                    ctx.strokeStyle = '#4444FF';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
                    break;
                case 2: // Dot
                    ctx.fillStyle = COLORS.WHITE;
                    ctx.beginPath();
                    ctx.arc(x + CELL_SIZE/2, y + CELL_SIZE/2, 2, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                case 3: // Power pellet
                    ctx.fillStyle = COLORS.WHITE;
                    ctx.beginPath();
                    ctx.arc(x + CELL_SIZE/2, y + CELL_SIZE/2, 6, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Add glow effect
                    ctx.shadowColor = COLORS.WHITE;
                    ctx.shadowBlur = 10;
                    ctx.beginPath();
                    ctx.arc(x + CELL_SIZE/2, y + CELL_SIZE/2, 6, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.shadowBlur = 0;
                    break;
            }
        }
    }
}

function drawPacman() {
    const x = pacman.pos[0] * CELL_SIZE + CELL_SIZE/2;
    const y = pacman.pos[1] * CELL_SIZE + CELL_SIZE/2;
    const radius = CELL_SIZE/2 - 2;

    // Update mouth animation only if game is active
    if (gameStarted && !gameOver && !youWin) {
        if (pacman.mouthOpening) {
            pacman.mouthAngle += 0.15;
            if (pacman.mouthAngle >= 0.8) pacman.mouthOpening = false;
        } else {
            pacman.mouthAngle -= 0.15;
            if (pacman.mouthAngle <= 0) pacman.mouthOpening = true;
        }
    }

    // Draw Pacman
    ctx.fillStyle = COLORS.YELLOW;
    ctx.beginPath();
    
    let startAngle, endAngle;
    switch(pacman.dir) {
        case 'LEFT':
            startAngle = Math.PI + pacman.mouthAngle;
            endAngle = Math.PI - pacman.mouthAngle;
            break;
        case 'RIGHT':
            startAngle = pacman.mouthAngle;
            endAngle = 2 * Math.PI - pacman.mouthAngle;
            break;
        case 'UP':
            startAngle = 1.5 * Math.PI + pacman.mouthAngle;
            endAngle = 1.5 * Math.PI - pacman.mouthAngle;
            break;
        case 'DOWN':
            startAngle = 0.5 * Math.PI + pacman.mouthAngle;
            endAngle = 0.5 * Math.PI - pacman.mouthAngle;
            break;
    }
    
    ctx.arc(x, y, radius, startAngle, endAngle);
    ctx.lineTo(x, y);
    ctx.closePath();
    ctx.fill();
    
    // Add glow effect
    ctx.shadowColor = COLORS.YELLOW;
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;
}

function drawGhosts() {
    ghosts.forEach(ghost => {
        if (ghost.eaten && Date.now() < ghost.respawnTime) return;

        const x = ghost.pos[0] * CELL_SIZE + CELL_SIZE/2;
        const y = ghost.pos[1] * CELL_SIZE + CELL_SIZE/2;
        const radius = CELL_SIZE/2 - 2;

        // Ghost body
        ctx.fillStyle = ghost.frightened ? COLORS.BLUE : ghost.color;
        ctx.beginPath();
        ctx.arc(x, y - radius/3, radius, Math.PI, 0, false);
        ctx.lineTo(x + radius, y + radius/2);
        
        // Ghost bottom wavy edge
        for (let i = 0; i < 3; i++) {
            ctx.lineTo(x + radius - (i + 1) * radius/2, y + radius/2 - (i % 2) * radius/3);
        }
        
        ctx.lineTo(x - radius, y + radius/2);
        ctx.closePath();
        ctx.fill();

        // Ghost eyes
        if (!ghost.frightened) {
            ctx.fillStyle = COLORS.WHITE;
            ctx.beginPath();
            ctx.arc(x - radius/3, y - radius/3, radius/5, 0, Math.PI * 2);
            ctx.arc(x + radius/3, y - radius/3, radius/5, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = COLORS.BLACK;
            ctx.beginPath();
            ctx.arc(x - radius/3, y - radius/3, radius/8, 0, Math.PI * 2);
            ctx.arc(x + radius/3, y - radius/3, radius/8, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Frightened ghost eyes
            ctx.fillStyle = COLORS.WHITE;
            ctx.fillRect(x - radius/2, y - radius/2, radius/4, radius/4);
            ctx.fillRect(x + radius/4, y - radius/2, radius/4, radius/4);
        }
    });
}

// Movement functions
function movePacman() {
    if (!gameStarted || globalFrame % PACMAN_MOVE_INTERVAL !== 0) return;
    
    // Try to move in the next direction
    const [dx, dy] = DIRECTIONS[pacman.nextDir];
    let newX = pacman.pos[0] + dx;
    let newY = pacman.pos[1] + dy;
    
    // Handle tunnel effect (left-right wrap)
    if (newX < 0) newX = MAZE_COLS - 1;
    if (newX >= MAZE_COLS) newX = 0;
    
    if (canMove(newX, newY)) {
        pacman.dir = pacman.nextDir;
        pacman.pos = [newX, newY];
    } else {
        // Continue in current direction
        const [dx2, dy2] = DIRECTIONS[pacman.dir];
        newX = pacman.pos[0] + dx2;
        newY = pacman.pos[1] + dy2;
        
        // Handle tunnel effect
        if (newX < 0) newX = MAZE_COLS - 1;
        if (newX >= MAZE_COLS) newX = 0;
        
        if (canMove(newX, newY)) {
            pacman.pos = [newX, newY];
        }
    }
}

function moveGhost(ghost) {
    if (!gameStarted) return;
    
    if (ghost.eaten && Date.now() < ghost.respawnTime) {
        return;
    }
    
    if (ghost.eaten && Date.now() >= ghost.respawnTime) {
        ghost.eaten = false;
        ghost.frightened = false;
        ghost.pos = [12, 9]; // Reset position
    }
    
    if (globalFrame % GHOST_MOVE_INTERVAL !== 0) return;
    
    const [dx, dy] = DIRECTIONS[ghost.dir];
    let newX = ghost.pos[0] + dx;
    let newY = ghost.pos[1] + dy;
    
    // Handle tunnel effect
    if (newX < 0) newX = MAZE_COLS - 1;
    if (newX >= MAZE_COLS) newX = 0;
    
    if (canMove(newX, newY)) {
        ghost.pos = [newX, newY];
    } else {
        // Change direction randomly
        const possibleDirs = Object.keys(DIRECTIONS).filter(dir => {
            const [newDx, newDy] = DIRECTIONS[dir];
            let testX = ghost.pos[0] + newDx;
            let testY = ghost.pos[1] + newDy;
            
            if (testX < 0) testX = MAZE_COLS - 1;
            if (testX >= MAZE_COLS) testX = 0;
            
            return canMove(testX, testY);
        });
        
        if (possibleDirs.length > 0) {
            ghost.dir = possibleDirs[Math.floor(Math.random() * possibleDirs.length)];
        }
    }
}

// Game logic
function checkCollisions() {
    if (!gameStarted) return;
    
    // Check ghost collisions
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
                showGameStatus('GAME OVER', 'Press SPACE or tap to restart');
            }
        }
    });
}

function checkDots() {
    if (!gameStarted) return;
    
    const cell = MAZE[pacman.pos[1]][pacman.pos[0]];
    
    if (cell === 2) {
        MAZE[pacman.pos[1]][pacman.pos[0]] = 0;
        score += 10;
        updateScore();
    } else if (cell === 3) {
        MAZE[pacman.pos[1]][pacman.pos[0]] = 0;
        score += 50;
        updateScore();
        
        // Make all ghosts frightened
        ghosts.forEach(ghost => {
            if (!ghost.eaten) {
                ghost.frightened = true;
            }
        });
        frightenedTimer = Date.now() + FRIGHTENED_DURATION;
    }
    
    // Check for win condition
    let dotsRemaining = 0;
    for (let row = 0; row < MAZE_ROWS; row++) {
        for (let col = 0; col < MAZE_COLS; col++) {
            if (MAZE[row][col] === 2 || MAZE[row][col] === 3) {
                dotsRemaining++;
            }
        }
    }
    
    if (dotsRemaining === 0) {
        youWin = true;
        showGameStatus('YOU WIN!', 'Press SPACE or tap to play again');
    }
}

function updateFrightenedTimer() {
    if (frightenedTimer > 0 && Date.now() > frightenedTimer) {
        frightenedTimer = 0;
        ghosts.forEach(ghost => {
            if (!ghost.eaten) {
                ghost.frightened = false;
            }
        });
    }
}

// Main game loop
function gameLoop() {
    if (!gameOver && !youWin) {
        globalFrame++;
        
        // Update game state
        movePacman();
        ghosts.forEach(moveGhost);
        checkCollisions();
        checkDots();
        updateFrightenedTimer();
    }
    
    // Clear canvas
    ctx.fillStyle = COLORS.BLACK;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    
    // Draw game elements
    drawMaze();
    drawPacman();
    drawGhosts();
    
    requestAnimationFrame(gameLoop);
}

// Initialize game
function initGame() {
    updateScore();
    setupMobileControls();
    showGameStatus('PAC-MAN', 'Press any key or tap to start');
    gameLoop();
}

// Start the game when the page loads
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGame);
    } else {
        initGame();
    }
}
