let filename = '';

const dialogues = [];
let dialogue = [];
let errors = [];

let counter_q = 0;
let counter_a = 0;

const reader = new FileReader();


function processFile() {
  //get file object
  let files = document.getElementById('files').files;
  if (files[0]) {
    filename = document.getElementById('files').files[0].name.split(/(\\|\/)/g).pop()

    reader.onload = (event) => {
      const file = event.target.result;
      const allLines = file.split(/\r\n|\n/);
      // Reading line by line
      allLines.forEach((line, i) => {
        // Empty line
        if (line.trim() === '') { return; }

        // Dialogue separator
        if (line.trim() === '---') {
          dialogues.push(dialogue);
          dialogue = [];

          // Question
        } else if (line.trim().startsWith('Q:')) {
          dialogue.push({ part: line.trim().slice('2').trim(), type: 'question' })
          counter_q++;

          // Answer
        } else if (line.trim().startsWith('A:')) {
          dialogue.push({ part: line.trim().slice('2').trim(), type: 'answer' })
          counter_a++;

          // Other - error/undefined
        } else {
          errors.push({ part: line, line: i+1 });
        }
      });

      // Inserting last dialogue
      if (dialogue) { dialogues.push(dialogue); }

      // Removing prompt for file
      const file_prompt = document.getElementById("file-prompt");
      file_prompt.parentNode.removeChild(file_prompt);

      // Rendering complete info about file
      renderInfo();
    };

    reader.onerror = (event) => {
      alert(event.target.error.name);
    };

    reader.readAsText(files[0]);
  }
};

function renderInfo() {
  let error_display = '';
  if (errors.length) {
    errors.forEach(function(error) {
      error_display += `<li>Řádek ${error.line}: ${error.part}</li>`;
    });

    error_display = `
      <div class="processing-status processing-error">
        <p>Soubor obsahuje chyby na následujících řádcích:</p>
        <ul>${error_display}</ul>
      </div>
    `;
  } else {
    error_display = `
      <div class="processing-status processing-success">
        <p>Soubor neobsahuje chybné řádky.</p>
      </div>
    `;
  }

  document.getElementById('dialogue').innerHTML = `
      <p>Soubor byl načten</p>
      <table>
        <tr>
          <td>Počet otázek</td>
          <td>${counter_q}</td>
        </tr>
        <tr>
          <td>Počet odpovědí</td>
          <td>${counter_a}</td>
        </tr>
        <tr>
          <td><b>Celkem</b></td>
          <td><b>${counter_q + counter_a}</b></td>
        </tr>
      </table>
      ${error_display}
    `;

    document.getElementById('control').innerHTML = `
      <div class="placeholder"></div>
      <p>${filename}</p>
      ${dialogues.length ? '<button class="next" onclick="renderDialogue(1)"><i class="material-icons">chevron_right</i></button>' : '<div class="placeholder"></div>'}
    `;
  window.onkeydown = function (e) {
    if (e.keyCode === 39 || e.keyCode === 32 || e.keyCode === 13) {
      renderDialogue(1);
    }
  }
};

function renderDialogue(id) {
  let dial = dialogues[id - 1];
  let transcript = '';

  dialogues[id - 1].forEach(function (sentence) {
    transcript += `<p class="sentence sentence-${sentence.type}"><span>${sentence.part}</span></p>`;
  })

  document.getElementById('dialogue').innerHTML = `
    <p>Dialog č. ${id} z ${dialogues.length}</p>
    ${transcript}
  `;

  document.getElementById('control').innerHTML = `
  <button class="prev" onclick="${id<=1 ? 'renderInfo()' : 'renderDialogue(' + (id - 1) + ')'}"><i class="material-icons">chevron_left</i></button>
  <p>${filename}</p>
  ${id < dialogues.length ? '<button class="next" onclick="renderDialogue(' + (id + 1) + ')"><i class="material-icons">chevron_right</i></button>' : '<div class="placeholder"></div>'}
  `;


  window.onkeydown = function (e) {
    if (id < dialogues.length) {
      if (e.keyCode === 39 || e.keyCode === 32 || e.keyCode === 13) {
        renderDialogue(id + 1);
      }
    }

    if (e.keyCode === 37 || e.keyCode === 8) {
      id <= 1 ? renderInfo() : renderDialogue(id - 1);
    }
  }
}