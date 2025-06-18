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
  #startTime;
  #durationMs;
  #timerId;

  start(durationMs = 60000, callback) {
    if (this.#timerId) return;

    this.#durationMs = durationMs;
    this.#startTime = performance.now();

    this.#timerId = setTimeout(() => {
      console.log(123);
      this.dispatchEvent(new Event("timeup"));
    }, durationMs);
  }

  MsToMinSec(ms) {

  }

  calcWPM(wordsTyped) {
    ;
  }
}

class Options {
  #buttonListener;

  mountButtonListener() {
    this.#buttonListener = document.querySelectorAll(".options__button").forEach(btn => {
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

  #changeDuration(btn) {
    document.querySelectorAll(".options__button--duration").forEach(durationBtn => {
      durationBtn.classList.remove("options__button--active");
    });
    btn.classList.toggle("options__button--active");

    document.querySelector(".options__time-left").innerHTML = btn.innerHTML;
  }

  #verifyTimerFormat() {

  }

  #updateTimer() {

  }

  #reset() {

  }
}

class TypingService {
  renderer;
  timingService;
  hasStarted = false;

  constructor(renderer, timingService) {
    this.renderer = renderer;
    this.timingService = timingService;
    this.#bindHandlers();
  }

  enable() {
    this.timingService.addEventListener("timeup", this.boundDisable);    
    document.addEventListener('keydown', this.boundInputHandler);
  }

  disable() {
    this.timingService.removeEventListener('timeup', this.boundDisable);
    document.removeEventListener('keydown', this.boundInputHandler);
  }

  inputHandler(event) {
    if (event.key === "'") event.preventDefault();
    if (event.key === "Backspace") this.renderer.deleteLetter();
    
    if (event.key.length !== 1) return;
    this.renderer.addLetter(event.key);

    if (!this.hasStarted) {
      this.hasStarted = true;
      this.timingService.start(3000);
    }        
  }

  #bindHandlers() {
    this.boundDisable = this.disable.bind(this);
    this.boundInputHandler = this.inputHandler.bind(this);
  }
}

class TypingRenderer {
  #textContainer = document.querySelector(".typing-area__prompt");
  #scrollDistancePx = 0;
  #inputLength = 0;
  #textSize = 600;
  #initialText;

  constructor(initialText) {
    this.#initialText = initialText
  }

  mount() {
    this.#addInitialText();
  }

  getInputLength() {
    return this.#inputLength;
  }

  #getCurrLetterEl() {
    return this.textEl[this.#inputLength];
  }

  #addInitialText() {
    let text = this.#initialText;
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
    if (!this.#inputLength) return;
    
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

(async () => {
  let timer = new TimingService()

  let quotes = new QuoteService();
  let initialText = await quotes.getQuotes();

  let typingUI = new TypingRenderer(initialText.join(''));
  typingUI.mount();

  let inputListener = new TypingService(typingUI, timer);
  inputListener.enable();

  let options = new Options(timer);
  options.mountButtonListener();
})();