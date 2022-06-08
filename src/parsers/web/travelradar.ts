import ParseMetaModel from '../../models/parse-meta-model';
import AbstractParser from './abstract-parser';

export default class Travelradar extends AbstractParser{

    protected readonly serviceName = 'TravelRadar';

    protected readonly siteUrl = 'https://travelradar.world/';

    protected readonly mainPagePostMeta: ParseMetaModel = {
        tagName: 'article',
        attrName: 'type-post'
    };

    protected readonly postContentParseMeta: ParseMetaModel = {
        tagName: 'div',
        attrName: 'entry-inner'
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
