import * as fs from 'fs';
import Vandrouki from './parsers/vandrouki';
import UserAgent from './services/user-agent';
import { CityFinder, getPostCities } from './services/city-finder';
import { getRandomInt } from './utils/helpers';
import Pirates from './parsers/pirates';
import Trip4you from './parsers/trip4you';


const fileContent = fs.readFileSync('./src/assets/userAgent.txt', 'utf8').split(/\r?\n/);
fileContent.pop();
UserAgent.setUserAgentList(fileContent);

const citiesList = fs.readFileSync('./src/assets/cities.txt', 'utf8').split(/\r?\n/);
citiesList.pop();
CityFinder.setCities(citiesList);

const vandrouki = new Vandrouki();
const pirates = new Pirates();
const trip = new Trip4you();


// eslint-disable-next-line no-constant-condition
while(true) {
    const interval = getRandomInt(120000, 60000)
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
    await delay(interval)

    for (const parser of [vandrouki, pirates, trip]) {
        parser.main().then(posts => {
            posts.forEach(post => {
                const postCities = getPostCities(post);
                if (postCities.includes('Санкт-Петербург')) {
                    console.log(post.url);
                }
            });
        });
    }
}
