const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { test } = require('node:test');
const vm = require('node:vm');

const html = readFileSync(require('node:path').join(__dirname, '../index.html'), 'utf8');

function loadApp() {
    const element = () => ({
        style: {},
        classList: { add() {}, remove() {}, contains() { return false; }, toggle() {} },
        getContext() { return null; }
    });
    const themes = ['light', 'dark', 'sepia', 'neon'].map(theme => ({
        ...element(),
        attributes: { 'data-theme': theme },
        getAttribute(name) { return this.attributes[name]; },
        setAttribute(name, value) { this.attributes[name] = value; },
        addEventListener(name, callback) { this[name] = callback; }
    }));
    const context = {
        document: {
            body: {},
            getElementById: element,
            querySelectorAll: selector => selector === '.theme-btn' ? themes : []
        },
        window: {}, console, setTimeout, performance
    };
    vm.createContext(context);
    vm.runInContext(html.match(/<script>([\s\S]*?)<\/script>/)[1] + '\nglobalThis.app = App;', context);
    return { app: context.app, themes, context };
}

test('rapid restarts start only the latest cycle', async () => {
    const { app } = loadApp();
    const pending = [];
    const started = [];
    app.sleep = (ms, id) => new Promise(resolve => pending.push(() => resolve(id === app.currentCycleId)));
    app.createDOM = () => {};
    app.startCycle = () => started.push(app.currentCycleId);
    const first = app.restart();
    const second = app.restart();
    pending.shift()();
    await first;
    pending.shift()();
    await second;
    assert.deepEqual(started, [2]);
});

for (const reason of ['backtrack limit', 'empty history']) {
    test(`canceled ${reason} does not restart a newer cycle`, async () => {
        const { app } = loadApp();
        app.difficulty = reason === 'backtrack limit' ? 'CHAOS' : 'CALM';
        app.cycleBacktrackCount = 20;
        let restarts = 0;
        app.sleep = async ms => ms !== 1500;
        app.restart = async () => { restarts++; };
        assert.equal(await app.backtrack(null, 0), false);
        assert.equal(restarts, 0);
    });
}

test('solver propagates canceled backtracking without reporting success', async () => {
    const { app } = loadApp();
    app.isAllFilled = () => false;
    app.findNextAction = () => ({ type: 'CONTRADICTION', cell: null });
    app.backtrack = async () => false;
    assert.equal(await app.phaseSolve(0), false);
});

test('theme controls are named native buttons and expose the selected theme', () => {
    const { app, themes, context } = loadApp();
    const markup = html.match(/<button[^>]*class="theme-btn[^>]*>/g);
    assert.equal(markup.length, 4);
    for (const button of markup) {
        assert.match(button, /type="button"/);
        assert.match(button, /aria-label="[^"]+"/);
        assert.match(button, /aria-pressed="(?:true|false)"/);
    }
    app.getSavedPreference = key => key.endsWith('theme') ? 'sepia' : null;
    app.applyTickRate = () => {};
    app.restorePreferences();
    assert.deepEqual(themes.map(button => button.attributes['aria-pressed']), ['false', 'false', 'true', 'false']);
    app.savePreference = () => {};
    app.setupThemeListeners();
    themes[1].click();
    assert.equal(context.document.body.className, 'theme-dark');
    assert.deepEqual(themes.map(button => button.attributes['aria-pressed']), ['false', 'true', 'false', 'false']);
});
