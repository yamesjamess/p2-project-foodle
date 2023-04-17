const gameArea = document.querySelector("[data-game-area]")
const keyboard = document.querySelector("[data-keyboard]")
const alertContainer = document.querySelector("[data-alert-container]")
const FLIP_ANIMATION_DURATION = 500
const DANCE_ANIMATION_DURATION = 500


// Get all the possible words that can be used in the game from JSON file
let dictionary;

fetch('assets/js/dictionary.json')
    .then(response => response.json())
    .then(data => {
        dictionary = data;
    })
    .catch(error => console.error(error));

/**
 * This array will contain the words that will be used as answer the of game.
 * The words will be coming from runGame function when user select theme of the game.
 */
let targetWords = []

//this variable help prevent the function addFruitWords and addVegWords from running more than once
let fruitWordsAdded = false;
let vegWordsAdded = false;


// this variable will contain the word that the user need to guess to win the game.
let targetWord;


/**
 * Logic for the game to select the theme of the target word.
 */
document.addEventListener("DOMContentLoaded", function () {
    let fruitButton = document.getElementById("fruit-btn");
    let vegButton = document.getElementById("veg-btn");
    let resetButton = document.getElementById("reset-btn");

    fruitButton.addEventListener('click', addFruitWords);
    vegButton.addEventListener('click', addVegWords);
    resetButton.addEventListener('click', resetTargetWords);

    // this function will randomly choose a fruit word from the array and assign it to targetWord
    function addFruitWords() {
        if (!fruitWordsAdded && !vegWordsAdded) {
            let fruitWords = ["acorn", "carob", "dates", "gourd", "grape", "lemon", "limes", "mango", "melon", "olive", "peach", "pears", "plums", "prune", "salak"];
            targetWords.push(...fruitWords);

            let chosenFruitWord = targetWords[Math.floor(Math.random() * targetWords.length)];
            targetWord = chosenFruitWord
            fruitWordsAdded = true;
            startGame()
        }
    }

    // this function will randomly choose a vegetable word from the array and assign it to targetWord
    function addVegWords() {
        if (!vegWordsAdded && !fruitWordsAdded) {
            let vegWords = ["azuki", "basil", "beans", "caper", "chard", "dulse", "enoki", "grain", "groat", "maize", "morel", "pinto", "ramps", "thyme", "wheat"];
            targetWords.push(...vegWords);

            let chosenVegWord = targetWords[Math.floor(Math.random() * targetWords.length)];
            targetWord = chosenVegWord
            vegWordsAdded = true;
            fruitWordsAdded = true;
            startGame()
        }
    }
})


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
 * Starts the app and let user able to click or press key to enter their guess.
 */
function startGame() {
    document.addEventListener("click", handleMouseClick);
    document.addEventListener("keydown", handleKeyPress);
}

/**
 * Stop the game and prevent user from being able to click or press key to enter their guess.
 */
function stopGame() {
    document.removeEventListener("click", handleMouseClick);
    document.removeEventListener("keydown", handleKeyPress);
}

/**
 * Event Listener when the user click on key with mouse.
 */
function handleMouseClick(event) {
    if (event.target.matches("[data-key]")) {
        pressKey(event.target.dataset.key);
        return
    } else if (event.target.matches("[data-enter]")) {
        submitGuess();
        return
    } else if (event.target.matches("[data-delete]")) {
        deleteKey();
        return
    }
}

/**
 * Event Listener when the user press on key with keyboard.
 */
function handleKeyPress(event) {
    if (event.key.match(/^[a-z]$/)) {
        pressKey(event.key);
        return
    } else if (event.key === "Enter") {
        submitGuess();
        return
    } else if (event.key === "Backspace" || event.key === "Delete") {
        deleteKey();
        return
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
        return
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

    lastTile.textContent = ""
    delete lastTile.dataset.state;
    delete lastTile.dataset.letter;

}

/**
 * Submits user's guess.
 */
function submitGuess() {
    let activeTiles = [...getActiveTiles()]

    if (activeTiles.length !== 5) {
        showAlert("Not enough letters");
        shakeTiles(activeTiles);
        return
    }

    let guess = activeTiles.reduce(function (word, tile) {
        return word + tile.dataset.letter
    }, "");

    if (!dictionary.includes(guess)) {
        showAlert("Not in word list");
        shakeTiles(activeTiles);
        return
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
    let letter = tile.dataset.letter
    let key = keyboard.querySelector(`[data-key="${letter}"i]`)
    
    setTimeout(function () {
        tile.classList.add("flip")
    }, (index * FLIP_ANIMATION_DURATION) / 2)

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
            })
        }
    }, {
        once: true
    })
}

/**
 * Show the alert box
 */
function showAlert(message, duration = 1000) {
    let alert = document.createElement("div")
    alert.textContent = message;
    alert.classList.add("alert");
    alertContainer.prepend(alert);

    if (duration == null) {
        return
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
        showAlert("You Got It!", 3000);
        danceTiles(tiles);
        stopGame();
        return
    }

    let remainingTiles = gameArea.querySelectorAll(":not([data-letter])")

    if (remainingTiles.length === 0) {
        showAlert(`The correct FOOdle word is ${targetWord.toUpperCase()}`, null);
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
            )
        }, (index * DANCE_ANIMATION_DURATION) / 5)
    })
}

