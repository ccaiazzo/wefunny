const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages]});

const BOT_TOKEN = '';

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    console.log('Message received from ' + message.author.tag + ': ', message.content);

    const iFunnyLinkRegex = /https?:\/\/(?:www\.)?ifunny\.co\/video\/[a-zA-Z0-9]+(\?s=cl)?/g;
    const iFunnyLinks = message.content.match(iFunnyLinkRegex);

    if (iFunnyLinks) {
        console.log('iFunny links found:', iFunnyLinks);
        for (const link of iFunnyLinks) {
            try {
                console.log('Fetching video URL for:', link);
                const videoURL = await fetchVideoURL(link);
                console.log('Video URL found:', videoURL);
                message.channel.send(`Video URL: ${videoURL}`);
            } catch (error) {
                console.error('Error fetching video URL:', error);
            }
        }
    }
});

async function fetchVideoURL(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3');
    await page.goto(url, { waitUntil: 'networkidle2' });

    console.log("Went to the URL and now waiting for selector...");

    // Wait for the video element to be available
    await page.waitForSelector("#App");
    console.log("Found selector.");

    const videoURL = await page.evaluate(() => {
        let videoElement = document.getElementsByTagName('video')[0];
        return videoElement ? videoElement.src : null;
    });

    await browser.close();

    if (videoURL) {
        return videoURL;
    } else {
        throw new Error('Video URL not found');
    }
}

client.login(BOT_TOKEN);
