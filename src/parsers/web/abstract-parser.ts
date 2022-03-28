import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Element } from 'domhandler';
import * as parser from 'htmlparser2';
import * as domutils from 'domutils';
import ParsedPostModel from '../../models/parsed-post-model';
import ParseMetaModel from '../../models/parse-meta-model';
import UserAgent from '../../services/user-agent';
import { flatBlock, getBlocksByAttr, getFirstBlockByTagAndAttr } from '../../utils/parser-helpers';
import ParserModel from '../../models/parser-model';

export default abstract class AbstractParser implements ParserModel{

    protected abstract readonly serviceName: string;
    protected abstract readonly siteUrl: string;
    protected options: AxiosRequestConfig = {
        headers: {
            'User-Agent': undefined
        }
    };

    protected abstract readonly mainPagePostMeta: ParseMetaModel;
    protected abstract readonly postContentParseMeta: ParseMetaModel;
    protected abstract readonly postHeaderParseMeta: ParseMetaModel;
    protected abstract readonly postIconParseMeta: ParseMetaModel;

    protected lastPost: string = undefined;
    protected posts: Element[] = [];

    /**
     * get data by url
     * @param url
     * @protected
     */
    protected async sendRequest(url: string): Promise<AxiosResponse> {
        return await axios.get(url, this.options);
    }

    /**
     * parse posts from main page to elements array
     * @param mainPage
     * @param parseMeta
     * @protected
     */
    protected getPostsByPage(mainPage: string, parseMeta: ParseMetaModel): Element[] {
        const dom = parser.parseDocument(mainPage);
        const pageDivs: Element[] = flatBlock(dom.children);
        return getBlocksByAttr(pageDivs, parseMeta.tagName, parseMeta.attrName);
    }

    /**
     * get links list for new posts
     * @protected
     */
    protected getNewPostsLinks(): string[] {
        const newPosts = [];
        for (const post of this.posts) {
            const postLink = this.findPostLink(post);
            if (postLink === this.lastPost) {
                break;
            } else {
                newPosts.push(postLink);
            }
        }
        return newPosts;
    }

    /**
     * get concrete post url-address
     * @param post
     * @protected
     */
    protected findPostLink(post: Element): string {
        const postChildren = flatBlock(post.children)
        for (const child of postChildren) {
            if (child.type === 'tag' && child.name === 'a') {
                return child.attribs.href;
            }
        }
    }

    /**
     * get ParsedPostModel objects array for post list
     * @param posts
     * @protected
     */
    protected async getPostsContent(posts: string[]): Promise<ParsedPostModel[]> {
        const postsContent = [];
        for (const postUrl of posts) {
            const postContent = await this.sendRequest(postUrl);
            const parsedContent = this.parsePostContent(
                postContent.data,
                this.postContentParseMeta,
                this.postHeaderParseMeta
            );
            parsedContent.url = postUrl;
            postsContent.push(parsedContent);
        }
        return postsContent;
    }

    /**
     * get ParsedPostModel object for concrete post
     * @param data
     * @param contentMeta
     * @param headerMeta
     * @protected
     */
    protected parsePostContent(data: string, contentMeta: ParseMetaModel, headerMeta: ParseMetaModel): ParsedPostModel {
        const dom = parser.parseDocument(data);
        const pageDivs: Element[] = flatBlock(dom.children);
        const contentBlocks = getBlocksByAttr(pageDivs, contentMeta.tagName, contentMeta.attrName);

        const title = domutils.getText(getBlocksByAttr(pageDivs, headerMeta.tagName, headerMeta.attrName));
        const content = domutils.getText(contentBlocks);
        const image = this.getPostIcon(pageDivs);

        return {
            title,
            content,
            url: '',
            image,
            serviceName: this.serviceName
        };
    }

    /**
     * get post image
     * @param pageDivs
     * @protected
     */
    protected getPostIcon(pageDivs: Element[]): string {
        const iconBlock = getFirstBlockByTagAndAttr(
            pageDivs,
            this.postIconParseMeta.tagName,
            this.postIconParseMeta.attrName
        );
        return iconBlock?.attribs?.src ?? '';
    }

    public async getNewPosts(): Promise<ParsedPostModel[]> {
        this.options.headers['User-Agent'] = UserAgent.getRandomUserAgent();

        try {
            const response = await this.sendRequest(this.siteUrl);
            this.posts = this.getPostsByPage(response.data, this.mainPagePostMeta);
            if (!this.lastPost && this.posts.length) {
                this.lastPost = this.findPostLink(this.posts[0]);
                return new Promise(() => null);
            } else {
                const newPosts = this.getNewPostsLinks();
                if (newPosts[0]) {
                    this.lastPost = newPosts[0];
                }
                return this.getPostsContent(newPosts);
            }
        } catch (error) {
            console.log(error);
        }
    }
}
