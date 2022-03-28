import * as fs from 'fs';
import UserAgent from './services/user-agent';
import { CityFinder } from './services/city-finder';
import { createPostMessage, getRandomInt } from './utils/helpers';
import { Markup, Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import { getParsers } from './parsers/initParsers';

dotenv.config()

export const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

const fileContent = fs.readFileSync('./src/assets/userAgent.txt', 'utf8').split(/\r?\n/);
fileContent.pop();
UserAgent.setUserAgentList(fileContent);

const citiesList = fs.readFileSync('./src/assets/cities.txt', 'utf8').split(/\r?\n/);
citiesList.pop();
CityFinder.setCities(citiesList);

const parsers = getParsers();

// eslint-disable-next-line no-constant-condition
while(true) {
    for (const parser of parsers) {
        parser.getNewPosts().then(posts => {
            posts.forEach(post => {
                bot.telegram.sendPhoto(
                    process.env.OWNER_ID,
                    { url: post.image },
                    { caption: createPostMessage(post), reply_markup:
                            {
                                inline_keyboard: [[
                                    Markup.button.url(`${post.serviceName} 🚩`, post.url)
                                ]]
                            }
                    }
                ).catch(() => console.log(`Post error: ${post.url}`));
            });
        });
    }

    const interval = getRandomInt(120000, 60000)
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
    await delay(interval)
}
