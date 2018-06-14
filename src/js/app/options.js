import Option from '../components/pixiv-options'

document.addEventListener('DOMContentLoaded', async () => {
  const option = new Option();

  const options = await option.get();

  for (const [key, value] of Object.entries(options)) {
    const optElement = document.querySelector(`#${key}`);

    optElement.value = value;

    optElement.addEventListener('change', e => {
      option.set({ [key]: e.currentTarget.value });
    });
  }

  const updateCursor = () => {
    const cursor = document.querySelector('.navigation-cursor'),
          activedItem = document.querySelector('.navigation-item');

    if (!cursor || !activedItem) return ;

    cursor.style.cssText = `width: ${activedItem.offsetWidth}px; transform: translateX(${activedItem.offsetLeft}px);`;
  }

  window.addEventListener('resize', updateCursor);
  updateCursor();
});