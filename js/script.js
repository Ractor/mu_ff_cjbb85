'use strict';

import {KarelParser} from "./karelparser.js";

let filename = '';

const reader = new FileReader();
let parser = new KarelParser();


function processFile() {
  //get file object
  let files = document.getElementById('files').files;
  if (files[0]) {
    filename = document.getElementById('files').files[0].name.split(/(\\|\/)/g).pop()

    reader.onload = (event) => {
      const file = event.target.result;
      
      parser.parse(file);

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
  if (parser.errors.length) {
    parser.errors.forEach(function(error) {
      error_display += `<li>Řádek ${error.line}: ${error.part}</li>`;
    });

    error_display = `
      <div class="processing-status processing-error">
        <p>Automatický analyzátor objevil následující chybné řádky:</p>
        <ul>${error_display}</ul>
      </div>
    `;
  } else {
    error_display = `
      <div class="processing-status processing-success">
        <p>Automatický analyzátor neobjevil chybné řádky.</p>
      </div>
    `;
  }

  document.getElementById('dialogue').innerHTML = `
      <p>Soubor byl načten</p>
      <table>
        <tr>
          <td>Počet otázek</td>
          <td>${parser.counter_q}</td>
        </tr>
        <tr>
          <td>Počet odpovědí</td>
          <td>${parser.counter_a}</td>
        </tr>
        <tr>
          <td><b>Celkem</b></td>
          <td><b>${parser.counter_q + parser.counter_a}</b></td>
        </tr>
      </table>
      ${error_display}
    `;

    document.getElementById('control').innerHTML = `
      <div class="placeholder"></div>
      <p>${filename}</p>
      ${parser.dialogues.length ? '<button class="next" onclick="renderDialogue(1)"><i class="material-icons">chevron_right</i></button>' : '<div class="placeholder"></div>'}
    `;
  window.onkeydown = function (e) {
    if (e.keyCode === 39 || e.keyCode === 32 || e.keyCode === 13) {
      renderDialogue(1);
    }
  }
};

function renderDialogue(id) {
  let transcript = '';

  parser.dialogues[id - 1].forEach(function (sentence) {
    transcript += `<p class="sentence sentence-${sentence.type}"><span>${sentence.part}</span></p>`;
  })

  document.getElementById('dialogue').innerHTML = `
    <p>Dialog č. ${id} z ${parser.dialogues.length}</p>
    ${transcript}
  `;

  document.getElementById('control').innerHTML = `
  <button class="prev" onclick="${id<=1 ? 'renderInfo()' : 'renderDialogue(' + (id - 1) + ')'}"><i class="material-icons">chevron_left</i></button>
  <p>${filename}</p>
  ${id < parser.dialogues.length ? '<button class="next" onclick="renderDialogue(' + (id + 1) + ')"><i class="material-icons">chevron_right</i></button>' : '<div class="placeholder"></div>'}
  `;


  window.onkeydown = function (e) {
    if (id < parser.dialogues.length) {
      if (e.keyCode === 39 || e.keyCode === 32 || e.keyCode === 13) {
        renderDialogue(id + 1);
      }
    }

    if (e.keyCode === 37 || e.keyCode === 8) {
      id <= 1 ? renderInfo() : renderDialogue(id - 1);
    }
  }
}

window.processFile    = processFile;
window.renderInfo     = renderInfo;
window.renderDialogue = renderDialogue;