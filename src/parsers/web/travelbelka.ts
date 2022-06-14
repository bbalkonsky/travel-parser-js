import ParseMetaModel from '../../models/parse-meta-model';
import AbstractParser from './abstract-parser';
import { Element } from 'domhandler';
import { getFirstBlockByTagAndAttr } from '../../utils/parser-helpers';

export default class Travelbelka extends AbstractParser{

    protected readonly serviceName = 'TravelBelka';

    protected readonly siteUrl = 'https://95.217.72.240/category/aviabilety/';

    protected readonly mainPagePostMeta: ParseMetaModel = {
        tagName: 'div',
        attrName: 'td-block-span4'
    };

    protected readonly postContentParseMeta: ParseMetaModel = {
        tagName: 'div',
        attrName: 'td-post-content'
    };

    protected readonly postHeaderParseMeta: ParseMetaModel = {
        tagName: 'h1',
        attrName: 'entry-title'
    };

    protected readonly postIconParseMeta: ParseMetaModel = {
        tagName: 'img',
        attrName: 'entry-thumb'
    };

    constructor() {
        super();
        this.options.headers.Host = 'travelbelka.ru';
        // this.options.headers.rejectUnauthorized = false;
    }

    protected getPostIcon(pageDivs: Element[]): string {
        const iconBlock = getFirstBlockByTagAndAttr(
            pageDivs,
            this.postIconParseMeta.tagName,
            this.postIconParseMeta.attrName
        );
        return iconBlock?.attribs?.['data-src'] ?? '';
    }
}
