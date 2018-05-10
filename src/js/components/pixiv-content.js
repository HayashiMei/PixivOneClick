import Util from '../lib/util'
import JSZip from 'jszip'
import Webp from '../lib/webp'
import Apng from '../lib/apng'

class Work {
  constructor(work) {
    this.workElment = work;
    this.type = '';
    this.userId = '';
    this.userName = '';
    this.workId = '';
    this.workName = '';
  }

  init() {
    this.setType();
    this.setUserInfo();
    this.setWorkInfo();
  }

  setType() {
    let type = ''

    if (this.workElment.querySelector('.multiple')) {
      type = 'multi';
    } else if (this.workElment.querySelector('.ugoku-illust')) {
      type = 'ugoira';
    } else if (this.workElment.querySelector('[data-type=novel]')) {
      type = 'novel'
    } else if (this.workElment.querySelector('[data-type=illust]')) {
      type = 'illust'
    }

    this.type = type;
  }

  setWorkInfo() {
    const titleElement = this.workElment.querySelector('.title');
    this.workName = titleElement.textContent;

    const workURL = new URL(titleElement.parentElement.href || titleElement.href);
    this.workId = workURL.searchParams.get('illust_id') || workURL.searchParams.get('id');
  }

  setUserInfo() {
    let userInfo = this.workElment.querySelector('.user') || this.workElment.querySelector('.user-container');
    if (userInfo) {
      this.userName = userInfo.dataset['user_name'];
      this.userId = userInfo.dataset['user_id'];
    } else {
      userInfo = document.querySelector('.profile .user-name');
      this.userName = userInfo.title;

      const userURL = new URL(userInfo.href);
      this.userId = userURL.searchParams.get('id');
    }
  }
}

export default class PixivContent {
  constructor() {
    this.util = new Util();
    this.worksMap = {};
    this.page = this.getPage();
  }

  getPage() {
    const url = new URL(location.href);

    let page = '';
    switch (url.pathname) {
      case '/':
        page = 'home';
        break;

      case '/ranking.php':
        page = 'ranking';
        break;

      case '/novel/ranking.php':
        page = 'novel_ranking';
        break;

      case '/member.php':
        page = 'user_home';
        break;

      case '/member_illust.php':
        page = 'user_illust';
        break;

      case '/novel/member.php':
        page = 'user_novel';
        break;

      default:
        break;
    }

    return page;
  }

  init() {
    switch (this.page) {
      case 'home':
      case 'user_home':
      case 'user_illust':
        this.addDownloader2ImageItem();
        break;

      case 'ranking':
        this.addDownloader2RankingItem();
        break;

      default:
        break;
    }
  }

  addDownloader2ImageItem() {
    document.querySelectorAll('.image-item').forEach((item, index) => {
      const downloader = this.createDownloader();

      var a = item.querySelector('.work');

      if (!a) return false;

      a.appendChild(downloader);

      const work = new Work(item);
      work.init();

      this.worksMap[work.workId] = work;

      const listener = async e => {
        e.preventDefault();

        a.removeEventListener('click', listener);

        await this.downloadWork(work);

        a.addEventListener('click', listener);
      };

      a.addEventListener('click', listener);
    })
  }

  addDownloader2RankingItem() {
    document.querySelectorAll('.ranking-item').forEach((item, index) => {
      const downloader = this.createDownloader();

      var a = item.querySelector('.work');

      if (!a) return false;

      a.appendChild(downloader);

      const work = new Work(item);
      work.init();

      this.worksMap[work.workId] = work;

      const listener = async e => {
        e.preventDefault();

        a.removeEventListener('click', listener);

        await this.downloadWork(work);

        a.addEventListener('click', listener);
      };

      a.addEventListener('click', listener);
    })
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

      case "application/zip":
        ext = "zip";
        break;

      case "image/webp":
        ext = "webp";
        break;

      case "text/plain":
        ext = "txt";
        break;

      default:
        break;
    }

    const { work } = options
    const workName = work.workName.replace(/[\/\\\:\：\*\?\"\<\>\|]/, '_');
    const userName = work.userName.replace(/[\/\\\:\：\*\?\"\<\>\|]/, '_');

    if (['illust', 'ugoira', 'novel'].indexOf(work.type) !== -1) {
      return `Pixiv/${userName}(${work.userId})/${workName}(${work.workId}).${ext}`
    } else if (work.type === 'multi') {
      const index = String(options.index).padStart(3, '0');
      return `Pixiv/${userName}(${work.userId})/${workName}(${work.workId})/${index}.${ext}`
    }
  }

  async downloadWork(work) {
    const { type } = work;
    switch (type) {
      case 'illust':
        await this.downloadIllust(work);
        break;

      case 'multi':
        await this.downloadMultiple(work);
        break;

      case 'ugoira':
        await this.downloadUgoira(work);
        break;

      case 'novel':
        await this.downloadNovel(work);
        break;

      default:
        break;
    }
  }

  async downloadIllust(work) {
    const illustPageURL = work.workElment.querySelector('.work').href;

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

    await this.download({
      blob: imageBlob,
      filename: this.getFileName({ work, ext: imageBlob.type }),
      conflictAction: 'uniquify'
    })
  }

  async downloadMultiple(work) {
    const pageCountSpan = work.workElment.querySelector('.page-count span');

    if (!pageCountSpan) return false;

    const pageCount = Number(pageCountSpan.textContent);

    const workURLElement = work.workElment.querySelector('.work');

    if (!workURLElement) return false;

    const multiIllustPageURL = workURLElement.href.replace('medium', 'manga_big');

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
        init: { credentials: "include", referrer: location.href }
      })

      imageBlobs.push(imageBlob);
    }

    for (let i = 0; i < imageBlobs.length; i++) {
      await this.download({
        blob: imageBlobs[i],
        filename: this.getFileName({ work, ext: imageBlobs[i].type, index: i }),
        conflictAction: 'uniquify'
      })
    }
  }

  async downloadUgoira(work) {
    const workURLElement = work.workElment.querySelector('.work');

    if (!workURLElement) return false;

    const illustPageDocument = await this.getPageDocumentByURL(workURLElement.href);

    for (const script of illustPageDocument.querySelectorAll('script')) {
      const matchedResult = script.textContent.match(new RegExp('pixiv.context.ugokuIllustFullscreenData[ //t]*=[ //t]*(.*?);'));

      if (!matchedResult) continue;

      work.ugoiraData = JSON.parse(matchedResult[1]);
    }

    // this.downloadZip(work);

    // this.downloadApng(work);

    this.downloadWebp(work);
  }

  async downloadZip(work) {
    const zipBlob = await this.util.fetch({
      url: work.ugoiraData.src,
      type: "blob",
      init: { credentials: "include", referrer: location.href }
    });

    await this.download({
      blob: zipBlob,
      filename: this.getFileName({ work, ext: zipBlob.type }),
      conflictAction: 'uniquify'
    });
  }

  async downloadApng(work) {
    const { ugoiraData } = work;

    const zipArrayBuffer = await this.util.fetch({
      url: ugoiraData.src,
      type: "arraybuffer",
      init: { credentials: "include", referrer: location.href }
    });

    const zipObject = await JSZip.loadAsync(zipArrayBuffer);

    const convertedImageBlobs = [];

    for (let i = 0; i < ugoiraData.frames.length; i++) {
      const frame = ugoiraData.frames[i];

      const imageArrayBuffer = await zipObject.file(frame.file).async("arraybuffer");
      const imageBlob = new Blob([imageArrayBuffer], { "type": ugoiraData.mime_type });

      const convertedImageBlob = await this.util.convert({
          blob: imageBlob,
          type: "image/png",
          quality: 1
      });

      convertedImageBlobs.push(convertedImageBlob);
    }

    const apng = new Apng();

    for (let i = 0; i < convertedImageBlobs.length; i++) {
      const convertedImageBlob = convertedImageBlobs[i];

      apng.add(convertedImageBlob, { duration: ugoiraData.frames[i].delay });
    }

    const imageBlob = await apng.render();

    await this.download({
      blob: imageBlob,
      filename: this.getFileName({ work, ext: imageBlob.type }),
      conflictAction: 'uniquify'
    });
  }

  async downloadWebp(work) {
    const { ugoiraData } = work;

    const zipArrayBuffer = await this.util.fetch({
      url: ugoiraData.src,
      type: "arraybuffer",
      init: { credentials: "include", referrer: location.href }
    });

    const zipObject = await JSZip.loadAsync(zipArrayBuffer);

    const convertedImageBlobs = [];

    for (let i = 0; i < ugoiraData.frames.length; i++) {
      const frame = ugoiraData.frames[i];

      const imageArrayBuffer = await zipObject.file(frame.file).async("arraybuffer");
      const imageBlob = new Blob([imageArrayBuffer], { "type": ugoiraData.mime_type });

      const convertedImageBlob = await this.util.convert({
          blob: imageBlob,
          type: "image/webp",
          quality: 1
      });

      convertedImageBlobs.push(convertedImageBlob);
    }

    const webp = new Webp();

    for (let i = 0; i < convertedImageBlobs.length; i++) {
      const convertedImageBlob = convertedImageBlobs[i];

      webp.add(convertedImageBlob, { duration: ugoiraData.frames[i].delay });
    }

    const imageBlob = await webp.render();

    await this.download({
      blob: imageBlob,
      filename: this.getFileName({ work, ext: imageBlob.type }),
      conflictAction: 'uniquify'
    });
  }

  async downloadNovel(work) {
    const novelPageURL = work.workElment.querySelector('.work').href;

    if (!novelPageURL) return false

    const novelPageDocument = await this.getPageDocumentByURL(novelPageURL);
    const novelTextElement = novelPageDocument.querySelector('#novel_text')

    if (!novelTextElement) return false;

    const textBlob = new Blob([novelTextElement.textContent.replace(/\r\n|\r|\n/g, "\r\n")], { type: "text/plain" });

    await this.download({
      blob: textBlob,
      filename: this.getFileName({ work, ext: textBlob.type }),
      conflictAction: 'uniquify'
    });
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

  createDownloader() {
    const icon = document.createElement('div');
    icon.classList.add('downloader');

    const div = document.createElement('div');
    div.classList.add('ext-menu-downloader');
    div.appendChild(icon);

    const downloader = document.createElement('a');
    downloader.appendChild(div);
    downloader.classList.add('ext-menu');

    return downloader;
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