import AbstractParser from '../parsers/web/abstract-parser'
import ParseMetaModel from '../models/parse-meta-model';
import ParsedPostModel from '../models/parsed-post-model';

describe('abstract parser', () => {
    let parser;

    beforeAll(() => {
        parser = new Parser();
    });

    it('should create', () => {
        expect(parser).toBeTruthy();
    });
});

class Parser extends AbstractParser {
    protected readonly serviceName = 'Travel';
    protected readonly siteUrl = 'https://travel.site/';

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
    }

    constructor() {
        super();
    }

    public main(): Promise<ParsedPostModel[]> {
        return new Promise((resolve, reject) => {
            resolve([]);
            reject(new Error('error'));
        });
    }
}
