//Constant & Variables
const gameArea = document.querySelector("[data-game-area]");
const keyboard = document.querySelector("[data-keyboard]");
const alertContainer = document.querySelector("[data-alert-container]");
const FLIP_ANIMATION_DURATION = 500;
const DANCE_ANIMATION_DURATION = 500;

// Get all the possible words that can be used in the game from JSON file
let dictionary;

/**
 * This array will contain the words that will be used as answer the of game.
 * The words will be coming from runGame function, when user select theme of the game.
 */
let targetWords = []

// this variable will contain the word that the user need to guess to win the game.
let targetWord;

//this variable help prevent the function addFruitWords and addVegWords from running more than once
let fruitWordsAdded = false;
let vegWordsAdded = false;

//Event listener variables
let openRulesButton = document.querySelectorAll("[data-rules-target]");
let closeRulesButton = document.querySelectorAll("[data-close-button]");
let overlay = document.getElementById("overlay");
let inputUsername = document.querySelector("input");
let startButton = document.getElementById("start-button");
let username;

//fetch method to get list of all available words from JSON file.
fetch('assets/js/dictionary.json')
    .then(response => response.json())
    .then(data => {
        dictionary = data;
    })
    .catch(error => console.error(error));

//Event Listeners Registrations

//Event listener for opening the rule window
openRulesButton.forEach(function (button) {
    button.addEventListener("click", function () {
        let rules = document.querySelector(button.dataset.rulesTarget);
        openRules(rules);
    });
});

//Event listener to close rule window when clicked on overlay
overlay.addEventListener("click", overlayCloseRules);

//Event listener to close rule window when click on the close button
closeRulesButton.forEach(function (button) {
    button.addEventListener("click", function () {
        let rules = button.closest(".rules");
        closeRules(rules);
    });
});

//Event listener for start button
startButton.addEventListener("click", function(){
    handleStart();
    setTimeout(addThemeEventListeners, 750);
});

/**
 * Logic for the game to select the theme of the target word.
 */
document.addEventListener("DOMContentLoaded", function () {
    let fruitButton = document.getElementById("fruit-btn");
    let vegButton = document.getElementById("veg-btn");
    let resetButton = document.getElementById("reset-btn");

    fruitButton.addEventListener("click", addFruitWords);
    vegButton.addEventListener("click", addVegWords);
    resetButton.addEventListener("click", resetTargetWords);

    /** this function will randomly choose a vegetable word from the array and 
     * assign it to targetWord 
     */ 
        function addFruitWords() {
        if (!fruitWordsAdded && !vegWordsAdded) {
            let fruitWords = ["acorn", 
            "carob", 
            "dates", 
            "gourd", 
            "grape", 
            "lemon", 
            "limes", 
            "mango", 
            "melon", 
            "olive", 
            "peach", 
            "pears", 
            "plums", 
            "prune", 
            "salak"];
            targetWords.push(...fruitWords);

            let chosenFruitWord = targetWords[
                Math.floor(Math.random() * targetWords.length)];
            targetWord = chosenFruitWord;
            fruitWordsAdded = true;
            fruitButton.classList.add("active-theme");
            showAlert("You have selected Fruit Words", 2000);
            startGame();
        }
    }

    /** this function will randomly choose a vegetable word from the array and 
     * assign it to targetWord 
     */ 
    function addVegWords() {
        if (!vegWordsAdded && !fruitWordsAdded) {
            let vegWords = ["azuki", 
            "basil", 
            "beans", 
            "caper", 
            "chard", 
            "dulse", 
            "enoki", 
            "grain", 
            "groat", 
            "maize", 
            "morel", 
            "pinto", 
            "ramps", 
            "thyme", 
            "wheat"];
            targetWords.push(...vegWords);

            let chosenVegWord = targetWords[
                Math.floor(Math.random() * targetWords.length)];
            targetWord = chosenVegWord;
            vegWordsAdded = true;
            fruitWordsAdded = true;
            vegButton.classList.add("active-theme");
            showAlert("You have selected Vegetable Words", 2000);
            startGame();
        }
    }
});

//Functions Definitions

/**
 * Function to restart the game.
 */
function resetTargetWords() {
    stopGame();
    targetWords = [];
    targetWord = [];
    fruitWordsAdded = false;
    vegWordsAdded = false;
}

/**
 * Function for that Start button
 */
function handleStart() {
    if (inputUsername.value){
        username = inputUsername.value;
    } else {
        username = "Guest";
    }
    let startContainer = document.querySelector(".start-container");
    startContainer.classList.add("inactive");
}

//These are functions for the rule modal window
function openRules(rules) {
    if (rules == null) return;
    rules.classList.add("active");
    overlay.classList.add("active");
}

function closeRules(rules) {
    if (rules == null) return;
    rules.classList.remove("active");
    overlay.classList.remove("active");
}

function overlayCloseRules() {
    let rules = document.querySelectorAll(".rules.active");
    rules.forEach(function (rules) {
        closeRules(rules);
    });
}

// Add event listener that alert user to pick a theme
function addThemeEventListeners() {
    document.addEventListener("keypress", function(event){
        if(!targetWord) {
            showAlert("Please select a theme");
        }
    });

    document.addEventListener("click", function(event){
        if(!targetWord) {
            showAlert("Please select a theme");
        }
    });
}

//The functions below are coded along from a tutorial by Web Dev Simplified

/**
 * Starts the app and let user able to click or press key to enter their guess.
 */
function startGame() {
    document.addEventListener("click", handleMouseClick);
    document.addEventListener("keydown", handleKeyPress);
}

/**
 * Stop the game and prevent user from being able to click 
 * or press key to enter their guess.
 */
function stopGame() {
    document.removeEventListener("click", handleMouseClick);
    document.removeEventListener("keydown", handleKeyPress);
}

/**
 * Function that handle the users click on key with cursor.
 */
function handleMouseClick(event) {
    if (event.target.matches("[data-key]")) {
        pressKey(event.target.dataset.key);
        return;
    } else if (event.target.matches("[data-enter]")) {
        submitGuess();
        return;
    } else if (event.target.matches("[data-delete]")) {
        deleteKey();
        return;
    }
}

/**
 * Function that handle the users click on key with keyboard.
 */
function handleKeyPress(event) {
    if (event.key.match(/^[a-z]$/)) {
        pressKey(event.key);
        return;
    } else if (event.key === "Enter") {
        submitGuess();
        return;
    } else if (event.key === "Backspace" || event.key === "Delete") {
        deleteKey();
        return;
    }
}

/**
 * Get the information how many active tiles are there per guess.
 */
function getActiveTiles() {
    return gameArea.querySelectorAll('[data-state="active"]');
}

/**
 * Enters the key user press/click into the game area.
 */
function pressKey(key) {
    let activeTiles = getActiveTiles();

    if (activeTiles.length >= 5) {
        return;
    }

    let nextTile = gameArea.querySelector(":not([data-letter])");
    nextTile.dataset.letter = key.toLowerCase();
    nextTile.textContent = key;
    nextTile.dataset.state = "active";
}

/**
 * Delete a letter that the user input.
 */
function deleteKey() {
    let activeTiles = getActiveTiles();
    let lastTile = activeTiles[activeTiles.length - 1];

    if (lastTile == null) return;

    lastTile.textContent = "";
    delete lastTile.dataset.state;
    delete lastTile.dataset.letter;

}

/**
 * Submits user's guess.
 */
function submitGuess() {
    let activeTiles = [...getActiveTiles()];

    if (activeTiles.length !== 5) {
        showAlert("Not enough letters");
        shakeTiles(activeTiles);
        return;
    }

    let guess = activeTiles.reduce(function (word, tile) {
        return word + tile.dataset.letter;
    }, "");

    if (!dictionary.includes(guess)) {
        showAlert("Not in word list");
        shakeTiles(activeTiles);
        return;
    }

    stopGame();
    activeTiles.forEach(function (tile, index, array) {
        flipTile(tile, index, array, guess);
    });

}

/**
 * Flip the tiles after user have submitted their guess
 */
function flipTile(tile, index, array, guess) {
    let letter = tile.dataset.letter;
    let key = keyboard.querySelector(`[data-key="${letter}"i]`);

    setTimeout(function () {
        tile.classList.add("flip");
    }, (index * FLIP_ANIMATION_DURATION) / 2);

    tile.addEventListener("transitionend", function () {
        tile.classList.remove("flip");

        // when the tile fliped back this if loop will add colour accordingly
        if (targetWord[index] === letter) {
            tile.dataset.state = "correct";
            key.classList.add("correct");
        } else if (targetWord.includes(letter)) {
            tile.dataset.state = "wrong-location";
            key.classList.add("wrong-location");
        } else {
            tile.dataset.state = "wrong";
            key.classList.add("wrong");
        }

        if (index === array.length - 1) {
            tile.addEventListener("transitionend", function () {
                startGame();
                checkAnswer(guess, array);
            }, {
                once: true
            });
        }
    }, {
        once: true
    });
}

/**
 * Show the alert box
 */
function showAlert(message, duration = 1000) {
    let alert = document.createElement("div");
    alert.textContent = message;
    alert.classList.add("alert");
    alertContainer.prepend(alert);

    if (duration == null) {
        return;
    }

    setTimeout(function () {
        alert.classList.add("hide");
        alert.addEventListener("transitioned", function () {
            alert.remove();
        });
    }, duration);
}

/**
 * Make the tiles shake when user did not input enough words
 */
function shakeTiles(tiles) {
    tiles.forEach(function (tile) {
        tile.classList.add("shake");
        tile.addEventListener(
            "animationend",
            function () {
                tile.classList.remove("shake");
            }, {
                once: true
            }
        );
    });
}

/**
 * Check the user's guess if it's correct or not
 */
function checkAnswer(guess, tiles) {
    if (guess === targetWord) {
        showAlert(`Congratulations ${username}!! You guessed correctly!!`, 3000);
        danceTiles(tiles);
        stopGame();
        return;
    }

    let remainingTiles = gameArea.querySelectorAll(":not([data-letter])");

    if (remainingTiles.length === 0) {
        showAlert(`Awww ${username}...
        \nThe correct FOOdle word is ${targetWord.toUpperCase()}`, null);
        stopGame();
    }
}

/**
 * Make the tiles dance when the user got the correct answer
 */
function danceTiles(tiles) {
    tiles.forEach(function (tile, index) {
        setTimeout(function () {
            tile.classList.add("dance");
            tile.addEventListener(
                "animationend",
                function () {
                    tile.classList.remove("dance");
                }, {
                    once: true
                }
            );
        }, (index * DANCE_ANIMATION_DURATION) / 5);
    });
}