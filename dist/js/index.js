'use strict';

// TODO:
// сделать нажание кноки в css

const select = (node) => {
  return document.querySelector(node);
}

const selectAll = (node) => {
  return document.querySelectorAll(node);
}

const lang = {
en: "qwertyuiop[]asdfghjkl;'zxcvbnm,./",
ru: "йцукенгшщзхъфывапролджэячсмитьбю.",
ua: "йцукенгшщзхїфівапролджєячсмитьбю.",
}

let typeTrainer = {
  layouts: {},
  langs: [],
  currentLang: '',
  keysQuantity: 10,
  currentKey: false,
  counter: 0,
  errors: 0,
  time: 0,
  string: '',

  addKeyboardLayout: function (alphabet, lang) {
    let findChar = (x) => alphabet.indexOf(x);
    this.langs.push(lang);
    this.layouts[lang] = {
      topRow: [],
      middleRow: [],
      bottomRow: []
    };
    this.layouts[lang].topRow[0] = alphabet.slice(0, findChar('a'));
    this.layouts[lang].middleRow[0] = alphabet.slice(findChar('a'), findChar('z'));
    this.layouts[lang].bottomRow[0] = alphabet.slice(findChar('z'));
  },

  // Begin create JS keyboard method.
  createLayout: function () {
    this.currentLang = this.currentLang || 'en';
    let keyContainer = document.createElement('div');
    keyContainer.classList.add('keyboard');
    let topRow = document.createElement('div');
    let midRow = document.createElement('div');
    let botRow = document.createElement('div');
    let spaceRow = document.createElement('div');
    let radio = document.createElement('input');
    radio.type = 'checkbox';
    let alphabet = this.getFullAlph();
    let root = select('#root');

    for (let i = 0; i < 34; i++) {
      let keyBtn = document.createElement('button');
      keyBtn.classList.add('keyboard__btn');
      keyBtn.innerHTML = alphabet[i];
      let spaceBtn = document.createElement('button');
      spaceBtn.classList.add('keyboard__space');

      if (i <= 11) {
        keyBtn.dataset.note = 'do';
        topRow.appendChild(keyBtn);
      } else if (i <= 22) {
        keyBtn.dataset.note = 're';
        midRow.appendChild(keyBtn);
      } else if (i <= 32) {
        keyBtn.dataset.note = 'mi';
        botRow.appendChild(keyBtn);
      } else if (i = 33) {
        spaceBtn.dataset.note = 'mi';
        spaceBtn.name = 'Space';
        spaceRow.appendChild(spaceBtn);
      }
    }

    keyContainer.innerHTML = '<h2> Vanilla JS keayboard. </h2>';
    keyContainer.appendChild(topRow);
    keyContainer.appendChild(midRow);
    keyContainer.appendChild(botRow);
    keyContainer.appendChild(spaceRow);

    keyContainer.insertAdjacentHTML('beforeEnd', '<label> Mute sound. </label>');
    keyContainer.querySelector('label').prepend(radio);
    root.replaceChild(keyContainer, root.firstElementChild);
  },
  // End create JS keyboard method.

  // Begin create lodash keyboard method.
  createLayoutLodash: function () {
    this.currentLang = this.currentLang || 'en';
    const keyboardTmp = select('#keyboard-tmp').textContent.trim();
    const compiledKeyboard = _.template(keyboardTmp);
    const resultKeyboard = compiledKeyboard();

    select('#root').innerHTML = resultKeyboard;
  },

  makeKeyboardRow: function (start, num, note) {
    const keyTmp = select('#key-tmp').textContent.trim();
    const alphabet = lang[this.currentLang];
    const compiledKey = _.template(keyTmp);
    let resultKey = '';
    for (let i = start; i < start + num; i++) {
      resultKey += compiledKey({ alphabet, i, note });
    }
    return resultKey;
  },
  // End create lodash keyboard method.

  // Begin trainer methods
  runTrainer: function (eventKey) {
    this.stopTimer();
    this.time = 0;
    this.runTimer();
    this.errors = 0;
    this.counter = 0;
    this.string = (() => {
      let str = '';
      for (let i = 0; i < this.keysQuantity; i++) {
        str += this.getRandCharInAlph();
      }
      return str;
    })();
    select('#string').innerHTML = this.makeHTMLString(this.string);
    select('#string').style.letterSpacing = '3px';
    this.currentKey = this.string[0];
    this.highlightKeys();
    this.writeConsole('Start training');
  },

  stopTrainer: function () {
    const msg = (this.errors === 1) ? `You made ${this.errors} mistake.` : `You made ${this.errors} mistakes.`;
    const kps = this.countKPS();

    this.currentKey = false;
    this.stopTimer();
    this.writeConsole('Stop training.');
    this.writeConsole(msg);
    this.writeConsole(`Your KPS is ${kps}`);

    select('#kps').textContent = kps;
    if (localStorage.getItem('kps') === null) {
      localStorage.setItem('kps', kps);
    } else if (+localStorage.getItem('kps') < kps) {
      localStorage.setItem('kps', kps);
      select('#bestKps').textContent = kps;
    }

  },

  checkCharTrainer: function (event) {
    let correctKey;
    if (event.key === this.currentKey) {
      this.writeConsole(`${event.key} = ${this.currentKey}    Right!`);
      correctKey = true;
    } else {
      this.writeConsole(`${event.key} &ne; ${this.currentKey}    Wrong!`);
      correctKey = false;
      ++this.errors;
    }

    ++this.counter;

    this.highlightKeys(correctKey);
    if(this.counter === this.keysQuantity) {
      this.stopTrainer();
      return;
    }

    this.currentKey = this.string[this.counter];
  },

  highlightKeys: function (correctKey) {
    const HTMLString = selectAll('#string span');

    if(this.counter !== 0 && this.counter <= this.keysQuantity) {
      select('#string .active').classList.remove('active');
      HTMLString[this.counter - 1].style.color = correctKey ? '#090' : '#900';
    }

    if (this.counter < this.keysQuantity) {
      HTMLString[this.counter].classList.add('active');
    } else if (this.counter === this.keysQuantity) {
      HTMLString[this.counter - 1].style.color = correctKey ? '#090' : '#900';
    }
  },

  checkSoundType: function (event, keys) {
    const pressedKey = event.key === ' ' ? 33 : lang[this.currentLang].indexOf(event.key);
    const mute = select('.keyboard [type="checkbox"]');
    const playSound = (note) => {
      const audio = select(`audio[data-note=${note}]`);
      audio.currentTime = 0;
      audio.play();
    }

    if (mute.checked !== true && pressedKey !== -1 && event.key === this.currentKey) {
      switch (keys[pressedKey].dataset.note) {
        case 'do':
          playSound('do');
          break;
        case 're':
          playSound('re');
          break;
        case 'mi':
          playSound('mi');
          break;
        default:
      }
    } else if (mute.checked !== true && pressedKey !== -1) {
      playSound('err');
    }
  },

  countKPS: function () {
    const rightKeys = this.keysQuantity - this.errors;
    const result = rightKeys / this.time;
    const kps = (isNaN(result) || result === Infinity) ? 0 : result.toFixed(1);
    return kps;
  },

  runTimer: function () {
    const timer = select('#timer');
    timer.textContent = '0.0s';
    let min = 0;
    let sec = 0;
    this.timeCounter = setInterval(
      () => {
        ++sec;
        ++typeTrainer.time;
        if (sec % 60 === 0) {
          min++;
          sec = 0;
        }
        timer.textContent = min + '.' + sec + 's';
      },
      1000
    );
  },

  stopTimer: function () {
    clearInterval(this.timeCounter);
  },
  // End trainer methods.

  setLang: function (event) {
    switch (select('#chooseLanguage').value) {
      case 'en':
        this.currentLang = 'en';
        this.createLayout();
        break;
      case 'ru':
        this.currentLang = 'ru';
        this.createLayout();
        break;
      case 'ua':
        this.currentLang = 'ua';
        this.createLayout();
        break;
      case null:
        break;
      default:
    }
  },

  setKeysQuantity: function () {
    let num = +select('#keysQuantity').value;
    if (typeof num === 'number' && num > 0 && num < 61 ) {
      this.keysQuantity = num;
    } else {
      alert('You can insert only numbers between 1 and 60 inclusive.');
    }
    return;
  },

  writeConsole: function (text) {
    const pageConsole = select('#console');
    pageConsole.insertAdjacentHTML('beforeEnd', `${Date().substr(16, 8)}  ${text} <br>`);
    pageConsole.scrollTop = pageConsole.scrollHeight - pageConsole.clientHeight;
  },

  getRandomNum: function (min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  },

  getRandCharInAlph: function () {
    let result = this.getFullAlph();
    return result.charAt(this.getRandomNum(0, result.length));
  },

  getFullAlph: function () {
    let langObj = this.layouts[this.currentLang];
    let result = '';
    for (let key in langObj) {
      if (langObj.hasOwnProperty(key)) {
        result += langObj[key];
      }
    }
    return result;
  },

  render: (where, what) => {
    select(where).textContent = what;
  },

  makeHTMLString: function (string) {
    let str = ''
    for (let i = 0; i < string.length; i++) {
      str += `<span>${string[i]}</span>`;
    }
    return str;
  },
}

let bindKeysQuantity = typeTrainer.setKeysQuantity.bind(typeTrainer);
let bindrunTrainer = typeTrainer.runTrainer.bind(typeTrainer);
let bindLayout = typeTrainer.createLayout.bind(typeTrainer);
let bindsetLang = typeTrainer.setLang.bind(typeTrainer);
let bindLayoutLodash = typeTrainer.createLayoutLodash.bind(typeTrainer);
let bindStopTrainer = typeTrainer.stopTrainer.bind(typeTrainer);

select('[name="setKeys"]').addEventListener('click', bindKeysQuantity);
select('[name="runTrainer"]').addEventListener('click', bindrunTrainer);
select('[name="chooseLanguage"]').addEventListener('change', bindsetLang);
select('[name="makeKeyboardJS"]').addEventListener('click', bindLayout);
select('[name="makeKeyboardLodash"]').addEventListener('click', bindLayoutLodash);
select('[name="stopTrainer"]').addEventListener('click', bindStopTrainer);


// begin keyDown & keyUp handlers
window.addEventListener('keydown', keyDownHandler);
window.addEventListener('keyup', keyUpHandler);


function keyDownHandler(event) {
  const keys = selectAll('button[data-note]');

  if (lang[typeTrainer.currentLang].indexOf(event.key) !== -1) {
    event.preventDefault();
    if (typeTrainer.currentKey !== false) {
      typeTrainer.checkSoundType(event, keys);
      typeTrainer.checkCharTrainer(event);
    }
  }

  for (const key of keys) {
    if (key.textContent === event.key || key.name === event.code) {
      key.classList.add('keyboard__btn--active');
      break;
    }
  }
}

function keyUpHandler() {
  for (const key of selectAll('button[data-note]')) {
    if (key.classList.contains('keyboard__btn--active')) {
      key.classList.remove('keyboard__btn--active');
      break;
    }
  }
}
// end keyDown & keyUp handlers


typeTrainer.addKeyboardLayout(lang.en, 'en');
typeTrainer.addKeyboardLayout(lang.ru, 'ru');
typeTrainer.addKeyboardLayout(lang.ua, 'ua');
typeTrainer.createLayout();

if (localStorage.getItem('kps')) {
  select('#bestKps').textContent = localStorage.getItem('kps');
}

typeTrainer.langs.forEach(element => {
  select('#chooseLanguage').insertAdjacentHTML('beforeEnd', `<option value="${element}"> ${element} </option>`)
});

select('#keysQuantity').value = typeTrainer.keysQuantity;

console.log('typeTrainer = ', typeTrainer);
// let testFn = function () {
//   if (typeTrainer.currentLang === '') {
//     console.log('testFn: No language to test. Please choose a language.');
//   } else {
//     let i = 50;

//     console.groupCollapsed('test getRandCharInAlph()');
//     while (i > 0) {
//       console.log('Random character = ' + typeTrainer.getRandCharInAlph());
//       i--;
//     }
//     console.groupEnd();
//   }
// }

// testFn();