'use strict';

// TODO:
// сделать нажание кноки в css

var select = function select(node) {
  return document.querySelector(node);
};

var selectAll = function selectAll(node) {
  return document.querySelectorAll(node);
};

var lang = {
  en: "qwertyuiop[]asdfghjkl;'zxcvbnm,./",
  ru: "йцукенгшщзхъфывапролджэячсмитьбю.",
  ua: "йцукенгшщзхїфівапролджєячсмитьбю."
};

var typeTrainer = {
  layouts: {},
  langs: [],
  currentLang: '',
  keysQuantity: 20,
  currentKey: false,
  counter: 0,
  errors: 0,
  time: 0,
  string: '',

  addKeyboardLayout: function addKeyboardLayout(alphabet, lang) {
    var findChar = function findChar(x) {
      return alphabet.indexOf(x);
    };
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
  createLayout: function createLayout() {
    this.currentLang = this.currentLang || 'en';
    var keyContainer = document.createElement('div');
    keyContainer.classList.add('keyboard');
    var topRow = document.createElement('div');
    var midRow = document.createElement('div');
    var botRow = document.createElement('div');
    var spaceRow = document.createElement('div');
    var radio = document.createElement('input');
    radio.type = 'checkbox';
    var alphabet = this.getFullAlph();
    var root = select('#root');

    for (var i = 0; i < 34; i++) {
      var keyBtn = document.createElement('button');
      keyBtn.classList.add('keyboard__btn');
      keyBtn.innerHTML = alphabet[i];
      var spaceBtn = document.createElement('button');
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

    keyContainer.innerHTML = '<h2> Vanilla JS keayboard </h2>';
    keyContainer.appendChild(topRow);
    keyContainer.appendChild(midRow);
    keyContainer.appendChild(botRow);
    keyContainer.appendChild(spaceRow);

    keyContainer.insertAdjacentHTML('beforeEnd', '<label> Mute sound </label>');
    keyContainer.querySelector('label').prepend(radio);
    root.replaceChild(keyContainer, root.firstElementChild);
  },
  // End create JS keyboard method.

  // Begin create lodash keyboard method.
  createLayoutLodash: function createLayoutLodash() {
    this.currentLang = this.currentLang || 'en';
    var keyboardTmp = select('#keyboard-tmp').textContent.trim();
    var compiledKeyboard = _.template(keyboardTmp);
    var resultKeyboard = compiledKeyboard();

    select('#root').innerHTML = resultKeyboard;
  },

  makeKeyboardRow: function makeKeyboardRow(start, num, note) {
    var keyTmp = select('#key-tmp').textContent.trim();
    var alphabet = lang[this.currentLang];
    var compiledKey = _.template(keyTmp);
    var resultKey = '';
    for (var i = start; i < start + num; i++) {
      resultKey += compiledKey({ alphabet: alphabet, i: i, note: note });
    }
    return resultKey;
  },
  // End create lodash keyboard method.

  // Begin trainer methods
  runTrainer: function runTrainer(eventKey) {
    var _this = this;

    this.stopTimer();
    this.time = 0;
    this.runTimer();
    this.errors = 0;
    this.counter = 0;
    this.string = function () {
      var str = '';
      for (var i = 0; i < _this.keysQuantity; i++) {
        str += _this.getRandCharInAlph();
      }
      return str;
    }();
    select('#string').innerHTML = this.makeHTMLString(this.string);
    select('#string').style.letterSpacing = '3px';
    this.currentKey = this.string[0];
    this.highlightKeys();
    this.writeConsole('Start training');
  },

  stopTrainer: function stopTrainer(e) {
    if (e && e.type === 'click') {
      this.stopTimer();
      return;
    }
    var msg = this.errors === 1 ? "You made " + this.errors + " mistake." : "You made " + this.errors + " mistakes.";
    var kps = this.countKPS();

    this.currentKey = false;
    this.stopTimer();
    this.writeConsole('Stop training.');
    this.writeConsole(msg);
    this.writeConsole("Your KPS is " + kps);

    select('#kps').textContent = kps;
    if (localStorage.getItem('kps') === null) {
      localStorage.setItem('kps', kps);
      this.render('#bestKps', kps);
    } else if (+localStorage.getItem('kps') < kps) {
      localStorage.setItem('kps', kps);
      this.render('#bestKps', kps);
    }
  },

  checkCharTrainer: function checkCharTrainer(event) {
    var correctKey = void 0;
    if (event.key === this.currentKey) {
      this.writeConsole(event.key + " = " + this.currentKey + "    Right!");
      correctKey = true;
    } else {
      this.writeConsole(event.key + " &ne; " + this.currentKey + "    Wrong!");
      correctKey = false;
      ++this.errors;
    }

    ++this.counter;

    this.highlightKeys(correctKey);
    if (this.counter === this.keysQuantity) {
      this.stopTrainer();
      return;
    }

    this.currentKey = this.string[this.counter];
  },

  highlightKeys: function highlightKeys(correctKey) {
    var HTMLString = selectAll('#string span');

    if (this.counter !== 0 && this.counter <= this.keysQuantity) {
      select('#string .active').classList.remove('active');
      HTMLString[this.counter - 1].style.color = correctKey ? '#090' : '#900';
    }

    if (this.counter < this.keysQuantity) {
      HTMLString[this.counter].classList.add('active');
    } else if (this.counter === this.keysQuantity) {
      HTMLString[this.counter - 1].style.color = correctKey ? '#090' : '#900';
    }
  },

  checkSoundType: function checkSoundType(event, keys) {
    var pressedKey = event.key === ' ' ? 33 : lang[this.currentLang].indexOf(event.key);
    var mute = select('.keyboard [type="checkbox"]');
    var playSound = function playSound(note) {
      var audio = select("audio[data-note=" + note + "]");
      audio.currentTime = 0;
      audio.play();
    };

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

  countKPS: function countKPS() {
    var rightKeys = this.keysQuantity - this.errors;
    var result = rightKeys / this.time;
    var kps = isNaN(result) || result === Infinity ? 0 : result.toFixed(1);
    return kps;
  },

  runTimer: function runTimer() {
    var timer = select('#timer');
    timer.textContent = '0.0s';
    var min = 0;
    var sec = 0;
    this.timeCounter = setInterval(function () {
      ++sec;
      ++typeTrainer.time;
      if (sec % 60 === 0) {
        min++;
        sec = 0;
      }
      timer.textContent = min + '.' + sec + 's';
    }, 1000);
  },

  stopTimer: function stopTimer() {
    clearInterval(this.timeCounter);
  },
  // End trainer methods.

  setLang: function setLang(event) {
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

  setKeysQuantity: function setKeysQuantity() {
    var num = +select('#keysQuantity').value;
    if (typeof num === 'number' && num > 19 && num < 61) {
      this.keysQuantity = num;
    } else {
      alert('You can insert only numbers between 20 and 60 inclusive.');
    }
    return;
  },

  writeConsole: function writeConsole(text) {
    var pageConsole = select('#console');
    pageConsole.insertAdjacentHTML('beforeEnd', Date().substr(16, 8) + "  " + text + " <br>");
    pageConsole.scrollTop = pageConsole.scrollHeight - pageConsole.clientHeight;
  },

  getRandomNum: function getRandomNum(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  },

  getRandCharInAlph: function getRandCharInAlph() {
    var result = this.getFullAlph();
    return result.charAt(this.getRandomNum(0, result.length));
  },

  getFullAlph: function getFullAlph() {
    var langObj = this.layouts[this.currentLang];
    var result = '';
    for (var key in langObj) {
      if (langObj.hasOwnProperty(key)) {
        result += langObj[key];
      }
    }
    return result;
  },

  render: function render(where, what) {
    select(where).textContent = what;
  },

  makeHTMLString: function makeHTMLString(string) {
    var str = '';
    for (var i = 0; i < string.length; i++) {
      str += "<span>" + string[i] + "</span>";
    }
    return str;
  }
};

var bindKeysQuantity = typeTrainer.setKeysQuantity.bind(typeTrainer);
var bindrunTrainer = typeTrainer.runTrainer.bind(typeTrainer);
var bindLayout = typeTrainer.createLayout.bind(typeTrainer);
var bindsetLang = typeTrainer.setLang.bind(typeTrainer);
var bindLayoutLodash = typeTrainer.createLayoutLodash.bind(typeTrainer);
var bindStopTrainer = typeTrainer.stopTrainer.bind(typeTrainer);

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
  var keys = selectAll('button[data-note]');

  if (lang[typeTrainer.currentLang].indexOf(event.key) !== -1) {
    event.preventDefault();
    if (typeTrainer.currentKey !== false) {
      typeTrainer.checkSoundType(event, keys);
      typeTrainer.checkCharTrainer(event);
    }
  }

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = keys[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var key = _step.value;

      if (key.textContent === event.key || key.name === event.code) {
        key.classList.add('keyboard__btn--active');
        break;
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
}

function keyUpHandler() {
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = selectAll('button[data-note]')[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var key = _step2.value;

      if (key.classList.contains('keyboard__btn--active')) {
        key.classList.remove('keyboard__btn--active');
        break;
      }
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2.return) {
        _iterator2.return();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
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

typeTrainer.langs.forEach(function (element) {
  select('#chooseLanguage').insertAdjacentHTML('beforeEnd', "<option value=\"" + element + "\"> " + element + " </option>");
});

select('#keysQuantity').value = typeTrainer.keysQuantity;

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