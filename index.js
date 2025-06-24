const boardRows = document.querySelectorAll('.board-row');
const letters = document.querySelectorAll('[data-key]');
const showLetterBtn = document.getElementById('letter-button');
const giveUpBtn = document.getElementById('giveup-button');
const message = document.getElementById('message');
const settingsBtn = document.getElementById('settings-button');
const qwertyBtn = document.getElementById('qwerty');
const abvBtn = document.getElementById('abv');
const darkThemeBtn = document.getElementById('dark-theme');
const hardModeBtn = document.getElementById('hard-mode');
const newGameBtn = document.getElementById('help-button');
const backspaceBtn = document.getElementById('backspace');
const enterBtn = document.getElementById('enter');
let correctLettersArray = [];
let nearLettersArray = [];
//const words = ['колба', 'ветка', 'сетка', 'туман', 'метро', 'козёл'];
let word = '';
const regexp = /[а-я]/;
let idxArray = [];

// const EMPTY_ROW = 1;
// const FILLED_ROW = 2;

// let state = EMPTY_ROW;

const EASY_MODE = 1;
const HARD_MODE = 2;
let state = EASY_MODE;

let currentRow = 0;

letters.forEach((letter) => {
  letter.addEventListener('click', addLetterButton);
});

qwertyBtn.addEventListener('click', qwerty);
abvBtn.addEventListener('click', abv);

showLetterBtn.addEventListener('click', showLetter);

settingsBtn.addEventListener('click', showSettings);
darkThemeBtn.addEventListener('click', toggleDarkTheme);
hardModeBtn.addEventListener('click', toggleHardMode);
backspaceBtn.addEventListener('click', deleteLetter);
enterBtn.addEventListener('click', (event) => {
  if (state === HARD_MODE) {
    checkWordHardMode();
  } else {
    checkWord();
  }
});

// refreshBtn.addEventListener('click', refresh);

giveUpBtn.addEventListener('click', giveUp);

newGameBtn.addEventListener('click', guessWord);

window.addEventListener('DOMContentLoaded', setupItems);
window.addEventListener('click', hideSettings);

window.addEventListener('keypress', (event) => {
  console.log(event);
  if (event.key === 'Enter') {
    if (state === HARD_MODE) {
      checkWordHardMode();
    } else {
      checkWord();
    }
    event.preventDefault();
  }
  if (event.key === 'Backspace') {
    console.log('hui');
    event.preventDefault();
    deleteLetter();
  }

  if (event.key.match(regexp)) {
    if (addLetter(event.key)) {
      addToLocalStorage(event.key);
    }
  }
});

function addLetterButton(event) {
  if (addLetter(event.target.dataset.key)) {
    addToLocalStorage(event.target.dataset.key);
  }
}

function addLetter(data, index) {
  //let data = '';
  //let tilesArray = [];
  //data = event.target.dataset.key;
  // for (row of boardRows) {
  //   console.log('row', row);
  //   const tiles = row.querySelectorAll('.tile');
  //   console.log('tiles', tiles);
  //   if (!tiles[4].dataset.letter) {
  //     tilesArray = tiles;
  //     currentRow = row.id;
  //     console.log(currentRow);
  //     break;
  //   }
  // }
  console.log(index);
  let wasAdded = false;
  let tilesArray = boardRows[currentRow].querySelectorAll('.tile');
  if (index !== undefined && !tilesArray[index].dataset.letter) {
    tilesArray[index].setAttribute('data-letter', `${data}`);
    tilesArray[index].textContent = data;
    tilesArray[index].classList.add('tile-show');
  } else {
    for (tile of tilesArray) {
      if (!tile.dataset.letter) {
        tile.setAttribute('data-letter', `${data}`);
        tile.textContent = data;
        wasAdded = true;
        break;
      }
    }
  }
  return wasAdded;
}

function showMessage(text, type) {
  message.className = '';
  message.offsetWidth = message.offsetWidth;
  message.classList.add(type);
  if (type !== 'answer') {
    message.classList.add('animated');
  }
  message.textContent = text;
}

function markLetter(type, tile, letter) {
  tile.classList.add(type);
  document.querySelector(`[data-key=${letter}]`).classList.add(type);
}

function checkWord() {
  let tileArray = boardRows[currentRow].querySelectorAll('.tile');
  let wordOnBoard = '';
  for (tile of tileArray) {
    wordOnBoard += tile.textContent;
  }
  if (wordOnBoard.length < 5) {
    showMessage('Не хватает букв!', 'error');
  } else {
    if (allWords.indexOf(wordOnBoard) >= 0) {
      currentRow++;
      for (let idx = 0; idx < 5; idx++) {
        let tile = tileArray[idx];
        let letter = tile.textContent;
        let type = 'tile-no';
        if (letter === word[idx]) {
          type = 'tile-correct';
          if (
            !correctLettersArray.some(([l, i]) => l === letter && i === idx)
          ) {
            correctLettersArray.push([letter, idx]);
          }
        } else if (word.indexOf(letter) >= 0) {
          type = 'tile-near';
          if (!nearLettersArray.some((l) => l === letter)) {
            nearLettersArray.push(letter);
          }
        }
        markLetter(type, tile, letter);
        console.log(correctLettersArray);
        console.log(nearLettersArray);
      }

      if (wordOnBoard === word) {
        showMessage('Верно! Вы победили!', 'correct');
      }
      //else {
      //showMessage('Неверно!', 'error');
      //}
    } else {
      showMessage('Такого слова не существует!', 'error');
    }

    // for (w of words) {
    //   if (w === word) {
    //     console.log('Поздравляю!');
    //   }
    // }
  }
}

function deleteLetter() {
  let tilesArray = boardRows[currentRow].querySelectorAll('.tile');
  for (let i = tilesArray.length - 1; i >= 0; i--) {
    if (!(tilesArray[i].textContent === '')) {
      removeFromLocalStorage(tilesArray[i].textContent);
      tilesArray[i].textContent = '';
      tilesArray[i].removeAttribute('data-letter');
      break;
    }
  }
}

function guessWord() {
  currentRow = 0;
  localStorage.clear();
  for (let i = 0; i < 6; i++) {
    let tiles = boardRows[i].querySelectorAll('.tile');
    tiles.forEach((tile) => {
      tile.textContent = '';
      tile.removeAttribute('data-letter');
      tile.classList.remove(
        'tile-no',
        'tile-near',
        'tile-correct',
        'tile-show'
      );
    });
  }
  for (letter of letters) {
    letter.classList.remove('tile-no', 'tile-near', 'tile-correct');
  }

  let index = Math.floor(Math.random() * words.length);
  word = words[index];
  console.log('WORD:', word);
  addToLocalStorage(word);
}

// function refresh() {
//   message.className = '';
//   message.textContent = '';
//   guessWord();
//   let allTiles = document.querySelectorAll('.tile');
//   allTiles.forEach((tile) => {
//     tile.className = 'tile';
//     tile.textContent = '';
//     tile.removeAttribute('data-letter');
//   });
//   letters.forEach((letter) => {
//     letter.className = '';
//   });
//   currentRow = 0;
// }

function giveUp() {
  showMessage(`Ответ: ${word}`, 'answer');
}

// function showLetter() {
//   let tilesArray = boardRows[currentRow].querySelectorAll('.tile');
//   let index = Math.floor(Math.random() * word.length);
//   idxArray.push(index);
//   if (idxArray.length <= 5) {
//     if (tilesArray[index].textContent !== '') {
//       idxArray.splice(index, 1);
//       while (tilesArray[index].textContent !== '') {
//         index = Math.floor(Math.random() * word.length);
//       }
//       idxArray.push(index);
//     }
//     addLetter(word[index], index);
//   }
// }

function showLetter() {
  if (idxArray.length >= 5) {
    return;
  }

  let tilesArray = boardRows[currentRow].querySelectorAll('.tile');

  let index;
  do {
    index = Math.floor(Math.random() * word.length);
  } while (tilesArray[index].textContent !== '');

  idxArray.push(index);
  addLetter(word[index], index);
  addToLocalStorage([word[index], index]);
}

function showSettings() {
  let settingsList = document.getElementById('settings-list');
  settingsList.classList.toggle('show');
}

function hideSettings(event) {
  let settingsList = document.getElementById('settings-list');
  let settings = document.getElementById('settings');
  if (
    !settings.contains(event.target) &&
    settingsList.classList.contains('show')
  ) {
    settingsList.classList.remove('show');
  }
}

function qwerty() {
  document.getElementById('keyboard-container-qwerty').classList.remove('hide');
  document.getElementById('keyboard-container').classList.add('hide');
}

function abv() {
  document.getElementById('keyboard-container-qwerty').classList.add('hide');
  document.getElementById('keyboard-container').classList.remove('hide');
}

function toggleDarkTheme() {
  const body = document.querySelector('body');
  const settingsList = document.querySelectorAll('.text');
  const tiles = document.querySelectorAll('.tile');
  body.classList.toggle('dark-theme');
  settingsList.forEach((setting) => (setting.style.color = 'gray'));

  // tiles.forEach((tile) => tile.classList.toggle('tile-dark-theme'));
}

function toggleHardMode() {
  if (state === EASY_MODE) {
    state = HARD_MODE;
  } else {
    state = EASY_MODE;
  }
}

function checkWordHardMode() {
  let tileArray = boardRows[currentRow].querySelectorAll('.tile');
  let wordOnBoard = '';
  for (tile of tileArray) {
    wordOnBoard += tile.textContent;
  }
  for (let i = 0; i < correctLettersArray.length; i++) {
    console.log(correctLettersArray[i]);
    if (correctLettersArray[i][0] !== wordOnBoard[correctLettersArray[i][1]]) {
      showMessage('Должны быть использованы все угаданные буквы!', 'error');
      return;
    }
  }
  for (let i = 0; i < nearLettersArray.length; i++) {
    console.log(nearLettersArray[i]);
    if (!wordOnBoard.includes(nearLettersArray[i])) {
      showMessage('Должны быть использованы все угаданные буквы!', 'error');
      return;
    }
  }

  checkWord();
}

function addToLocalStorage(link) {
  let items = getLocalStorage();
  items.push(link);
  localStorage.setItem('letters', JSON.stringify(items));
  console.log('ITEMS:', items);
}

function getLocalStorage() {
  return localStorage.getItem('letters')
    ? JSON.parse(localStorage.getItem('letters'))
    : [];
}

function removeFromLocalStorage() {
  let items = getLocalStorage();
  items.pop();
  console.log('ITEMSAFTERREMOVE', items);
  localStorage.setItem('letters', JSON.stringify(items));
}

function setupItems() {
  let items = getLocalStorage();
  word = items[0];
  // items.forEach((item) => {
  //   if (item.length === 1) {
  //     addLetter(item);
  //   }
  // });
  currentRow = 0;
  for (let i = 1; i < items.length; i++) {
    if (Array.isArray(items[i])) {
      addLetter(items[i][0], items[i][1]);
    } else {
      addLetter(items[i]);
    }
    if (i !== 1 && i % 5 === 0) {
      checkWord();
    }
  }
}
