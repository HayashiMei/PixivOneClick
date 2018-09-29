export default class WorkNew {
  constructor(work, page) {
    this.workElment = work;
    this.page = page;
    this.type = '';
    this.userId = '';
    this.userName = '';
    this.workId = '';
    this.workName = '';
    this.workURL = '';
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
    } else if (~this.workElment.firstElementChild.href.indexOf('novel')) {
      type = 'novel';
    } else {
      type = 'illust';
    }

    this.type = type;
  }

  setWorkInfo() {
    switch (this.page) {
      case 'user_novel':
      case 'ranking_novel':
      case 'bookmark_novel':
      case 'new_novel':
        this.getWorkInfoFromNovelItem();
        break;

      case 'home':
      case 'user_home':
      case 'user_illust':
      case 'ranking_illust':
      case 'bookmark_illust':
      case 'new_illust':
        this.getWorkInfoFromImageItem();
        break;

      default:
        break;
    }
  }

  getWorkInfoFromImageItem() {
    this.btnLike = this.workElment.querySelector('button');
    this.btnGroup = this.btnLike.parentElement.parentElement;

    let a = null;
    for (const element of [...this.workElment.querySelectorAll('a')]) {
      if (!~element.className.indexOf('ext-menu')) {
        a = element;
      }
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
    const titleElement = this.workElment.querySelector('.title a');
    this.workName = titleElement.textContent;

    this.workURL = titleElement.href;

    const urlObject = new URL(this.workURL);
    this.workId = urlObject.searchParams.get('id');
  }

  getWorkInfoFromRankDetail() {
    const titleElement = this.workElment.querySelector('[class^=gtm-ranking]');
    this.workName = titleElement.textContent;

    this.workURL = titleElement.href;

    const urlObject = new URL(this.workURL);
    this.workId = urlObject.searchParams.get('illust_id');
  }

  setUserInfo() {
    switch (this.page) {
      case 'bookmark_illust':
        this.getUserInfoFromBookmarkPage();
        break;

      default:
        this.getUserInfo();
        break;
    }
  }

  getUserInfo() {
    this.userName = document.title.match(/「(.*)」/)[1];

    const urlObject = new URL(document.location);
    this.userId = urlObject.searchParams.get('id');
  }

  getUserInfoFromBookmarkPage() {
    const a = this.workElment.querySelector('a');

    const userInfo = a[a.length - 1];
    this.userName = userInfo.innerText;

    const urlObject = new URL(userInfo.href);
    this.userId = urlObject.searchParams.get('id');
  }
}
