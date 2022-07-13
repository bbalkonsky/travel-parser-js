import Vandrouki from './web/vandrouki';
import Pirates from './web/pirates';
import Trip4you from './web/trip4you';
import ParserModel from '../models/parser-model';
import Travelbelka from './web/travelbelka';
import Travelradar from './web/travelradar';
import TelegramParser from './telegram/telegram';

const vandroukiParser = new Vandrouki();
const piratesParser = new Pirates();

const belkaParser = new Travelbelka();
// TODO 403
// const travelRadar = new Travelradar();
// TODO turn on after war
// const tripParser = new Trip4you();

// telegram parsers
const ticketsTurkey = new TelegramParser('Telegram: TicketsTurkey', 'https://t.me/s/TicketsTurkey');
const luckyWingsRussia = new TelegramParser('Telegram: Lucky Wings Russia', 'https://t.me/s/luckywingsrussia');

export const getParsers = (): ParserModel[] => [
    vandroukiParser,
    piratesParser,
    belkaParser,
    // travelRadar,
    // tripParser,
    ticketsTurkey,
    luckyWingsRussia
];
