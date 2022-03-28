import ParseMetaModel from '../../models/parse-meta-model';
import AbstractParser from './abstract-parser';

export default class Pirates extends AbstractParser{

    protected readonly serviceName = 'Pirates travel';

    protected readonly siteUrl = 'https://ru.pirates.travel/';

    protected readonly mainPagePostMeta: ParseMetaModel = {
        tagName: 'article',
        attrName: 'item-list'
    };

    protected readonly postContentParseMeta: ParseMetaModel = {
        tagName: 'div',
        attrName: 'entry'
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
