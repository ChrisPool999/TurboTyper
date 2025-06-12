function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array
}

class QuoteService {
  async getQuotes() {
    if (!this.quotes) {
      let data = await this.#loadQuotes();
      let quotes = data.quotes.map((o => o.quote));
      this.quotes = shuffle(quotes);
    }
    return this.quotes;
  }

  async #loadQuotes() {
    try {
      const res = await fetch('quotes.json');
      return await res.json();
    } catch (err) {
      console.error(err);
    }
  }

  reshuffle() {
    this.quotes = shuffle(this.quotes)
  }
}

class TimingService extends EventTarget {
  #startTime = null;
  #durationMs = null;
  #timerId = null;

  minutesTimertoMS

  start(durationMs = 60000) {
    this.#durationMs = durationMs;
    this.#startTime = performance.now();

    this.#timerId = setTimeout(() => {
      this.dispatchEvent(new Event("timeup"));
    }, durationMs);
  }

  getWPM(wordsTyped) {
    ;
  }
}

class Options {

  constructor(timeService) {
    this.timeService = timeService;
  }

  #changeDuration(btn) {
    document.querySelectorAll(".options__button--duration").forEach(durationBtn => {
      durationBtn.classList.remove("options__button--active");
    });
    btn.classList.toggle("options__button--active");

    document.querySelector(".options__time-left").innerHTML = btn.innerHTML;
  }

  addButtonListener() {

    document.querySelectorAll(".options__button").forEach(btn => {
      btn.addEventListener("click", () => {
        if (btn.classList.contains("options__button--duration")) {
          this.#changeDuration(btn);
        };

        if (btn.classList.contains("options__button--toggle")) {
          console.log(123);
          btn.classList.toggle("options__button--active");        
        }
      })      
    });
  }
}

class TypingArea {
  #quoteService = new QuoteService();
  #timingService = new TimingService();

  #promptEl = document.querySelector(".typing-area__prompt");
  #promptSize = 600;

  #inputLength = 0;
  #hasStarted = false;
  #scrollDistancePx = 0;

  async init() {
    await this.#addStartingQuotes();
    this.#addKeyBoardListener();
  }

  async #addStartingQuotes() {
    const quotes = await this.#quoteService.getQuotes();
    let text = quotes.join('');

    for (let i = 0; i < this.#promptSize && i < text.length; i++) {
      this.#promptEl.innerHTML += `<span>${text[i]}</span>`;
    }

    this.lettersEl = this.#promptEl.querySelectorAll('span');
    this.lettersHeight = this.#getCurrLetter().offsetTop;
    this.lettersEl[0].classList.toggle("typing-area__letter--active");
  }  

  #addKeyBoardListener() {
    this.#timingService.addEventListener("timeup", (event) => {
      console.log("time up");
    });    
    
    document.addEventListener('keydown', (event) => {
      if (event.key === "'") {
        event.preventDefault();
      }
      if (event.key === "Backspace" && this.#inputLength) {
        this.#deleteChar();
      } 
      if (event.key.length === 1) {
        this.#addChar(event.key);

        if (!this.#hasStarted) {
          this.#hasStarted = true;
          this.#timingService.start();
        }        
      }

      if (this.lettersHeight != this.#getCurrLetter().offsetTop) {
        this.#scrollTextArea();
      }
    });
  }

  #addChar(key) {
    this.lettersEl[this.#inputLength].classList.remove("typing-area__letter--active");

    const letterEl = this.lettersEl[this.#inputLength];
    const isCorrectLetter = (key === letterEl.innerHTML);
    letterEl.style.color = (isCorrectLetter ? "white" : "red");
    
    this.#inputLength++;    
    this.lettersEl[this.#inputLength].classList.toggle("typing-area__letter--active");
  }

  #deleteChar() {
    if (!this.#inputLength) {
      return;
    }
    this.lettersEl[this.#inputLength].classList.remove("typing-area__letter--active");    
    
    this.#inputLength--;
    this.lettersEl[this.#inputLength].style.color = 'gray';
    this.lettersEl[this.#inputLength].classList.toggle("typing-area__letter--active");    
  }

  #scrollTextArea() {
      let difference = (this.#getCurrLetter().offsetTop - this.lettersHeight);

      this.#scrollDistancePx -= difference;
      this.#promptEl.style.top = `${this.#scrollDistancePx}px`;
      this.lettersHeight = this.#getCurrLetter().offsetTop;
  }

  #getCurrLetter() {
    return this.lettersEl[this.#inputLength];
  }
}

let typingPrompt = new TypingArea();
typingPrompt.init();

let options = new Options();
options.addButtonListener();