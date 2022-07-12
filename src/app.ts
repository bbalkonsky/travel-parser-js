import * as fs from 'fs';
import UserAgent from './services/user-agent';
import { CityFinder } from './services/city-finder';
import { createPostMessage, getRandomInt, transformCityName } from './utils/helpers';
import { Markup, Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import { getParsers } from './parsers/initParsers';
import { createConnection } from 'typeorm';
import { User } from './database/entities/User';
import DataBaseController from './database/controller';
import ParsedPostModel from './models/parsed-post-model';
import PreparedPostModel from './models/prepared-post-model';
import { ExtraReplyMessage } from 'telegraf/typings/telegram-types';

dotenv.config()

try {
    await createConnection({
        type: 'sqlite',
        database: process.env.DBASE_PATH,
        entities: [User],
        synchronize: true
    });
} catch (err) {
    console.log(err);
}

export const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

const fileContent = fs.readFileSync('./src/assets/userAgent.txt', 'utf8').split(/\r?\n/);
fileContent.pop();
UserAgent.setUserAgentList(fileContent);

const citiesList = fs.readFileSync('./src/assets/cities.txt', 'utf8').split(/\r?\n/);
citiesList.pop();
CityFinder.setCities(citiesList);

const parsers = getParsers();

const start = (timeout: number): void => {
    setTimeout(() => {
        parserCallback();
        start(getRandomInt(120000, 60000));
    }, timeout);
}

const parserCallback = async () => {
    const users = await DataBaseController.getAllUsers();
    for (const parser of parsers) {
        parser.getNewPosts().then(posts => {
            posts.forEach(post => {
                sendPosts(post, users);
            });
        });
    }
}

const sendPosts = async (post: ParsedPostModel, users: User[]): Promise<void> => {
    // const usersToSendMessage: number[] = [parseInt(process.env.OWNER_ID, 10)];
    const usersToSendMessage: number[] = [parseInt(process.env.MAIN_CHANNEL, 10)];
    const preparedPost = createPostMessage(post);

    for (const user of users) {
        const userCities = user.cities ? JSON.parse(user.cities) : [];
        if (userCities.filter(x => preparedPost.cities.includes(x.toLowerCase())).length) {
            usersToSendMessage.push(user.id);
        }
    }

    const postsToSend = [];
    for (const id of usersToSendMessage) {
        const extra: ExtraReplyMessage = {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [[
                    Markup.button.url(`${post.serviceName} 🔥`, post.url)
                ]]
            }
        }
        postsToSend.push(post.image
            ? async () => bot.telegram.sendPhoto(id, { url: post.image }, {
                    ...extra,
                    caption: preparePostToChannel(preparedPost)
                }).catch(() => console.log(`Post error: ${post.url}`))
            : async () => bot.telegram.sendMessage(id, preparePostToChannel(preparedPost), extra)
        );
    }
    for (const chunk of sliceIntoChunks(postsToSend, 25)) {
        await Promise.allSettled(chunk.map(x => x())).catch(err => console.log(err));
        await wait(2000)
    }
}

const preparePostToChannel = (post: PreparedPostModel): string => {
    const hashCities = transformCityName(post.cities);
    return `${hashCities.join(' ')}\n\n${post.title}`;
};



const keyboard = Markup.keyboard([Markup.button.webApp('Выбор городов', process.env.WEB_APP_LINK)]).resize();

bot.command('start', async (ctx) => {
    await DataBaseController.createChat(ctx.chat.id);
    ctx.reply('Используй кнопку для выбора городов. Если интересны все предложения - подписывайтесь на канал (ссылка в описании)', keyboard);
})
bot.on('web_app_data', async (ctx) => {
    const user = ctx.message.from.id;
    const cities = ctx.message.web_app_data.data;
    await DataBaseController.updateUserCities(user, cities);
    ctx.reply(`Вы подписаны на следующие города: ${JSON.parse(cities).join(', ')}`);
})
bot.command('stat', async (ctx) => {
    if (ctx.from.id.toString() === process.env.OWNER_ID) {
        const users = await DataBaseController.getAllUsers();
        try {
            await ctx.reply(users.reduce((prev, curr) => {
                const userCities = JSON.parse(curr.cities);
                return userCities ? `${prev}\n${curr.id}: ${userCities.length}` : prev;
            }, `Itogo: ${users.length}\n`));
        } catch (e) {
            console.log('users: ', users);
            console.log(e);
        }
    } else {
        ctx.reply('Привет ты че шынгыс');
    }
})

bot.launch();
start(0);

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function sliceIntoChunks(arr, chunkSize) {
    const res = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
        const chunk = arr.slice(i, i + chunkSize);
        res.push(chunk);
    }
    return res;
}

