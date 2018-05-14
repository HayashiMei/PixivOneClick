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
});