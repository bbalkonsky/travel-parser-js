import ParsedPostModel from '../models/parsed-post-model';
import ParseMetaModel from '../models/parse-meta-model';
import AbstractParser from './abstract-parser';
import UserAgent from '../services/user-agent';

export default class Trip4you extends AbstractParser{

    protected readonly siteUrl = 'https://trip4you.ru/category/toursandavia/';

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

    public async main(): Promise<ParsedPostModel[]> {
        this.options.headers['User-Agent'] = UserAgent.getRandomUserAgent();

        try {
            const response = await this.sendRequest(this.siteUrl);
            console.log('Trip4you: ', response.status)
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
