import ParseMetaModel from '../../models/parse-meta-model';
import AbstractParser from './abstract-parser';

export default class Vandrouki extends AbstractParser {

    protected readonly serviceName = 'Vandrouki';

    protected readonly siteUrl = 'https://vandrouki.ru/';

    protected readonly mainPagePostMeta: ParseMetaModel = {
        tagName: 'div',
        attrName: 'post'
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
