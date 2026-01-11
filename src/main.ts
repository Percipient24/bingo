import './style.css'

const me = Date.now();

const app: HTMLDivElement = document.getElementById('app')!;
const controls: HTMLDivElement = document.getElementById('controls');
const fsButton: HTMLButtonElement = document.getElementById("fs")!
const resetButton: HTMLButtonElement = document.getElementById("reset")!

const channel = new BroadcastChannel('bingo');

const chart = document.createElement('div');
chart.classList.add('chart');
app.appendChild(chart);



const letters = ['B', 'I', 'N', 'G', 'O'];

const cells: HTMLDivElement[] = [];

const selected: string[] = [];

letters.forEach((letter, index) => {
  const letterDiv = document.createElement('div');
  letterDiv.classList.add('letter');
  letterDiv.textContent = letter;
  chart.appendChild(letterDiv);
  for (let i = 1; i <= 15; i++) {
    const cell = document.createElement('div');
    const number = i + (index * 15);
    cell.classList.add('cell');
    cell.textContent = `${number}`;
    chart.appendChild(cell);
    cell.dataset.number = `${number}`;

    const marker = document.createElement('div');
    marker.classList.add('marker');
    cell.appendChild(marker);

    cell.addEventListener('click', () => {
      toggleClicked(cell);
    });

    cells.push(cell);
  }
})

const clearLatest = () => {
  cells.forEach(cell => cell.classList.remove('latest'));
}

const reset = () => {
  selected.length = 0;
  cells.forEach(cell => cell.classList.remove('picked', 'latest'));
}

const send = (numbers:string[]) => {
  localStorage.setItem('numbers', JSON.stringify(numbers));
  channel.postMessage({type: 'update', data: me});
}

const receive = (event: MessageEvent | null) => {
if (event === null || event.data !== me) {
    const numbers: string[] = JSON.parse(localStorage.getItem('numbers') || '[]');
    reset();
    selected.push(...numbers);
    numbers.forEach((n:string) => {
      cells[parseInt(n,10) - 1].classList.add('picked');
    });
    if (numbers.length > 0) {
      const last = numbers[numbers.length - 1];
      cells[parseInt(last,10) - 1].classList.add('latest');
    }
  }
}

receive(null);

const toggleClicked = (cell: HTMLDivElement) => {
  const number = cell.dataset.number!;
  if (selected.includes(number)) {
    selected.splice(selected.indexOf(number), 1);
    cell.classList.remove('picked');
  } else {
    selected.push(number);
    cell.classList.add('picked');
  }
  clearLatest();
  if (selected.length > 0) {
      const last = selected[selected.length - 1];
      cells[parseInt(last,10) - 1].classList.add('latest');
    }
}

function toggleFullscreen() {
    const doc = document.documentElement;
    if (doc.requestFullscreen) {
        doc.requestFullscreen()
            .catch(err => console.error("Error attempting to enable fullscreen:", err));
    }
    controls.style.display = 'none';
}

// Call this function on a user action, like a button click
fsButton.addEventListener("click", toggleFullscreen);
resetButton.addEventListener("click", () => {
  reset();
  send([]);
});

document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
      controls.style.display = 'block';
    }
});

document.addEventListener('keypress', (ev: KeyboardEvent) => {
  if (ev.key === ' ') {
    send(selected)
  }
})

channel.onmessage = (event) => {
  receive(event);
}