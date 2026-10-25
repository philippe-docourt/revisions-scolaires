(function () {
  'use strict';
  const app = window.MissionBinaire;
  const key = 'mission-binaire:v1';
  const blankRecord = () => ({ answers: {}, attempts: 0, hints: 0, solutionViewed: false, solved: false });
  const empty = () => ({ version: 1, current: 0, positions: { 1: 0, 2: 6, 3: 12 }, records: Object.fromEntries(app.data.map(ex => [ex.id, blankRecord()])) });
  const count = value => Number.isSafeInteger(value) && value >= 0 ? value : 0;
  function sanitize(raw) {
    const state = empty();
    if (!raw || raw.version !== 1 || typeof raw.records !== 'object' || raw.records === null) return state;
    if (Number.isInteger(raw.current) && raw.current >= 0 && raw.current < app.data.length) state.current = raw.current;
    state.positions[app.data[state.current].series] = state.current;
    app.series.forEach(series => {
      const position = raw.positions && raw.positions[series.number];
      if (Number.isInteger(position) && app.data[position] && app.data[position].series === series.number) state.positions[series.number] = position;
    });
    app.data.forEach(ex => {
      const saved = raw.records[ex.id];
      if (!saved || typeof saved !== 'object') return;
      const record = state.records[ex.id];
      record.attempts = count(saved.attempts);
      record.hints = Math.min(ex.hints.length, count(saved.hints));
      record.solutionViewed = saved.solutionViewed === true;
      ex.fields.forEach(field => {
        const answer = saved.answers && saved.answers[field.id];
        if ((field.type === 'pixels' || field.type === 'doors') && Array.isArray(answer) && answer.length === 8) {
          record.answers[field.id] = Array.from(answer, value => value === 0 || value === 1 ? value : null);
        } else if (typeof answer === 'string') record.answers[field.id] = answer;
      });
      record.solved = saved.solved === true && record.attempts > 0 && app.exercises.check(ex, record.answers).correct;
    });
    return state;
  }
  function createStore(storage, onUnavailable = () => {}) {
    let memory = empty();
    let persistent = true;
    function unavailable() { if (persistent) { persistent = false; onUnavailable(); } }
    return {
      load() {
        try {
          const raw = storage.getItem(key);
          if (raw !== null) {
            try { memory = sanitize(JSON.parse(raw)); } catch { memory = empty(); }
          }
        } catch { unavailable(); }
        return memory;
      },
      save(state) {
        memory = state;
        if (persistent) { try { storage.setItem(key, JSON.stringify(state)); } catch { unavailable(); } }
      },
      reset() { memory = empty(); this.save(memory); return memory; },
      get persistent() { return persistent; }
    };
  }
  app.storage = { key, empty, sanitize, createStore };
}());
