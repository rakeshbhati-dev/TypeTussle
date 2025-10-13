import { humanWinning,humanLosing,robotWinning,robotLosing } from "./character.js";
let humanHP = document.querySelector('#humanHP .energy');
let robotHP = document.querySelector('#robotHP .energy');
let word = ''
let hint = ''
let wordBox = document.getElementById('word-box');
let hintBox = document.getElementById('hint-box');
let length
let resultBox = document.getElementById('result-box');
let humanEnergy = 100;
let robotEnergy = 100;
let humanImage=document.getElementById('human-img')
let robotImage=document.getElementById('robot-img')
const winner=new Audio('../assets/sound/winner.ogg');
const loser=new Audio('../assets/sound/loser.ogg');

(function displayKeyboard() {
  let alphaKey = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
  let keyboard = document.getElementById('keyboard')
  let content = ''
  for (let key of alphaKey) {
    content += `<button class='keyBtn'> ${key} </button>`
  }
  keyboard.innerHTML = content
})();

async function getData() {
  let response = await fetch('./js/word.json')
  let data = await response.json()
  let obj = getRandomWord(data)
  word = obj.word.toUpperCase()
  hint = obj.hint
  length=obj.word.length
  display(word, hint)
};

let btn = document.querySelectorAll('.keyBtn')
btn.forEach((button) => {
  button.addEventListener('click', () => {
    let letter = button.textContent.toUpperCase().trim()
    if (word.includes(letter)) {
      displayWord(letter)
      button.disabled = true
      button.classList.add('correct')
    }
    else {
      button.classList.add('wrong')
      button.disabled = true
      humanEnergy=humanEnergy-20
      humanImage.src=humanLosing[Math.floor(Math.random()*humanLosing.length)]
      robotImage.src=robotWinning[Math.floor(Math.random()*robotWinning.length)]
      changeHP(humanHP,humanEnergy)
      
    }
  })
})

function getRandomWord(obj) {
  let len = obj.length
  let index = Math.floor(Math.random() * len)
  return obj[index];
}

function display(word, hint) {

  let content = ''
  for (let letter of word) {
    content += `<div class='letter'>_</div>`
  }
  wordBox.innerHTML = content
  hintBox.innerHTML = `${hint}`
}
function displayWord(letter) {
  let index = 0
  let ltr = document.querySelectorAll('.letter')
  let score=Math.ceil(100/length)

  for (let char of word) {
    if (char == letter) {
      ltr[index].innerHTML = `${char}`
      robotEnergy= Math.max(0,robotEnergy-score)
      humanImage.src=humanWinning[Math.floor(Math.random()*humanWinning.length)]
      robotImage.src=robotLosing[Math.floor(Math.random()*robotLosing.length)]
      changeHP(robotHP,robotEnergy)
    }
    index++
  }
}

function changeHP(character, energy) {
  character.style.cssText = `width:${energy}%`
  if(humanEnergy==0){
    showResult('Loss')
  }
  if(robotEnergy==0){
    showResult('Won')
  }
}

function showResult(result){
  resultBox.style.display="flex"
  if(result=="Won"){
    winner.play()
    resultBox.innerHTML=`
    <div>
    <p>The word was </p>
    <h3>${word}</h3>
    </div>
    <h1>You Won </h1>
    <button id="restartBtn">Restart</button>
    `
  }
  else{
    loser.play()
    resultBox.innerHTML=`
    <div>
    <p>The word was </p>
    <h3>${word}</h3>
    </div>
    <h1>You Lose </h1>
    <button id="restartBtn">Restart</button>`
  }
  document.getElementById('restartBtn').addEventListener('click', restart);
}
  function restart() {
  humanEnergy = 100;
  robotEnergy = 100;

  humanHP.style.width = '100%';
  robotHP.style.width = '100%';

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

getData()