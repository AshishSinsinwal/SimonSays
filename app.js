// Game State
const gameState = {
    sequence: [],
    userSequence: [],
    started: false,
    level: 0,
    highScore: 0,
    buttons: ["btn1", "btn2", "btn3", "btn4"],
    currentPlayer: null
};

// DOM Elements
const elements = {
    gameContainer: document.querySelector(".game-container"),
    welcomeSection: document.querySelector(".first"),
    proceedBtn: document.querySelector("#proceed-btn"),
    checkbox: document.querySelector("#checkbox"),
    usernameInput: document.querySelector("#user"),
    welcomeMessage: document.querySelector(".welcome-back"),
    welcomeUsername: document.querySelector(".welcome-username"),
    userIcon: document.querySelector(".user-icon"),
    userInfo: document.querySelector(".user-info"),
    userName: document.querySelector(".user-name"),
    userHighscore: document.querySelector(".user-highscore"),
    gameStatus: document.querySelector(".game-status"),
    highestScore: document.querySelector(".highest-score"),
    allButtons: document.querySelectorAll(".box")
};

// Initialize Game
function initGame() {
    // Set up event listeners
    setupEventListeners();
    
    // Disable proceed button initially
    elements.proceedBtn.classList.add("disabled");
}

// Set up all event listeners
function setupEventListeners() {
    // Form validation
    elements.checkbox.addEventListener("change", validateForm);
    elements.usernameInput.addEventListener("input", validateForm);
    
    // Proceed button
    elements.proceedBtn.addEventListener("click", startGame);
    
    // Game buttons
    elements.allButtons.forEach(btn => {
        btn.addEventListener("click", handleButtonClick);
        btn.classList.add("disabled");
    });
    
    // User profile toggle
    elements.userIcon.addEventListener("click", toggleUserInfo);
    document.addEventListener("click", closeUserInfo);
    elements.userInfo.addEventListener("click", stopPropagation);
    
    // Start game on keypress
    document.addEventListener("keypress", handleKeyPress);
}

// Form validation
function validateForm() {
    const username = elements.usernameInput.value.trim();
    if (elements.checkbox.checked && username !== "") {
        elements.proceedBtn.classList.remove("disabled");
    } else {
        elements.proceedBtn.classList.add("disabled");
    }
}

// Start game
function startGame(event) {
    event.preventDefault();
    
    const username = elements.usernameInput.value.trim();
    gameState.currentPlayer = username;
    
    // Hide welcome section, show game
    elements.welcomeSection.style.display = "none";
    elements.gameContainer.style.display = "block";
    
    // Update user info
    elements.userName.textContent = username;
    elements.welcomeUsername.textContent = username;
    
    // Initialize player data
    initPlayerData(username);
    
    // // Show welcome message
    // showWelcomeMessage();
}

// Initialize player data
function initPlayerData(username) {
    let playerData = localStorage.getItem(username);
    
    if (!playerData) {
        // New player
        playerData = { score: 0 };
        localStorage.setItem(username, JSON.stringify(playerData));
        elements.userHighscore.textContent = "Highscore: 0";
    } else {
        // Show welcome message
        showWelcomeMessage();
        // Existing player
        playerData = JSON.parse(playerData);
        gameState.highScore = playerData.score;
        elements.userHighscore.textContent = `Highscore: ${playerData.score}`;
        elements.highestScore.textContent = `Highest score is ${playerData.score}`;
    }
}

// Show welcome message
function showWelcomeMessage() {
    // Reset animation
    elements.welcomeMessage.classList.remove("active");
    void elements.welcomeMessage.offsetWidth;
    
    // Slide in
    elements.welcomeMessage.classList.add("active");
    
    // Slide out after delay
    setTimeout(() => {
        elements.welcomeMessage.classList.remove("active");
    }, 3000);
}

// Handle key press to start game
function handleKeyPress() {
    if (!gameState.started && elements.gameContainer.style.display === "block") {
        startGamePlay();
    }
}

// Start game play
function startGamePlay() {
    gameState.started = true;
    elements.gameStatus.textContent = `Level ${gameState.level}`;
    
    // Enable buttons
    elements.allButtons.forEach(btn => btn.classList.remove("disabled"));
    
    // Start first level
    nextLevel();
}

// Next level
function nextLevel() {
    gameState.userSequence = [];
    gameState.level++;
    elements.gameStatus.textContent = `Level ${gameState.level}`;
    
    // Add random button to sequence
    const randomIndex = Math.floor(Math.random() * 4);
    const nextButton = gameState.buttons[randomIndex];
    gameState.sequence.push(nextButton);
    
    // Show sequence
    showSequence();
}

// Show sequence
function showSequence() {
    let i = 0;
    const interval = setInterval(() => {
        flashButton(gameState.sequence[i]);
        i++;
        if (i >= gameState.sequence.length) {
            clearInterval(interval);
        }
    }, 800);
}

// Flash button (game sequence)
function flashButton(btnId) {
    const button = document.getElementById(btnId);
    button.classList.add("flash");
    
    setTimeout(() => {
        button.classList.remove("flash");
    }, 400);
}

// Handle button click (user input)
function handleButtonClick() {
    if (!gameState.started) return;
    
    const button = this;
    gameState.userSequence.push(button.id);
    
    // Visual feedback
    button.classList.add("userflash");
    setTimeout(() => {
        button.classList.remove("userflash");
    }, 400);
    
    // Check answer
    checkAnswer(gameState.userSequence.length - 1);
}

// Check answer
function checkAnswer(index) {
    if (gameState.userSequence[index] === gameState.sequence[index]) {
        // Correct
        if (gameState.userSequence.length === gameState.sequence.length) {
            setTimeout(() => {
                nextLevel();
            }, 1000);
        }
    } else {
        // Wrong
        gameOver();
    }
}

// Game over
function gameOver() {
    const score = gameState.level - 1;
    elements.gameStatus.innerHTML = `Game over! Your score is <b>${score}</b> <br> Press any key to restart`;
    
    // Flash red background
    document.body.style.backgroundColor = "red";
    setTimeout(() => {
        document.body.style.backgroundColor = "";
    }, 400);
    
    // Update high score if needed
    if (score > gameState.highScore) {
        gameState.highScore = score;
        elements.highestScore.textContent = `Highest score is ${score}`;
        elements.userHighscore.textContent = `Highscore: ${score}`;
        updateHighScore();
    }
    
    // Reset game
    resetGame();
}

// Update high score in localStorage
function updateHighScore() {
    if (!gameState.currentPlayer) return;
    
    let playerData = JSON.parse(localStorage.getItem(gameState.currentPlayer));
    playerData.score = gameState.highScore;
    localStorage.setItem(gameState.currentPlayer, JSON.stringify(playerData));
}

// Reset game
function resetGame() {
    gameState.started = false;
    gameState.level = 0;
    gameState.userSequence = [];
    gameState.sequence = [];
    
    // Disable buttons
    elements.allButtons.forEach(btn => btn.classList.add("disabled"));
}

// User profile functions
function toggleUserInfo(e) {
    e.stopPropagation();
    elements.userInfo.classList.toggle("active");
}

function closeUserInfo() {
    elements.userInfo.classList.remove("active");
}

function stopPropagation(e) {
    e.stopPropagation();
}

// Initialize the game when DOM is loaded
document.addEventListener("DOMContentLoaded", initGame);