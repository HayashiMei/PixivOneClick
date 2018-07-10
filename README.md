<h1 align="center">Pixiv One Click</h1>

## Introduction

只是一个简单的谷歌扩展，在部分页面的插画、漫画、小说的缩略图上增加了下载按钮，点击后直接下载原图、小说文本。

## Screenshot

以下截图截自[荻pote](https://www.pixiv.net/member.php?id=2131660)和[小说每日排行榜](https://www.pixiv.net/novel/ranking.php?mode=daily)。

### Illust

![illust](screenshot/001.jpg)

### Manga/Multiple illust

![multi](screenshot/002.jpg)

### Ugoku illust

![ugoira](screenshot/003.jpg)

### Novel

![novel](screenshot/004.jpg)

## Build

```
$ npm install
$ npm run build
```

## Install

在Chrome的 **扩展程序页面(chrome://extensions)** 通过 **加载已解压的扩展程序** 安装这个扩展。

## Attention

这个扩展只是在好奇心的驱使下做着玩的，参考了很多Chrome商店里现有的Pixiv扩展，功能非常简陋(・ω<) てへぺろ

18.07.11追加：发现 Mac 上的迅雷扩展会导致文件的保存路径失效，并且文件名会变成 URL 里的名字，~原因回头查查~