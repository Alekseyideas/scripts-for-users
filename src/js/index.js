document.addEventListener('DOMContentLoaded', domLoaded);
const SCR_TYPE_ID = 'srcType';
const PRODUCT_TYPE_ID = 'productType';
const URI_JSON = './json/data.json';
const URI_SINGLE_JSON = './json/single.json';
const MENU_ID = 'navMenu';
const LIST_CLASS = 'list-group';

async function domLoaded() {
  // const data = await getJson('./test.json');

  const data = await getJson(URI_JSON);
  if (!data) return console.log('Json data does not exist', data);
  if (!data.scriptType) return console.warn('scriptType does not exist');
  if (!data.scriptType[0]) return console.warn('Array is empty scriptType ', data.scriptType);
  if (!data.items) return console.warn('Data does not have field  items ', data);
  if (!data.category) return console.warn('category does not exist ', data.scriptType);
  if (!data.category[0]) return console.warn('Array is empty category ', data.scriptType);
  if (!data.productsType[0]) return console.warn('Array is empty scriptType ', data.scriptType);
  if (!Array.isArray(data.items))
    return console.warn('Items in data is not an array ', data.items, typeof data.items);

  const NavMenu = new Menu(MENU_ID);
  NavMenu.newCats = data.category;
  NavMenu.newItems = data.items;
  NavMenu.renderCats();
  const menuItems = NavMenu.menu.querySelectorAll('.nav-item');

  menuItems &&
    menuItems[0] &&
    menuItems.forEach((itm) => {
      itm.addEventListener('mouseenter', function () {
        const list = this.querySelector('.' + LIST_CLASS);
        if (!list) return null;
        setTimeout(() => {
          list.scrollTo(0, 0);
        }, 100);
      });
    });

  const ScriptType = new Select(SCR_TYPE_ID);
  ScriptType.newOptions = data.scriptType;
  ScriptType.newItems = data.items || [];
  ScriptType.menu = NavMenu;
  ScriptType.newCats = data.category || [];
  ScriptType.renderSelectOptions();

  const ProductsType = new Select(PRODUCT_TYPE_ID);
  ProductsType.newOptions = data.productsType;
  ProductsType.menu = NavMenu;
  ProductsType.newItems = data.items || [];
  ProductsType.newCats = data.category || [];
  ProductsType.renderSelectOptions();

  const Body = new HtmlBody();

  window.addEventListener('click', async (e) => {
    if (!e.target) return null;
    if (!e.target.classList.contains('list-group-item-action')) return null;

    const { id } = e.target;

    e.target.parentNode.style.display = 'none';

    setTimeout(() => {
      e.target.parentNode.style = '';
    }, 100);

    console.log(id, 'id');

    const data = await getJson(URI_SINGLE_JSON);

    if (!data) console.error('Data returned null', data);
    if (!data.dateUpdate) console.error('Data does not have dateUpdate field', data);
    if (!data.name) console.error('Data does not have name field', data);
    if (!data.id) console.error('Data does not have id field', data);
    if (!data.blocks) console.error('Data does not have blocks field', data);
    if (!Array.isArray(data.blocks)) console.error('Blocks are not an array', data);

    Body.clean();
    Body.renderHeader(data.name, data.dateUpdate);
    Body.renderBody(data.blocks);
  });
}

async function getJson(uri) {
  let data = null;
  try {
    data = await fetch(uri);
    return data.json();
  } catch (error) {
    console.log(error, 'error');
    return null;
  }
}

class Select {
  constructor(id) {
    this.id = id;
    this.select = document.getElementById(id);
    this.options = [];
    this.items = [];
    this.cats = [];
    this.NavMenu = [];
  }

  set newItems(items = []) {
    this.items = items;
  }

  set newCats(cats = []) {
    this.cats = cats;
  }
  set menu(NavMenu = []) {
    this.NavMenu = NavMenu;
  }
  set newOptions(options = []) {
    this.options = options;
  }

  renderSelectOptions() {
    if (!this.select) return console.error('Select with this ID does not exist');
    if (!this.options) return console.log('Options is null in Select');
    if (!this.options[0]) return console.log('Select does not have options');
    this.options.forEach((opt) => {
      const option = document.createElement('option');
      if (!opt.id) return console.warn('Option does not have an id', opt);
      if (!opt.name) return console.warn('Option does not have name', opt);
      option.value = opt.id;
      option.text = opt.name;
      this.select.appendChild(option);
    });

    this.onChangeHandler();
  }

  onChangeHandler() {
    if (!this.select) return console.error('Select with this ID does not exist');

    this.select.addEventListener('change', changeHandler.bind(this));

    function changeHandler() {
      const scrSelect = document.getElementById(SCR_TYPE_ID);
      const productSelect = document.getElementById(PRODUCT_TYPE_ID);
      if (!scrSelect) return console.error(SCR_TYPE_ID + ' Does not exist');
      if (!productSelect) return console.error(PRODUCT_TYPE_ID + ' Does not exist');
      if (!this.items[0]) return console.error('No items');
      if (!this.items[0].productTypeId) return console.error('Item does not have productTypeId');
      if (!this.items[0].scriptTypeId) return console.error('Item does not have scriptTypeId');

      const scriptId = scrSelect.value;
      const productId = productSelect.value;

      const newItems = this.items.filter((el) => {
        if (scriptId && productId) {
          return `${el.productTypeId}` === `${productId}` && `${el.scriptTypeId}` === `${scriptId}`;
        }
        if (scriptId && !productId) {
          return `${el.scriptTypeId}` === `${scriptId}`;
        }
        if (!scriptId && productId) {
          return `${el.productTypeId}` === `${productId}`;
        }
        return false;
      });

      this.NavMenu.clean();
      this.NavMenu.newCats = this.cats;
      this.NavMenu.newItems = newItems;
      this.NavMenu.renderCats();
    }
  }
}

class Menu {
  constructor(id) {
    this.menu = document.getElementById(id);
    this.cats = [];
    this.items = [];
  }

  set newCats(cats = []) {
    this.cats = cats;
  }

  set newItems(items = []) {
    this.items = items;
  }

  clean() {
    this.menu.innerHTML = '';
  }

  renderCats() {
    if (!this.menu) return console.error('Menu does not exist');

    if (!this.cats) return console.log('Cats does not exist');

    if (!this.cats[0]) return console.log('Cats is empty');

    this.cats.forEach((cat) => {
      if (!cat.name) return console.log('Cat does not have name field');
      const li = document.createElement('li');
      li.className = 'nav-item';
      const span = document.createElement('span');
      span.className = 'nav-link active';

      span.textContent = cat.name;
      this.menu.appendChild(li);
      li.appendChild(span);

      if (!this.items) return console.warn('Items in category is null');
      if (!this.items[0]) return console.log('Category does not have items');
      const items = this.items.filter((el) => `${el.categoryId}` === `${cat.id}`);
      if (!items) return null;
      if (!items[0]) return null;
      const list = document.createElement('div');
      list.className = LIST_CLASS;

      items.forEach((element) => {
        if (!element.id) return console.error('Element does not have field id', element);
        if (!element.name) return console.warn('Element does not have field name', element);
        const listSpan = document.createElement('span');
        listSpan.className = 'list-group-item list-group-item-action';
        listSpan.id = element.id;
        listSpan.textContent = element.name;
        list.appendChild(listSpan);
      });

      li.appendChild(list);
    });
  }
}

class HtmlBody {
  constructor() {
    this.headerWrapper = document.getElementById('scriptNameDate');
    this.content = document.getElementById('content');
    this.aside = document.getElementById('aside').querySelector('ul');
  }

  clean() {
    this.headerWrapper.innerHTML = null;
    this.content.innerHTML = null;
    this.aside.innerHTML = null;
  }

  renderHeader(title, date) {
    if (!title) return console.error('Title is required');
    if (!date) return console.error('Update date is required');
    this.headerWrapper.closest('section').style.background = '#73a7cc';
    this.headerWrapper.innerHTML = `
      <div class="row align-items-center">
        <div class="col">
          <h1 class="m-0">${title}</h1>
        </div>
        <div class="col">
          <div class="text-end">
            <p class="m-0">Дата изменения: ${date}</p>
          </div>
        </div>
      </div>
    `;
  }

  renderBody(blocks) {
    if (!blocks) return console.error('Blocks fields is required');
    if (!Array.isArray(blocks)) return console.error('Blocks is not an array ', blocks);
    if (!blocks[0]) return console.log('Blocks is empty');

    blocks.forEach((block) => {
      if (!block.blockId) return console.warn('Block does not have blockId');
      if (!block.title) return console.warn('Block does not have title');
      if (!block.content) return console.warn('Block does not have content');

      this.aside.innerHTML += `
        <li>
          <a href="#${block.blockId}">${block.title}</a>
        </li>
      `;

      this.content.innerHTML += `
        <div class="content-row mb-5" id="${block.blockId}">
        <h2>${block.title}</h2>
        ${Base64.decode(block.content)}
        </div>
      `;
    });
  }
}
