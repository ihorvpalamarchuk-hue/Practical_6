const STATES = ['loading', 'content', 'empty', 'error'];
const HUES = ['moss', 'ember', 'plum', 'gold'];
const SEED = [
  { name: 'Еліксир безсоння', effect: 'Дедлайн о 8:00 більше не лякає.', hue: 'plum' },
  { name: 'Відвар «Здам з першого разу»', effect: 'Пити за п’ять хвилин до захисту практичної.', hue: 'gold' },
  { name: 'Настоянка тиші', effect: 'Сусід із перфоратором засинає на тиждень.', hue: 'moss' },
  { name: 'Зілля «У мене працює»', effect: 'Діє, поки викладач не відкрив консоль.', hue: 'ember' },
  { name: 'Бальзам кешу', effect: 'Ctrl+Shift+R без втрати нервів.', hue: 'moss' }
];

let shelf = [...SEED];
let query = '';
let timer = null;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

function isValidState(state) {
  return STATES.includes(state);
}

function validateInput(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function filterPotions(list, text) {
  const needle = text.trim().toLowerCase();
  return list.filter((potion) => potion.name.toLowerCase().includes(needle));
}

function renderState(name) {
  if (!isValidState(name)) return;
  $$('[data-state]').forEach((block) => block.classList.toggle('is-hidden', block.dataset.state !== name));
  $$('[data-show]').forEach((button) => button.setAttribute('aria-pressed', button.dataset.show === name));
}

function make(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function potionCard(potion) {
  const card = make('li', `potion potion--${potion.hue}`);
  const drink = make('button', 'btn btn--ghost', 'Випити');
  drink.type = 'button';
  drink.setAttribute('aria-label', `Випити: ${potion.name}`);
  drink.addEventListener('click', () => {
    shelf = shelf.filter((item) => item !== potion);
    renderShelf();
  });
  card.append(make('h2', '', potion.name), make('p', '', potion.effect), drink);
  return card;
}

function renderShelf() {
  const visible = filterPotions(shelf, query);
  $('#shelf').replaceChildren(...visible.map(potionCard));
  $('#empty-text').textContent = query.trim()
    ? `За запитом «${query.trim()}» нічого не знайшлось.`
    : 'Усе зілля випито. Алхімік у шоці.';
  renderState(visible.length ? 'content' : 'empty');
}

function brew() {
  clearTimeout(timer);
  renderState('loading');
  timer = setTimeout(renderShelf, 1800);
}

function restock() {
  shelf = [...SEED];
  query = '';
  $('#search').value = '';
  renderShelf();
}

$('#brew-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const input = $('#potion-name');
  const ok = validateInput(input.value);
  input.setAttribute('aria-invalid', !ok);
  $('#potion-error').classList.toggle('is-hidden', ok);
  if (!ok) return input.focus();
  shelf.unshift({
    name: input.value.trim(),
    effect: 'Щойно з котла. Побічні ефекти невідомі.',
    hue: HUES[shelf.length % HUES.length]
  });
  input.value = '';
  query = '';
  $('#search').value = '';
  renderShelf();
});

$('#search').addEventListener('input', (event) => {
  query = event.target.value;
  renderShelf();
});

$('#refresh').addEventListener('click', brew);
$('#retry').addEventListener('click', brew);
$('#restock').addEventListener('click', restock);

$$('[data-show]').forEach((button) => button.addEventListener('click', () => {
  clearTimeout(timer);
  renderState(button.dataset.show);
}));

$$('[data-view]').forEach((tab) => tab.addEventListener('click', () => {
  $$('[data-view]').forEach((other) => other.setAttribute('aria-pressed', other === tab));
  $$('[data-panel]').forEach((panel) => panel.classList.toggle('is-hidden', panel.dataset.panel !== tab.dataset.view));
}));

$('#theme').addEventListener('click', (event) => {
  const dark = document.documentElement.dataset.theme !== 'dark';
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  event.currentTarget.setAttribute('aria-pressed', dark);
  event.currentTarget.textContent = dark ? 'День' : 'Ніч';
});

brew();
