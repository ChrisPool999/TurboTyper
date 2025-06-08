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

class TypingPrompt {
  #quoteService = new QuoteService();
  #timingService = new TimingService();

  #promptEl = document.querySelector("#typing-box__prompt");
  #promptSize = 600;

  #inputLength = 0;
  #hasStarted = false;

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
  }  

  #addKeyBoardListener() {
    document.addEventListener('keydown', (event) => {
      if (event.key === "'") {
        event.preventDefault();
      }
      if (event.key === "Backspace" && this.#inputLength) {
        this.#deleteChar();
      } 
      if (event.key.length !== 1) {
        return;
      }
        
      this.#addChar(event.key);

      if (!this.#hasStarted) {
        this.#hasStarted = true;
        this.#timingService.start(6000);
      }
    });

    this.#timingService.addEventListener("timeup", (event) => {
      console.log("time up");
    });
  }

  #addChar(key) {
    const letterEl =  this.lettersEl[this.#inputLength];
    const isCorrectLetter = (key === letterEl.innerHTML);

    letterEl.style.color = (isCorrectLetter ? "white" : "red");
    this.#inputLength += 1;    
  }

  #deleteChar() {
    if (this.#inputLength > 0) this.#inputLength--;
    this.lettersEl[this.#inputLength].style.color = 'gray';    
  }
}

let typingPrompt = new TypingPrompt();
typingPrompt.init();