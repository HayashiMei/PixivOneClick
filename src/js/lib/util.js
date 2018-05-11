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

  convert(options) {
    const blobUrl = URL.createObjectURL(options.blob);

    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = document.createElement("img");

      img.setAttribute("src", blobUrl);

      img.addEventListener("load", () => {
        URL.revokeObjectURL(blobUrl);

        canvas.width = img.width;
        canvas.height = img.height;

        ctx.clearRect(0, 0, img.width, img.height);
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(blob => resolve(blob), options.type, options.quality);
      });

      img.addEventListener("error", err => {
        URL.revokeObjectURL(blobUrl);

        reject(err);
      });
    });
  }
}