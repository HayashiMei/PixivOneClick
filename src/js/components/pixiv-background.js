import Option from './pixiv-options';

export default class PixivBackground {
  init() {
    this.option = new Option();
    this.option.init();

    this.addListener();
  }

  addListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.download(message.data)
        .then(data => {
          sendResponse({
            error: null,
            data,
          });
        })
        .catch(err => {
          sendResponse({
            error: err.message,
            data: null,
          });
        });

      return true;
    });
  }

  async download(options) {
    const downloadId = await this.browserDownload({
      url: options.blobUrl,
      filename: options.filename,
      conflictAction: options.conflictAction,
      saveAs: false,
    });

    return downloadId;
  }

  browserDownload(options) {
    return new Promise((resolve, reject) => {
      chrome.downloads.download(options, downloadId => {
        if (!downloadId) {
          reject(new Error("Couldn't download file"));
        }
        resolve(downloadId);
      });
    });
  }
}
