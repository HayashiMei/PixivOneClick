document.querySelectorAll('.image-item').forEach((el, index) => {
  let opener = document.createElement('div');
  opener.classList.add('downloader');

  let openerWrap = document.createElement('div');
  openerWrap.classList.add('ext-menu-downloader');
  openerWrap.appendChild(opener);

  let downloadIcon = document.createElement('a');
  downloadIcon.appendChild(openerWrap);
  downloadIcon.classList.add('ext-menu');
  downloadIcon.style.right = 'calc((100% - 150px) / 2 + 4px + 40px + 8px)';

  downloadIcon.href = el.querySelector('img').src.replace('c/150x150/img-master', 'img-original').replace('_master1200', '')
  downloadIcon.alt = el.querySelector('.title').innerHTML

  downloadIcon.addEventListener('click', function () {
    event.preventDefault();
    download(downloadIcon.href, location.href, downloadIcon.alt);
  });

  el.querySelector('._layout-thumbnail').appendChild(downloadIcon);
})

function download(url, referrer, title, format = '.jpg') {
  myFetch({
    url: url,
    type: "blob",
    init: {
      credentials: "include",
      referrer: referrer
    }
  }).then(data => {
    if (!data) {
      download(url.replace('jpg', 'png'), referrer, title, '.png')
    } else {
      var a = document.createElement('a');
      a.href = URL.createObjectURL(data);
      a.setAttribute('download', title + format);
      a.click();
      a.remove();
    }
  });
}

function myFetch(options) {
  return fetch(options.url, options.init).then(response => {
    console.clear()
    if (response.status === 404) {
      return false;
    }
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