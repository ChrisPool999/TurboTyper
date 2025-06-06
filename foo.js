async function loadQuotes() {
  try {
    const res = await fetch('quotes.json');
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(err);
  }
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array
}

function addStartingQuotes(data) {
  quotes = data.quotes.map((o => o.quote));
  quotes = shuffle(quotes);

  promptElement = document.querySelector("#word-box-prompt");

  text = quotes.join('');
  for (let i = 0; i < 600; i++) {
    promptElement.innerHTML += `<span>${text[i]}</span>`
  }
}

loadQuotes().then(data => {
  addStartingQuotes(data)

  promptElement = document.querySelector("#word-box-prompt");
  letters = promptElement.querySelectorAll('span')

  input = "";
  i = 0;
  document.addEventListener('keydown', (event) => {
    if (event.key === "Backspace" && input.length) {
      i = Math.max(0, i - 1);
      input = input.slice(0, -1);
      letters[i].style.color = 'gray';
    } 
    if (event.key.length === 1) {
        if (event.key === "'") {
          event.preventDefault();
        }

        input += event.key;
        if (input[i] !== letters[i].innerHTML) {
          letters[i].style.color = 'red';
        } else {
          letters[i].style.color = 'white';
        }
        i += 1;
    }
  })
});

