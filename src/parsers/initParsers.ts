import Vandrouki from './web/vandrouki';
import Pirates from './web/pirates';
import Trip4you from './web/trip4you';
import ParserModel from '../models/parser-model';
import Travelbelka from './web/travelbelka';
import Travelradar from './web/travelradar';
import TelegramParser from './telegram';
import TelegramParser2 from './telegram2';

const vandroukiParser = new Vandrouki();
const piratesParser = new Pirates();

const belkaParser = new Travelbelka();
// TODO 403
// const travelRadar = new Travelradar();
// TODO turn on after war
// const tripParser = new Trip4you();
const telegramParser = new TelegramParser();
const telegramParser2 = new TelegramParser2();

export const getParsers = (): ParserModel[] => [
    vandroukiParser,
    piratesParser,
    belkaParser,
    // travelRadar,
    // tripParser,
    telegramParser,
    telegramParser2
];
