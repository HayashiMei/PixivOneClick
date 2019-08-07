export default class WorkNew {
  constructor(work, page, isRecommend) {
    this.workElment = work;
    this.page = page;
    this.type = '';
    this.userId = '';
    this.userName = '';
    this.workId = '';
    this.workName = '';
    this.workURL = '';
    this.isRecommend = isRecommend;
  }

  init() {
    this.setType();
    this.setUserInfo();
    this.setWorkInfo();
  }

  setType() {
    let type = '';

    const ugoiraMark = this.workElment.querySelector('svg[viewBox="0 0 24 24"]');
    const multiMark = this.workElment.querySelector('svg[viewBox="0 0 9 10"]');

    if (ugoiraMark) {
      type = 'ugoira';
    } else if (multiMark) {
      type = 'multi';
      this.pageCount = multiMark.nextElementSibling.innerText;
    } else if (~this.workElment.querySelector('a').href.indexOf('novel')) {
      type = 'novel';
    } else {
      type = 'illust';
    }

    this.type = type;
  }

  isNovel() {
    return this.type === 'novel';
  }

  setWorkInfo() {
    switch (this.page) {
      case 'user_home':
        return this.isNovel() ? this.getWorkInfoFromNovelItem() : this.getWorkInfoFromImageItem();

      case 'user_novel':
      case 'ranking_novel':
      case 'bookmark_novel':
      case 'new_novel':
        return this.getWorkInfoFromNovelItem();

      case 'home':
      case 'user_illust':
      case 'ranking_illust':
      case 'bookmark_illust':
      case 'new_illust':
        return this.getWorkInfoFromImageItem();

      default:
        break;
    }
  }

  getWorkInfoFromImageItem() {
    this.btnLike = this.workElment.querySelector('button');
    this.btnGroup = this.btnLike.parentElement.parentElement;

    let a = null;
    if (this.isRecommend) {
      a = this.workElment.querySelector('a:last-child');
    } else {
      a = this.workElment.nextElementSibling;
    }

    if (!a) {
      return;
    }

    this.workURL = a.href;
    this.workName = a.innerText;

    const urlObject = new URL(this.workURL);
    this.workId = urlObject.searchParams.get('illust_id');
  }

  getWorkInfoFromNovelItem() {
    this.btnLike = this.workElment.querySelector('button');
    this.btnGroup = this.btnLike.parentElement.parentElement;

    const titleElements = this.workElment.querySelectorAll('a[title]');

    if (titleElements.length === 2) {
      this.seriesName = titleElements[0].textContent;
      this.seriesURL = titleElements[0].href;
      this.seriesId = this.seriesURL.split('/').reverse()[0];

      this.workName = titleElements[1].textContent;
      this.workURL = titleElements[1].href;
    } else {
      this.workName = titleElements[0].textContent;
      this.workURL = titleElements[0].href;
    }

    const urlObject = new URL(this.workURL);
    this.workId = urlObject.searchParams.get('id');
  }

  setUserInfo() {
    switch (this.page) {
      case 'bookmark_illust':
        return this.getUserInfoFromIllustBookmarkPage();

      case 'bookmark_novel':
        return this.getUserInfoFromNovelBookmarkPage();

      default:
        this.getUserInfo();
        break;
    }
  }

  getUserInfo() {
    this.userName = document.title.replace(' - pixiv', '');

    const urlObject = new URL(document.location);
    this.userId = urlObject.searchParams.get('id');
  }

  getUserInfoFromIllustBookmarkPage() {
    const a = this.workElment.parentElement.querySelectorAll('a');

    const userInfo = a[a.length - 1];
    this.userName = userInfo.innerText;

    const urlObject = new URL(userInfo.href);
    this.userId = urlObject.searchParams.get('id');
  }

  getUserInfoFromNovelBookmarkPage() {
    const a = this.workElment.parentElement.querySelectorAll('a');

    const userInfo = a[3];
    this.userName = userInfo.innerText;

    const urlObject = new URL(userInfo.href);
    this.userId = urlObject.searchParams.get('id');
  }
}
