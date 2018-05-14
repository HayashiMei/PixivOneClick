import DefaultOptions from './default-option'

export default class Option {
  constructor() {
    this.keys = Object.keys(DefaultOptions);
  }

  init(options = DefaultOptions) {
    return this.get(Object.keys(options)).then(oldOptions => {
      return this.set(Object.assign(options, oldOptions));
    });
  }

  get(keys = this.keys) {
    return new Promise(resolve => {
      chrome.storage.sync.get(keys, options => {
        resolve(options);
      });
    });
  }

  set(options) {
    return new Promise(resolve => {
      chrome.storage.sync.set(options, options => {
        resolve(options);
      });
    });
  }
}