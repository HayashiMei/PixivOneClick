import "regenerator-runtime/runtime";
import PixivContent from './components/pixiv-content';
import '../sass/content.scss';

document.addEventListener('DOMContentLoaded', () => {
  const content = new PixivContent();
  content.init();
});
