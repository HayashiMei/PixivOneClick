import Util from '../lib/util'
import Option from './pixiv-options'
import Work from './pixiv-work'
import JSZip from 'jszip'
import Webp from '../lib/webp'
import Apng from '../lib/apng'

export default class PixivContent {
  constructor() {
    this.util = new Util();
    this.option = new Option();
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
        page = 'ranking_illust';
        break;

      case '/novel/ranking.php':
        page = 'ranking_novel';
        break;

      case '/member.php':
        page = 'user_home';
        break;

      case '/member_illust.php':
        page = 'user_illust';
        break;

      case '/bookmark.php':
        page = 'bookmark_illust';
        break;

      case '/new_illust.php':
        page = 'new_illust';
        break;

      case '/series.php':
      case '/novel/member.php':
        page = 'user_novel';
        break;

      case '/novel/bookmark.php':
        page = 'bookmark_novel';
        break;

      case '/novel/new.php':
        page = 'new_novel';
        break;

      default:
        break;
    }

    return page;
  }

  init() {
    switch (this.page) {
      case 'home':
        this.addDownloader2ImageItem();
        this.addDownloader2RankingDetail();
        break;

      case 'user_home':
      case 'user_illust':
      case 'bookmark_illust':
      case 'new_illust':
        this.addDownloader2ImageItem();
        break;

      case 'ranking_illust':
        this.addDownloader2RankingIllust();
        break;

      case 'user_novel':
      case 'ranking_novel':
      case 'bookmark_novel':
      case 'new_novel':
        this.addDownloader2NovelItem();
        break;

      default:
        break;
    }
  }

  isLimited(item) {
    const img = item.querySelector('img');
    
    if (!img) return true;

    const imgURL = new URL(img.dataset['src']);

    return imgURL.host === 's.pximg.net';
  }

  addDownloader2ImageItem() {
    document.querySelectorAll('.image-item').forEach((item, index) => {
      var a = item.querySelector('.work');
      if (!a || a.href.indexOf('booth') !== -1 || this.isLimited(item)) return false;

      const downloader = this.createDownloader();
      a.appendChild(downloader);

      const work = new Work(item, this.page);
      work.init();
      this.worksMap[work.workId] = work;

      const listener = async e => {
        e.preventDefault();

        downloader.removeEventListener('click', listener);

        await this.downloadWork(work);

        downloader.addEventListener('click', listener);
      };

      downloader.addEventListener('click', listener);
    })
  }

  addDownloader2RankingIllust() {
    document.querySelectorAll('.ranking-item').forEach((item, index) => {
      if (this.isLimited(item)) return false;

      var a = item.querySelector('.work');
      if (!a) return false;

      const downloader = this.createDownloader();
      a.appendChild(downloader);

      const work = new Work(item, this.page);
      work.init();
      this.worksMap[work.workId] = work;

      const listener = async e => {
        e.preventDefault();

        downloader.removeEventListener('click', listener);

        await this.downloadWork(work);

        downloader.addEventListener('click', listener);
      };

      downloader.addEventListener('click', listener);
    })
  }

  addDownloader2NovelItem() {
    document.querySelectorAll('._novel-item').forEach((item, index) => {
      const downloader = this.createDownloader();
      item.appendChild(downloader);

      const work = new Work(item, this.page);
      work.init();
      this.worksMap[work.workId] = work;

      const listener = async e => {
        e.preventDefault();

        downloader.removeEventListener('click', listener);

        await this.downloadWork(work);

        downloader.addEventListener('click', listener);
      };

      downloader.addEventListener('click', listener);
    })
  }

  addDownloader2RankingDetail() {
    document.querySelectorAll('.rank-detail').forEach((item, index) => {
      var a = item.querySelector('._work');

      const downloader = this.createDownloader();
      a.appendChild(downloader);

      const work = new Work(item, 'home_ranking');
      work.init();
      this.worksMap[work.workId] = work;

      const listener = async e => {
        e.preventDefault();

        downloader.removeEventListener('click', listener);

        await this.downloadWork(work);

        downloader.addEventListener('click', listener);
      };

      downloader.addEventListener('click', listener);
    })
  }

  getExt(options) {
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

    return ext;
  }

  async getFileName(options) {
    const { work } = options

    const workName = await this.getWorkName(work);
    const userName = work.userName.replace(/[\/\\\:\：\*\?\"\<\>\|]/, '_');

    const path = this.getPath({
      pattern: options.pattern,
      info: {
        userId: work.userId,
        userName,
        workId: work.workId,
        workName
      }
    });

    if (['ugoira', 'illust', 'novel'].indexOf(work.type) !== -1) {
      return `${path}.${this.getExt(options)}`;
    } else if (work.type === 'multi') {
      const index = String(options.index).padStart(3, '0');
      return `${path}/${index}.${this.getExt(options)}`
    }
  }

  getPath(options) {
    let path = options.pattern;
    for (const key of Object.keys(options.info)) {
      path = path.replace('${' + key + '}', options.info[key]);
    }

    return path;
  }

  async getWorkName(work) {
    if (/\.{3}$/.test(work.workName)) {
      const workPageDocument = await this.getPageDocumentByURL(work.workURL);
      work.workName = workPageDocument.querySelector('.work-info .title').textContent;
    }
    return work.workName.replace(/[\/\\\:\：\*\?\"\<\>\|]/, '_');
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
    const illustPageDocument = await this.getPageDocumentByURL(work.workURL);
    const originalIllustURL = illustPageDocument.querySelector('._illust_modal img').dataset['src'];

    const imageBlob = await this.util.fetch({
      url: originalIllustURL,
      type: "blob",
      init: {
        credentials: "include",
        referrer: location.href
      }
    })

    const options = await this.option.get();

    await this.download({
      blob: imageBlob,
      filename: await this.getFileName({ work, pattern: options.singlePath, ext: imageBlob.type }),
      conflictAction: 'uniquify'
    })
  }

  async downloadMultiple(work) {
    const pageCountSpan = work.workElment.querySelector('.page-count span');

    if (!pageCountSpan) return false;

    const pageCount = Number(pageCountSpan.textContent);

    const multiIllustPageURL = work.workURL.replace('medium', 'manga_big');

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

    const options = await this.option.get();

    for (let i = 0; i < imageBlobs.length; i++) {
      await this.download({
        blob: imageBlobs[i],
        filename: await this.getFileName({ work, pattern: options.multiPath, ext: imageBlobs[i].type, index: i }),
        conflictAction: 'uniquify'
      })
    }
  }

  async downloadUgoira(work) {
    const illustPageDocument = await this.getPageDocumentByURL(work.workURL);

    for (const script of illustPageDocument.querySelectorAll('script')) {
      const matchedResult = script.textContent.match(new RegExp('pixiv.context.ugokuIllustFullscreenData[ //t]*=[ //t]*(.*?);'));

      if (!matchedResult) continue;

      work.ugoiraData = JSON.parse(matchedResult[1]);
    }

    const options = await this.option.get();

    switch (options.ugoiraFormat) {
      case 'zip':
        this.downloadZip(work);
        break;

      case 'apng':
        this.downloadApng(work);
        break;

      case 'webp':
        this.downloadWebp(work);
        break;

      default:
        break;
    }
  }

  async downloadZip(work) {
    const zipBlob = await this.util.fetch({
      url: work.ugoiraData.src,
      type: "blob",
      init: { credentials: "include", referrer: location.href }
    });

    const options = await this.option.get();

    await this.download({
      blob: zipBlob,
      filename: await this.getFileName({ work, pattern: options.multiPath, ext: zipBlob.type }),
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

    const options = await this.option.get();

    await this.download({
      blob: imageBlob,
      filename: await this.getFileName({ work, pattern: options.multiPath, ext: imageBlob.type }),
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

    const options = await this.option.get();

    await this.download({
      blob: imageBlob,
      filename: await this.getFileName({ work, pattern: options.multiPath, ext: imageBlob.type }),
      conflictAction: 'uniquify'
    });
  }

  async downloadNovel(work) {
    const novelPageDocument = await this.getPageDocumentByURL(work.workURL);
    const novelTextElement = novelPageDocument.querySelector('#novel_text')

    if (!novelTextElement) return false;

    const textBlob = new Blob([novelTextElement.textContent.replace(/\r\n|\r|\n/g, "\r\n")], { type: "text/plain" });

    const options = await this.option.get();

    await this.download({
      blob: textBlob,
      filename: await this.getFileName({ work, pattern: options.novelPath, ext: textBlob.type }),
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