import ParseMetaModel from '../../models/parse-meta-model';
import AbstractParser from './abstract-parser';

export default class Trip4you extends AbstractParser{

    protected readonly serviceName = 'Trip4You';

    protected readonly siteUrl = 'https://trip4you.ru/toursandavia/';

    protected readonly mainPagePostMeta: ParseMetaModel = {
        tagName: 'div',
        attrName: 'card-item'
    };

    protected readonly postContentParseMeta: ParseMetaModel = {
        tagName: 'div',
        attrName: 'entry-content'
    };

    protected readonly postHeaderParseMeta: ParseMetaModel = {
        tagName: 'h1',
        attrName: 'entry-title'
    };

    protected readonly postIconParseMeta: ParseMetaModel = {
        tagName: 'img',
        attrName: 'wp-post-image'
    };

    constructor() {
        super();
    }
}
