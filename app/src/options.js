import 'regenerator-runtime/runtime';
import Option from './components/pixiv-options';
import '../sass/options.scss';

document.addEventListener('DOMContentLoaded', async () => {
  const option = new Option();

  const options = await option.get();

  for (const [key, value] of Object.entries(options)) {
    const optElement = document.querySelector(`#${key}`);

    optElement.value = value;

    optElement.addEventListener('change', e => {
      option.set({
        [key]: e.currentTarget.value,
      });
    });
  }

  updateCursor();
  initRange();

  window.addEventListener('resize', updateCursor);
});

const updateCursor = () => {
  const cursor = document.querySelector('.navigation-cursor'),
    activedItem = document.querySelector('.navigation-item');

  if (!cursor || !activedItem) return;

  cursor.style.cssText = `width: ${activedItem.offsetWidth}px; transform: translateX(${activedItem.offsetLeft}px);`;
};

const initRange = () => {
  const ranges = [...document.querySelectorAll('.range')];

  for (const r of ranges) {
    const inner = r.querySelector('.range__inner'),
      text = r.querySelector('.range__text');

    if (!inner || !text) continue;

    text.textContent = `${Math.ceil(inner.value * 100)}%`;

    inner.addEventListener('input', e => {
      let curVal = e.currentTarget.value;
      if (!text) return;
      text.textContent = `${Math.ceil(curVal * 100)}%`;
    });
  }
};
