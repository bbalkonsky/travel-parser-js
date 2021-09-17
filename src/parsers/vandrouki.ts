import ParsedPostModel from '../models/parsed-post-model';
import ParseMetaModel from '../models/parse-meta-model';
import UserAgent from '../services/user-agent';
import AbstractParser from './abstract-parser';

export default class Vandrouki extends AbstractParser{

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
    }

    constructor() {
        super();
    }

    public async main(): Promise<ParsedPostModel[]> {
        this.options.headers['User-Agent'] = UserAgent.getRandomUserAgent();

        try {
            const response = await this.sendRequest(this.siteUrl);
            console.log('Vandrouki: ', response.status)
            this.posts = this.getPostsByPage(response.data, this.mainPagePostMeta);
            if (!this.lastPost && this.posts.length) {
                this.lastPost = this.findPostLink(this.posts[0]);
                return new Promise(() => null);
            } else {
                const newPosts = this.getNewPostsLinks();
                this.lastPost = newPosts[0];
                return await this.getPostsContent(newPosts);
            }
        } catch (error) {
            console.log(error);
        }
    }
}
