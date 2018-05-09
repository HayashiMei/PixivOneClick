export default class Util {
  message(options) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({
        type: options.type,
        data: options.data
      }, response => {
        if (response.error) {
          reject(new Error(response.error));
        }

        resolve(response.data);
      });
    });
  }

  fetch(options) {
    return fetch(options.url, options.init).then(response => {
      if (!response.ok) return false;
      switch (options.type) {
        case "arraybuffer":
          return response.arrayBuffer();

        case "blob":
          return response.blob();

        case "formdata":
          return response.formData();

        case "json":
          return response.json();

        case "text":
          return response.text();

        default:
          throw new Error("Invalid type");
      }
    });
  }
}