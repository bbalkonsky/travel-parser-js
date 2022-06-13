import Vandrouki from './web/vandrouki';
import Pirates from './web/pirates';
import Trip4you from './web/trip4you';
import ParserModel from '../models/parser-model';
import Travelbelka from './web/travelbelka';
import Travelradar from './web/travelradar';

const vandroukiParser = new Vandrouki();
const piratesParser = new Pirates();

// TODO 503
const belkaParser = new Travelbelka();
// TODO 403
// const travelRadar = new Travelradar();
// TODO turn on after war
// const tripParser = new Trip4you();

export const getParsers = (): ParserModel[] => [
    vandroukiParser,
    piratesParser,
    // tripParser
    // travelRadar,
    belkaParser
];
