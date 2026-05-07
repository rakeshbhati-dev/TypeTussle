import { humanWinning, humanLosing, robotWinning, robotLosing } from "./character.js";

let humanHP = document.querySelector('#humanHP .energy');
let robotHP = document.querySelector('#robotHP .energy');
let word = '';
let hint = '';
let wordBox = document.getElementById('word-box');
let hintBox = document.getElementById('hint-box');
let length;
let resultBox = document.getElementById('result-box');
let humanEnergy = 100;
let robotEnergy = 100;
let humanImage = document.getElementById('human-img');
let robotImage = document.getElementById('robot-img');
let gameOver = false;

// --- Scoring ---
let currentScore = 0;
let highScore = parseInt(localStorage.getItem('typetussle-highscore') || '0');

const scoreEl = document.getElementById('current-score');
const highScoreEl = document.getElementById('high-score');

highScoreEl.textContent = highScore;

function addScore(points) {
  currentScore += points;
  scoreEl.textContent = currentScore;
  scoreEl.classList.remove('bump');
  void scoreEl.offsetWidth;
  scoreEl.classList.add('bump');

  if (currentScore > highScore) {
    highScore = currentScore;
    localStorage.setItem('typetussle-highscore', highScore);
    highScoreEl.textContent = highScore;
    highScoreEl.classList.remove('bump');
    void highScoreEl.offsetWidth;
    highScoreEl.classList.add('bump');
  }
}

function resetScore() {
  currentScore = 0;
  scoreEl.textContent = 0;
}

// --- Audio ---
const winner = new Audio('../assets/sound/winner.ogg');
const loser = new Audio('../assets/sound/loser.ogg');

// --- Keyboard ---
(function displayKeyboard() {
  const alphaKey = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
  const keyboard = document.getElementById('keyboard');
  let content = '';
  for (let key of alphaKey) {
    content += `<button class='keyBtn'>${key}</button>`;
  }
  keyboard.innerHTML = content;
  attachKeyListeners();
})();

function attachKeyListeners() {
  document.querySelectorAll('.keyBtn').forEach((button) => {
    button.addEventListener('click', () => {
      if (gameOver) return;
      const letter = button.textContent.toUpperCase().trim();
      if (word.includes(letter)) {
        displayWord(letter);
        button.disabled = true;
        button.classList.add('correct');
      } else {
        button.classList.add('wrong');
        button.disabled = true;
        humanEnergy = humanEnergy - 20;
        humanImage.src = humanLosing[Math.floor(Math.random() * humanLosing.length)];
        robotImage.src = robotWinning[Math.floor(Math.random() * robotWinning.length)];
        changeHP(humanHP, humanEnergy);
        wordBox.classList.remove('shake');
        void wordBox.offsetWidth;
        wordBox.classList.add('shake');
      }
    });
  });
}

// --- Word data ---
async function getData() {
  const response = await fetch('./js/word.json');
  const data = await response.json();
  const obj = getRandomWord(data);
  word = obj.word.toUpperCase();
  hint = obj.hint;
  length = obj.word.length;
  display(word, hint);
}

function getRandomWord(obj) {
  return obj[Math.floor(Math.random() * obj.length)];
}

function display(word, hint) {
  let content = '';
  for (let letter of word) {
    content += `<div class='letter'></div>`;
  }
  wordBox.innerHTML = content;
  hintBox.innerHTML = hint;
}

function displayWord(letter) {
  let index = 0;
  const ltr = document.querySelectorAll('.letter');
  const scorePerLetter = Math.ceil(100 / length);

  for (let char of word) {
    if (char === letter) {
      ltr[index].innerHTML = char;
      robotEnergy = Math.max(0, robotEnergy - scorePerLetter);
      humanImage.src = humanWinning[Math.floor(Math.random() * humanWinning.length)];
      robotImage.src = robotLosing[Math.floor(Math.random() * robotLosing.length)];
      changeHP(robotHP, robotEnergy);
    }
    index++;
  }
}

function changeHP(character, energy) {
  character.style.width = `${energy}%`;
  character.classList.toggle('low', energy <= 40);

  if (humanEnergy <= 0 && !gameOver) {
    gameOver = true;
    showResult('Loss');
  }
  if (robotEnergy <= 0 && !gameOver) {
    gameOver = true;
    showResult('Won');
  }
}

// --- Results ---
function showResult(result) {
  resultBox.style.display = 'flex';
  const isWin = result === 'Won';

  if (isWin) {
    winner.play();
    const points = Math.max(10, humanEnergy);
    addScore(points);

    resultBox.innerHTML = `
      <div class="word-reveal">
        <p>THE WORD WAS</p>
        <h3>${word}</h3>
      </div>
      <h1 class="result-title won">YOU WIN!</h1>
      <div class="points-earned">+${points} pts</div>
      <button id="nextWordBtn">NEXT WORD &#9658;</button>
    `;
    document.getElementById('nextWordBtn').addEventListener('click', nextWord);

  } else {
    loser.play();
    const isNewBest = currentScore > 0 && currentScore >= highScore;

    resultBox.innerHTML = `
      <div class="word-reveal">
        <p>THE WORD WAS</p>
        <h3>${word}</h3>
      </div>
      <h1 class="result-title lose">YOU LOSE</h1>
      <div class="final-score">
        <span class="score-label">FINAL SCORE</span>
        <span class="score-final-val">${currentScore}</span>
        ${isNewBest
          ? '<span class="new-best">NEW BEST!</span>'
          : `<span class="score-label">BEST: ${highScore}</span>`}
      </div>
      <button id="restartBtn">PLAY AGAIN</button>
    `;
    document.getElementById('restartBtn').addEventListener('click', fullRestart);
  }
}

function nextWord() {
  gameOver = false;
  humanEnergy = 100;
  robotEnergy = 100;

  humanHP.style.width = '100%';
  robotHP.style.width = '100%';
  humanHP.classList.remove('low');
  robotHP.classList.remove('low');

  wordBox.innerHTML = '';
  hintBox.innerHTML = '';
  resultBox.style.display = 'none';

  humanImage.src = humanWinning[0];
  robotImage.src = robotWinning[0];

  document.querySelectorAll('.keyBtn').forEach(button => {
    button.disabled = false;
    button.classList.remove('correct', 'wrong');
  });

  getData();
}

function fullRestart() {
  resetScore();
  nextWord();
}

getData();
