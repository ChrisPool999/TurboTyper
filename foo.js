function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array
}

class TypingPrompt {
  #promptInitLength = 600;
  #promptEl = document.querySelector("#word-box-prompt");
  #input = "";
  #promptIndex = 0;

  async init() {
    await this.#addStartingQuotes()
    this.#addKeyBoardListener()
  }

  // add logic just in case prompthLength > text
  async #addStartingQuotes() {
    const quotes = await this.#getQuotes();
    let text = quotes.join('');

    for (let i = 0; i < this.#promptInitLength; i++) {
      this.#promptEl.innerHTML += `<span>${text[i]}</span>`
    }

    this.lettersEl =  this.#promptEl.querySelectorAll('span')
  }  

  #addKeyBoardListener() {
    document.addEventListener('keydown', (event) => {
      if (event.key === "Backspace" && this.#input.length) {
        this.#deleteChar()
      } 
      if (event.key.length === 1) {
          this.#addChar(event)
      }
    })
  }

  async #getQuotes() {
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
      const data = await res.json();
      return data;
    } catch (err) {
      console.error(err);
    }
  }

  #addChar(event) {
    if (event.key === "'") {
      event.preventDefault();
    }

    this.#input += event.key;
    if (this.#input[this.#promptIndex] !== this.lettersEl[this.#promptIndex].innerHTML) {
      this.lettersEl[this.#promptIndex].style.color = 'red';
    } else {
      this.lettersEl[this.#promptIndex].style.color = 'white';
    }
    this.#promptIndex += 1;    
  }

  #deleteChar() {
    this.#promptIndex = Math.max(0, this.#promptIndex - 1);
    this.#input = this.#input.slice(0, -1);
    this.lettersEl[this.#promptIndex].style.color = 'gray';    
  }
}

let typingPrompt = new TypingPrompt();
typingPrompt.init()