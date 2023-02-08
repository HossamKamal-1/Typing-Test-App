// Game Setup
let wordsList = [];
let wordsIndicies = [];
const levels = {
  Easy: 60,
  Normal: 40,
  Hard: 30,
};
let numberOfWords = 3;
let timeInterval;
// Select DOM Elements
let startBtn = document.querySelector(".start");
let levelNameSpan = document.querySelector(".message .lvl");
let secondsSpan = document.querySelector(".message .seconds");
let theWordElement = document.querySelector(".the-word");
let upcomingWordsContainer = document.querySelector(".upcoming-words");
let wordsInputField = document.querySelector(".input");
let timeLeftElement = document.querySelector(".time span");
let currentScoreElement = document.querySelector(".score .current");
let totalScoreElement = document.querySelector(".score .total");
let resultMessageContainer = document.querySelector(".finish");

// disable paste event
wordsInputField.onpaste = (e) => {
  e.preventDefault();
};
wordsInputField.addEventListener("input", inputFieldHandler);
startBtn.addEventListener("click", startBtnHandler);

getWords().then(({ words }) => {
  wordsList = words;
  document.getElementsByName("level").forEach((radio) => {
    radio.addEventListener("change", checkBoxHandler);
  });
  totalScoreElement.textContent = numberOfWords + 1;
  wordsIndicies = [...wordsList.keys()];
});
async function getWords() {
  try {
    let response = await fetch("words.json");
    if (response.ok) {
      let words = await response.json();
      return words;
    }
    throw { statusCode: response.status, statusText: response.statusText };
  } catch (error) {
    console.log(error);
    startBtn.removeEventListener("click", startBtnHandler);
    return Promise.reject("Error");
  }
}

function startBtnHandler(e) {
  e.currentTarget.remove();
  wordsInputField.disabled = false;
  wordsInputField.focus();
  theWordElement.textContent = getRandomWord();
  upcomingWordsContainer.innerHTML = "";
  addWords();
  startTime();
}

function checkBoxHandler() {
  if (this.checked) {
    let defaultLevel = this.value;
    let defaultLevelSeconds = levels[defaultLevel];
    levelNameSpan.textContent = defaultLevel;
    secondsSpan.textContent = defaultLevelSeconds;
    timeLeftElement.textContent = defaultLevelSeconds;
    this.parentElement.parentElement.classList.add("invisible");
    setTimeout(() => {
      this.parentElement.parentElement.remove();
    }, 800);
  }
}

function getRandomWord() {
  let randomIndex = Math.floor(Math.random() * wordsIndicies.length);
  let randomWordIndex = wordsIndicies[randomIndex];
  let randomWord = wordsList[randomWordIndex];
  wordsIndicies.splice(randomIndex, 1);
  return randomWord;
}

function addWords() {
  // Adding rest of the words
  for (let i = 0; i < numberOfWords; i++) {
    let wordDiv = document.createElement("div");
    let wordDivText = document.createTextNode(getRandomWord(wordsList));
    if (i == 0) {
      wordDiv.classList.add("firstcoming");
    }
    wordDiv.appendChild(wordDivText);
    upcomingWordsContainer.appendChild(wordDiv);
  }
}

function inputFieldHandler() {
  if (this.value == theWordElement.textContent) {
    setTimeout(() => {
      currentScoreElement.textContent =
        1 + parseInt(currentScoreElement.textContent);
      if (document.querySelector(".firstcoming")) {
        this.value = "";
        theWordElement.textContent =
          document.querySelector(".firstcoming").textContent;
        upcomingWordsContainer.querySelector(".firstcoming").remove();
      }
      if (upcomingWordsContainer.children[0]) {
        upcomingWordsContainer.children[0].classList.add("firstcoming");
      } else if (
        //Ending Game Condition
        this.value &&
        !upcomingWordsContainer.children[0]
      ) {
        showResult(false);
      }
    }, 200);
  }
}

function showResult(isTimeout = true) {
  // Stop Time
  clearInterval(timeInterval);
  wordsInputField.disabled = true;
  if (isTimeout) {
    let loseConditionSpan = document.createElement("div");
    loseConditionSpan.appendChild(document.createTextNode("Time left"));
    console.log(loseConditionSpan);
    resultMessageContainer.prepend(loseConditionSpan);
    rankingResult();
  } else {
    console.log(
      "stop time and happy win/lose  your score",
      currentScoreElement.textContent
    );

    rankingResult();
  }
}

function rankingResult() {
  let resultSpan = document.createElement("span");
  if (
    parseInt(currentScoreElement.textContent) <=
    Math.trunc(totalScoreElement.textContent / 2)
  ) {
    resultSpan.className = "bad";
    resultSpan.innerHTML = "Bad";
  } else if (
    parseInt(currentScoreElement.textContent) >
      Math.trunc(totalScoreElement.textContent / 2) &&
    currentScoreElement.textContent !== totalScoreElement.textContent
  ) {
    resultSpan.className = "good";
    resultSpan.innerHTML = "Good";
  } else {
    resultSpan.className = "good";
    resultSpan.innerHTML = "Perfect";
  }
  resultMessageContainer.appendChild(resultSpan);
}

function startTime() {
  timeInterval = setInterval(() => {
    timeLeftElement.textContent--;
    if (!parseInt(timeLeftElement.textContent)) {
      // End Game Condition
      showResult();
    }
  }, 1000);
}
