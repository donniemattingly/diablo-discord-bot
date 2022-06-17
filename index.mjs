import fetch from 'node-fetch';
import cheerio from "cheerio";
import {writeFileSync} from 'fs'

const base = 'https://diablo2.io/'

import puppeteer from "puppeteer";

const htmlToImage = async (html = "") => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setContent(html);
    await page.setViewport({
        width: 320,
        height: 480,
        deviceScaleFactor: 3,
    });

    const session = await page.target().createCDPSession();
    await session.send('Emulation.setPageScaleFactor', {
        pageScaleFactor: 2, // 400%
    });

    const content = await page.$("body");
    const imageBuffer = await content.screenshot({omitBackground: true});

    await page.close();
    await browser.close();

    return imageBuffer;
};

const saveImage = (buffer) => {
    writeFileSync('image.png', buffer);
}

const getItemPreviewByName = async (name) => {
    const urlEncodeName = encodeURIComponent(name)
    const searchHtml = await fetch(`https://diablo2.io/zls-search.php?term=${name}`).then(res => res.text());
    const $ = cheerio.load(searchHtml);

    const result = $('span li').data().href;
    const page = await fetch(base + result).then(res => res.text());
    console.log(page);
    const itemHtml = cheerio.load(page)
    itemHtml('head').append('<link rel="stylesheet" href="https://diablo2.io/styles/zulu/theme/zulu.min.css?v1.38">')
    itemHtml('head').append('<link rel="stylesheet" href="https://diablo2.io/styles/zulu/theme/extensions.min.css?v1.38">')
    itemHtml('head').append('<link rel="stylesheet" href="https://diablo2.io/styles/zulu/theme/extensions.min.css?v1.38"/>')
    itemHtml('head').append('<link rel="stylesheet" type="text/css" href="//fonts.googleapis.com/css?family=Open+Sans" />')
    itemHtml('head').append('<link rel="preload" href="https://diablo2.io/styles/zulu/theme/Formal436BT.ttf" as="font" type="font/woff2" crossorigin>')
    itemHtml('section').addClass(['z-bigtip', 'webp' , 'z-bigtip', 'webp' , 'phpbb_alert'])
    itemHtml('section').css('border-radius', '3em');
    // const html = itemHtml.html();
    // const replacedHtml = html.replace('(/styles', '(https://diablo2.io/styles')
    // const buffer = await htmlToImage(replacedHtml)
    // saveImage(buffer);
}

getItemPreviewByName('titan').catch(console.error);