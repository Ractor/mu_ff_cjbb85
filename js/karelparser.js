'use strict';

export class KarelParser {
  parse(text) {
    this._dialogues = [];
    this._errors = [];

    this.counter_q = 0;
    this.counter_a = 0;

    let dialogue = [];
    let mode = null;

    // Reading line by line
    text.split(/\r\n|\n/).forEach((line, i) => {
      // Empty line
      if (line.trim() === '') { return; }

      // Dialogue separator
      if (line.trim() === '---') {
        this._dialogues.push(dialogue);
        dialogue = [];
        mode = null;
        return; // <-- continue
      }

      if (line.trim() === 'Q:') {
        mode = 'Q';
        return; // <-- continue
      }
      
      if (line.trim() === 'A:') {
        mode = 'A';
        return; // <-- continue
      }

      if (!/[a-zA-Z0-9]+/.test(line)) {
        this._errors.push({ part: line, line: i+1 });
      
      // Question
      } else if (line.trim().startsWith('Q:')) {
        dialogue.push({ part: line.trim().slice('2').trim(), type: 'question' })
        this.counter_q++;

      // Answer
      } else if (line.trim().startsWith('A:')) {
        dialogue.push({ part: line.trim().slice('2').trim(), type: 'answer' })
        this.counter_a++;

      } else if (mode === 'Q') {
        dialogue.push({ part: line.trim(), type: 'question' })
        this.counter_q++;

      } else if (mode === 'A') {
        dialogue.push({ part: line.trim(), type: 'answer' })
        this.counter_a++;
      // Other - error/undefined
      } else {
        this._errors.push({ part: line, line: i+1 });
      }
    });

    // Inserting last dialogue
    if (dialogue.length) { this._dialogues.push(dialogue); }
  }

  get errors() {
    return this._errors;
  }

  get dialogues() {
    return this._dialogues;
  }

  get question_count() {
    return this.counter_q;
  }

  get answer_count() {
    return this.counter_a;
  }

}