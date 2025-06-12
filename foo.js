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
  #timeService;

  constructor(timeService) {
    this.#timeService = timeService;
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
          btn.classList.toggle("options__button--active");        
        }
      })      
    });
  }
}

class TypingService {
  #timingService = new TimingService();
  #renderer;
  #hasStarted = false;

  constructor(renderer) {
    this.#renderer = renderer;
    this.addKeyBoardListener();
  }

  addKeyBoardListener() {
    this.#timingService.addEventListener("timeup", (event) => {
      console.log("time up");
    });    
    
    document.addEventListener('keydown', (event) => {
      if (event.key === "'") event.preventDefault();
      
      if (event.key === "Backspace") {
        this.#renderer.deleteLetter();
      } 
      
      if (event.key.length !== 1) return;

      this.#renderer.addLetter(event.key);

      if (!this.#hasStarted) {
        this.#hasStarted = true;
        this.#timingService.start();
      }        
    });
  }
}

class TypingRenderer {
  #quoteService = new QuoteService();
  #textContainer = document.querySelector(".typing-area__prompt");
  #scrollDistancePx = 0;
  #inputLength = 0;
  #textSize = 600;

  constructor() {
    this.#addInitialText();
  }

  getInputLength() {
    return this.#inputLength;
  }

  #getCurrLetterEl() {
    return this.textEl[this.#inputLength];
  }

  async #addInitialText() {
    const quotes = await this.#quoteService.getQuotes();
    let text = quotes.join('');

    for (let i = 0; i < this.#textSize && i < text.length; i++) {
      this.#textContainer.innerHTML += `<span>${text[i]}</span>`;
    }

    this.textEl = this.#textContainer.querySelectorAll('span');
    this.textOffset = this.#getCurrLetterEl().offsetTop;
    this.textEl[0].classList.toggle("typing-area__letter--active");
  }  

  addLetter(key) {
    this.#inputLength++;    
    this.#styleTypedLetter(key);
    this.scrollIfNeeded();
  }

  #styleTypedLetter(key) {
    let prev = this.textEl[this.#inputLength - 1];
    prev.classList.remove("typing-area__letter--active");    

    const isCorrectLetter = (key === prev.innerHTML);
    prev.style.color = (isCorrectLetter ? "white" : "red");
    this.#getCurrLetterEl().classList.toggle("typing-area__letter--active");
  }

  deleteLetter() {
    if (!this.#inputLength) {
      return;
    }
    
    this.#getCurrLetterEl().classList.remove("typing-area__letter--active");    
    this.#inputLength--;
    this.#getCurrLetterEl().style.color = 'gray';
    this.#getCurrLetterEl().classList.toggle("typing-area__letter--active");    
    this.scrollIfNeeded();
  }

  scrollIfNeeded() {
    if (this.textOffset != this.#getCurrLetterEl().offsetTop) {
      this.#scrollTextArea();
    }
  }

  #scrollTextArea() {
      let difference = (this.#getCurrLetterEl().offsetTop - this.textOffset);

      this.#scrollDistancePx -= difference;
      this.#textContainer.style.top = `${this.#scrollDistancePx}px`;
      this.textOffset = this.#getCurrLetterEl().offsetTop;
  }
}

let renderer = new TypingRenderer();
let typingService = new TypingService(renderer);

let options = new Options();
options.addButtonListener();