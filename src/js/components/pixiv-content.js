import Util from './util'

export default class PixivContent {
  constructor() {
    this.util = new Util();
  }

  addButton() {
    document.querySelectorAll('.image-item').forEach((el, index) => {
      const icon = document.createElement('div');
      icon.classList.add('downloader');

      const div = document.createElement('div');
      div.classList.add('ext-menu-downloader');
      div.appendChild(icon);

      const a = document.createElement('a');
      a.appendChild(div);
      a.classList.add('ext-menu');
      el.appendChild(a);

      this.setWork(a, el);

      const listener = async e => {
        e.preventDefault();
        a.removeEventListener('click', listener);
        await this.downloadWork(a);
        a.addEventListener('click', listener);
      }

      a.addEventListener('click', listener);
    })
  }

  setWork(icon, el) {
    this.setType(icon, el);
    this.setUser(icon, el);
    this.setTitle(icon, el);
  }

  setType(icon, el) {
    if (el.querySelector('.multiple')) {
      icon.dataset['type'] = 'multi';
    } else if (el.querySelector('.ugoku-illust')) {
      icon.dataset['type'] = 'ugoira';
    } else {
      icon.dataset['type'] = 'illust'
    }
  }

  setTitle(icon, el) {
    icon.dataset['title'] = el.querySelector('.title').title;
  }

  setUser(icon, el) {
    let userName = '',
      userId = '',
      userInfo = el.querySelector('.user');
    if (userInfo) {
      icon.dataset['user_name'] = userInfo.dataset['user_name'];
      icon.dataset['user_id'] = userInfo.dataset['user_id'];
    } else {
      userInfo = document.querySelector('.user-name');
      icon.dataset['user_name'] = userInfo.title;
      icon.dataset['user_id'] = userInfo.href.split('=')[1];
    }
  }

  getFileName(options) {
    let ext = '';

    switch (options.ext) {
      case 'image/jpeg':
        ext = 'jpg';
        break;

      case 'image/png':
        ext = 'png';
        break;

      default:
        break;
    }

    const title = options.title.replace(/[\/\\\:\：\*\?\"\<\>\|]/, '_');
    const userName = options.user_name.replace(/[\/\\\:\：\*\?\"\<\>\|]/, '_');

    if (options.type === 'illust') {
      return `Pixiv/${userName}(${options.user_id})/${title}.${ext}`
    } else if (options.type === 'multi') {
      const index = String(options.index).padStart(3, '0');
      return `Pixiv/${userName}(${options.user_id})/${title}/${index}.${ext}`
    }
  }

  async downloadWork(a) {
    const {
      type,
    } = a.dataset;
    switch (type) {
      case 'illust':
        await this.downloadIllust(a);
        break;
      case 'multi':
        await this.downloadMultiple(a);
        break;
      default:
        break;
    }
  }

  async downloadIllust(icon) {
    const illustPageURL = icon.parentElement.querySelector('.work').href;

    if (!illustPageURL) return false

    const illustPageDocument = await this.getPageDocumentByURL(illustPageURL);
    const originalIllustURL = illustPageDocument.querySelector('._illust_modal img').dataset['src'];

    const imageBlob = await this.util.fetch({
      url: originalIllustURL,
      type: "blob",
      init: {
        credentials: "include",
        referrer: location.href
      }
    })

    const {
      user_id,
      user_name,
      title,
      type
    } = icon.dataset;
    await this.download({
      blob: imageBlob,
      filename: this.getFileName({
        user_name,
        user_id,
        title,
        ext: imageBlob.type,
        type,
      }),
      conflictAction: 'uniquify',
    })
  }

  async downloadMultiple(icon) {
    const pageCountSpan = icon.parentElement.querySelector('.page-count span');
    
    if (!pageCountSpan) return false;

    const pageCount = Number(pageCountSpan.textContent);

    const work = icon.parentElement.querySelector('.work');

    if (!work) return false

    const multiIllustPageURL = work.href.replace('medium', 'manga_big')

    const imageURLs = [];

    for (let i = 0; i < pageCount; i++) {
      const illustPageDocument = await this.getPageDocumentByURL(`${multiIllustPageURL}&page=${i}`);
      const imageURL = illustPageDocument.querySelector('img').src;
      
      imageURLs.push(imageURL);
    }

    const imageBlobs = [];

    for (let i = 0; i < imageURLs.length; i++) {
      const imageBlob = await this.util.fetch({
        url: imageURLs[i],
        type: "blob",
        init: {
          credentials: "include",
          referrer: location.href
        }
      })

      imageBlobs.push(imageBlob);
    }

    for (let i = 0; i < imageBlobs.length; i++) {
      const {
        user_id,
        user_name,
        title,
        type
      } = icon.dataset;
      await this.download({
        blob: imageBlobs[i],
        filename: this.getFileName({
          user_name,
          user_id,
          title,
          ext: imageBlobs[i].type,
          type,
          index: i
        }),
        conflictAction: 'uniquify',
      })
    }
  }

  async getPageDocumentByURL(url) {
    const illustPageText = await this.util.fetch({
      url: url,
      type: "text",
      init: {
        credentials: "include",
        referrer: location.href,
      }
    });

    const domParser = new DOMParser();
    return domParser.parseFromString(illustPageText, "text/html");
  }

  download(options) {
    this.util.message({
      type: 'download',
      data: {
        blobUrl: URL.createObjectURL(options.blob),
        filename: options.filename,
        conflictAction: options.conflictAction,
      }
    })
  }
}