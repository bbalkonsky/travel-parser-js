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
                console.log(post.url)
                sendPosts(post, users);
            });
        });
    }
}

const sendPosts = (post: ParsedPostModel, users: User[]): void => {
    // const usersToSendMessage: number[] = [parseInt(process.env.OWNER_ID, 10)];
    const usersToSendMessage: number[] = [parseInt(process.env.MAIN_CHANNEL, 10)];
    const preparedPost = createPostMessage(post);

    for (const user of users) {
        const userCities = user.cities ? JSON.parse(user.cities) : [];
        if (userCities.filter(x => preparedPost.cities.includes(x.toLowerCase())).length) {
            usersToSendMessage.push(user.id);
        }
    }

    for (const id of usersToSendMessage) {
        // TODO you are kidding right?
        const img = post.image ? post.image : 'https://static.timesofisrael.com/atlantajewishtimes/uploads/2021/03/141_20201013185512_Consumer-Survey-Finds-70-Percent-of-Travelers-Plan-to-Holiday-in-2021.jpg';
        bot.telegram.sendPhoto(
            id,
            { url: img }, // TODO if there is no image
            { caption: preparePostToChannel(preparedPost), reply_markup:
                    {
                        inline_keyboard: [[
                            Markup.button.url(`${post.serviceName} 🔥`, post.url)
                        ]]
                    }
            }
        ).catch(() => console.log(`Post error: ${post.url}`));
    }
}

const preparePostToChannel = (post: PreparedPostModel): string => {
    const hashCities = transformCityName(post.cities);
    return `${hashCities.join(' ')}\n\n${post.title}`;
};



const keyboard = Markup.keyboard([Markup.button.webApp('Выбор городов', process.env.WEB_APP_LINK)]);

bot.command('start', async (ctx) => {
    await DataBaseController.createChat(ctx.chat.id);
    ctx.reply('Используй кнопку для выбора городов', keyboard)
})
bot.on('web_app_data', async (ctx) => {
    const user = ctx.message.from.id;
    const cities = ctx.message.web_app_data.data;
    await DataBaseController.updateUserCities(user, cities);
    ctx.reply(`Вы подписаны на следующие города: ${JSON.parse(cities).join(', ')}`);
});

bot.launch();
start(0);
