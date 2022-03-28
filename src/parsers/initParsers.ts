import Vandrouki from './web/vandrouki';
import Pirates from './web/pirates';
import Trip4you from './web/trip4you';
import ParserModel from '../models/parser-model';

const vandroukiParser = new Vandrouki();
const piratesParser = new Pirates();
const tripParser = new Trip4you();

export const getParsers = (): ParserModel[] => [vandroukiParser, piratesParser, tripParser];
