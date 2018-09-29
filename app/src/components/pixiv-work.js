export default class Work {
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

    if (this.workElment.querySelector('.multiple')) {
      type = 'multi';
    } else if (this.workElment.querySelector('.ugoku-illust')) {
      type = 'ugoira';
    } else if (this.workElment.querySelector('[data-type=novel]')) {
      type = 'novel';
    } else if (this.workElment.querySelector('[data-type=illust]')) {
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

      case 'home_ranking':
        this.getWorkInfoFromRankDetail();
        break;

      default:
        break;
    }
  }

  getWorkInfoFromImageItem() {
    const titleElement = this.workElment.querySelector('.title');
    this.workName = titleElement.textContent;

    this.workURL = titleElement.parentElement.href || titleElement.href;

    const urlObject = new URL(this.workURL);
    this.workId = urlObject.searchParams.get('illust_id') || urlObject.searchParams.get('id');
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
      case 'home_ranking':
        this.getUserInfoFromRankDetail();
        break;

      default:
        this.getUserInfo();
        break;
    }
  }

  getUserInfo() {
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

  getUserInfoFromRankDetail() {
    let userInfo = this.workElment.querySelector('.ui-profile-popup');

    this.userName = userInfo.textContent;
    this.userId = userInfo.dataset['user_id'];
  }
}
