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

const winner = new Audio('../assets/sound/winner.ogg');
const loser = new Audio('../assets/sound/loser.ogg');

(function displayKeyboard() {
  let alphaKey = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
  let keyboard = document.getElementById('keyboard');
  let content = '';
  for (let key of alphaKey) {
    content += `<button class='keyBtn'>${key}</button>`;
  }
  keyboard.innerHTML = content;
})();

async function getData() {
  let response = await fetch('./js/word.json');
  let data = await response.json();
  let obj = getRandomWord(data);
  word = obj.word.toUpperCase();
  hint = obj.hint;
  length = obj.word.length;
  display(word, hint);
}

let btn = document.querySelectorAll('.keyBtn');
btn.forEach((button) => {
  button.addEventListener('click', () => {
    if (gameOver) return;
    let letter = button.textContent.toUpperCase().trim();
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

      // Shake the word box on wrong guess
      wordBox.classList.remove('shake');
      void wordBox.offsetWidth;
      wordBox.classList.add('shake');
    }
  });
});

function getRandomWord(obj) {
  let len = obj.length;
  let index = Math.floor(Math.random() * len);
  return obj[index];
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
  let ltr = document.querySelectorAll('.letter');
  let score = Math.ceil(100 / length);

  for (let char of word) {
    if (char === letter) {
      ltr[index].innerHTML = char;
      robotEnergy = Math.max(0, robotEnergy - score);
      humanImage.src = humanWinning[Math.floor(Math.random() * humanWinning.length)];
      robotImage.src = robotLosing[Math.floor(Math.random() * robotLosing.length)];
      changeHP(robotHP, robotEnergy);
    }
    index++;
  }
}

function changeHP(character, energy) {
  character.style.width = `${energy}%`;

  // Add low-energy pulsing effect when below 40%
  if (energy <= 40) {
    character.classList.add('low');
  } else {
    character.classList.remove('low');
  }

  if (humanEnergy <= 0 && !gameOver) {
    gameOver = true;
    showResult('Loss');
  }
  if (robotEnergy <= 0 && !gameOver) {
    gameOver = true;
    showResult('Won');
  }
}

function showResult(result) {
  resultBox.style.display = 'flex';
  const isWin = result === 'Won';

  if (isWin) {
    winner.play();
  } else {
    loser.play();
  }

  resultBox.innerHTML = `
    <div class="word-reveal">
      <p>THE WORD WAS</p>
      <h3>${word}</h3>
    </div>
    <h1 class="result-title ${isWin ? 'won' : 'lose'}">${isWin ? 'YOU WIN!' : 'YOU LOSE'}</h1>
    <button id="restartBtn">PLAY AGAIN</button>
  `;

  document.getElementById('restartBtn').addEventListener('click', restart);
}

function restart() {
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

getData();
