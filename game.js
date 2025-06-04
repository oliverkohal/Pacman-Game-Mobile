<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pacman Game</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            background-color: #000;
            color: white;
            font-family: Arial, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            min-height: 100vh;
        }
        
        #gameContainer {
            text-align: center;
        }
        
        #score {
            font-size: 24px;
            margin-bottom: 10px;
            color: #FFFF00;
        }
        
        #gameCanvas {
            border: 2px solid #2121DE;
            display: block;
            margin: 0 auto;
        }
        
        #mobileControls {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            display: none;
        }
        
        .control-btn {
            width: 60px;
            height: 60px;
            font-size: 24px;
            background-color: #2121DE;
            color: white;
            border: 2px solid #FFFF00;
            border-radius: 10px;
            margin: 5px;
            cursor: pointer;
            user-select: none;
        }
        
        .control-btn:active {
            background-color: #FFFF00;
            color: #2121DE;
        }
        
        .control-row {
            display: flex;
            justify-content: center;
            align-items: center;
        }
        
        #instructions {
            margin-top: 20px;
            font-size: 14px;
            color: #ccc;
        }
        
        @media (max-width: 768px) {
            #mobileControls {
                display: block !important;
            }
        }
    </style>
</head>
<body>
    <div id="gameContainer">
        <div id="score">Score: 0</div>
        <canvas id="gameCanvas"></canvas>
        <div id="instructions">
            Use arrow keys or swipe to move Pacman
        </div>
    </div>
    
    <div id="mobileControls">
        <div class="control-row">
            <button class="control-btn" id="upBtn">↑</button>
        </div>
        <div class="control-row">
            <button class="control-btn" id="leftBtn">←</button>
            <button class="control-btn" id="rightBtn">→</button>
        </div>
        <div class="control-row">
            <button class="control-btn" id="downBtn">↓</button>
        </div>
    </div>

    <script>
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

        // Fixed maze layout (0=empty, 1=wall, 2=dot, 3=power pellet, 4=ghost door)
        const MAZE = [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,3,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,3,1],
            [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
            [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
            [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
            [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1,1],
            [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
            [1,1,1,1,1,1,2,1,1,1,1,1,0,1,1,0,1,1,1,1,1,2,1,1,1,1,1,1],
            [1,1,1,1,1,1,2,1,1,0,0,0,0,0,0,0,0,0,0,1,1,2,1,1,1,1,1,1],
            [1,1,1,1,1,1,2,1,1,0,1,1,4,4,4,4,1,1,0,1,1,2,1,1,1,1,1,1],
            [0,0,0,0,0,0,2,0,0,0,1,0,0,0,0,0,0,1,0,0,0,2,0,0,0,0,0,0],
            [1,1,1,1,1,1,2,1,1,0,1,0,0,0,0,0,0,1,0,1,1,2,1,1,1,1,1,1],
            [1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1],
            [1,1,1,1,1,1,2,1,1,0,0,0,0,0,0,0,0,0,0,1,1,2,1,1,1,1,1,1],
            [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
            [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
            [1,3,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,3,1],
            [1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1,1],
            [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
            [1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1],
            [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ];

        // Pad maze to 31 rows
        while (MAZE.length < MAZE_ROWS) {
            MAZE.push(new Array(MAZE_COLS).fill(1));
        }

        // Game state
        let score = 0;
        let gameOver = false;
        let youWin = false;
        let frightenedTimer = 0;
        let globalFrame = 0;
        
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

        // Fixed starting position - Pacman starts in bottom corridor
        function findStartPosition() {
            return [13, 20]; // Bottom corridor, center position
        }

        // Pacman state
        let pacman = {
            pos: findStartPosition(),
            dir: 'LEFT',
            nextDir: 'LEFT',
            mouthAngle: 0,
            mouthOpening: true
        };

        // Ghosts - starting in the ghost house
        const ghosts = [
            { name: 'blinky', color: COLORS.RED, pos: [13, 11], dir: 'LEFT', frightened: false, eaten: false, respawnTime: 0 },
            { name: 'pinky', color: COLORS.PINK, pos: [14, 11], dir: 'UP', frightened: false, eaten: false, respawnTime: 0 },
            { name: 'inky', color: COLORS.CYAN, pos: [13, 12], dir: 'DOWN', frightened: false, eaten: false, respawnTime: 0 },
            { name: 'clyde', color: COLORS.ORANGE, pos: [14, 12], dir: 'DOWN', frightened: false, eaten: false, respawnTime: 0 }
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

        // Mobile touch controls
        let touchStartX = 0;
        let touchStartY = 0;
        const MIN_SWIPE_DISTANCE = 30;

        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
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
            if ('ontouchstart' in window) {
                document.getElementById('mobileControls').style.display = 'block';
            }
            
            document.getElementById('upBtn').addEventListener('touchstart', (e) => {
                e.preventDefault();
                pacman.nextDir = 'UP';
            });
            
            document.getElementById('downBtn').addEventListener('touchstart', (e) => {
                e.preventDefault();
                pacman.nextDir = 'DOWN';
            });
            
            document.getElementById('leftBtn').addEventListener('touchstart', (e) => {
                e.preventDefault();
                pacman.nextDir = 'LEFT';
            });
            
            document.getElementById('rightBtn').addEventListener('touchstart', (e) => {
                e.preventDefault();
                pacman.nextDir = 'RIGHT';
            });
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
            document.getElementById('score').textContent = `Score: ${score}`;
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

            // Update mouth animation
            if (pacman.mouthOpening) {
                pacman.mouthAngle += 0.15;
                if (pacman.mouthAngle >= 0.8) pacman.mouthOpening = false;
            } else {
                pacman.mouthAngle -= 0.15;
                if (pacman.mouthAngle <= 0) pacman.mouthOpening = true;
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
                }
            });
        }

        // Movement functions
        function movePacman() {
            if (globalFrame % PACMAN_MOVE_INTERVAL !== 0) return;
            
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
            if (ghost.eaten && Date.now() < ghost.respawnTime) {
                return;
            }
            
            if (ghost.eaten && Date.now() >= ghost.respawnTime) {
                ghost.eaten = false;
                ghost.frightened = false;
                ghost.pos = [14, 11]; // Reset position
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
                    }
                }
            });
        }

        function checkDots() {
            const cell = MAZE[pacman.pos[1]][pacman.pos[0]];
            
            if (cell === 2) {
                MAZE[pacman.pos[1]][pacman.pos[0]] = 0;
                score += 10;
                updateScore();
            } else if (cell === 3) {
                MAZE[pacman.pos[1]][pacman.pos[0]] = 0;
                score += 50;
                updateScore();
                
                // Frighten ghosts
                frightenedTimer = Date.now() + FRIGHTENED_DURATION;
                ghosts.forEach(ghost => {
                    if (!ghost.eaten) {
                        ghost.frightened = true;
                    }
                });
            }
        }

        function updateFrightenedState() {
            if (frightenedTimer && Date.now() > frightenedTimer) {
                frightenedTimer = 0;
                ghosts.forEach(ghost => {
                    ghost.frightened = false;
                });
            }
        }

        function checkWinCondition() {
            // Check if all dots and power pellets are eaten
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
            }
        }

        function drawGameOver() {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(0, 0, WIDTH, HEIGHT);
            
            ctx.fillStyle = COLORS.RED;
            ctx.font = 'bold 48px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', WIDTH/2, HEIGHT/2);
            
            ctx.fillStyle = COLORS.WHITE;
            ctx.font = '24px Arial';
            ctx.fillText('Refresh to play again', WIDTH/2, HEIGHT/2 + 60);
        }

        function drawYouWin() {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(0, 0, WIDTH, HEIGHT);
            
            ctx.fillStyle = COLORS.YELLOW;
            ctx.font = 'bold 48px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('YOU WIN!', WIDTH/2, HEIGHT/2);
            
            ctx.fillStyle = COLORS.WHITE;
            ctx.font = '24px Arial';
            ctx.fillText(`Final Score: ${score}`, WIDTH/2, HEIGHT/2 + 60);
            ctx.fillText('Refresh to play again', WIDTH/2, HEIGHT/2 + 90);
        }

        // Main game loop
        function gameLoop() {
            if (gameOver) {
                drawGameOver();
                return;
            }
            
            if (youWin) {
                drawYouWin();
                return;
            }
            
            // Clear canvas
            ctx.fillStyle = COLORS.BLACK;
            ctx.fillRect(0, 0, WIDTH, HEIGHT);
            
            // Update game state
            globalFrame++;
            movePacman();
            ghosts.forEach(moveGhost);
            checkDots();
            updateFrightenedState();
            checkCollisions();
            checkWinCondition();
            
            // Draw everything
            drawMaze();
            drawPacman();
            drawGhosts();
            
            // Continue game loop
            requestAnimationFrame(gameLoop);
        }

        // Initialize game
        function initGame() {
            console.log('Initializing Pacman game...');
            setupMobileControls();
            updateScore();
            gameLoop();
        }

        // Start the game when page loads
        window.addEventListener('load', initGame);
    </script>
</body>
</html>
