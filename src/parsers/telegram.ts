import ParserModel from '../models/parser-model';
import ParsedPostModel from '../models/parsed-post-model';
import UserAgent from '../services/user-agent';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import ParseMetaModel from '../models/parse-meta-model';
import { Element } from 'domhandler';
import * as parser from 'htmlparser2';
import { flatBlock, getBlocksByAttr, getFirstBlockByTagAndAttr } from '../utils/parser-helpers';
import * as domutils from 'domutils';

export default class TelegramParser implements ParserModel {

    protected readonly serviceName = 'Telegram';
    protected readonly siteUrl: string = 'https://t.me/s/lentachold';
    protected options: AxiosRequestConfig = {
        headers: {
            'User-Agent': undefined
        }
    };

    protected readonly mainPagePostMeta: ParseMetaModel = {
        tagName: 'div',
        attrName: 'tgme_widget_message_wrap'
    };

    protected readonly postIconParseMeta: ParseMetaModel = {
        tagName: 'a',
        attrName: 'tgme_widget_message_photo_wrap'
    };

    protected lastPost = '';
    protected posts: Element[] = [];

    protected async sendRequest(url: string): Promise<AxiosResponse> {
        return await axios.get(url, this.options);
    }

    protected getPostsByPage(mainPage: string, parseMeta: ParseMetaModel): Element[] {
        const dom = parser.parseDocument(mainPage);
        const pageDivs: Element[] = flatBlock(dom.children);
        return getBlocksByAttr(pageDivs, parseMeta.tagName, parseMeta.attrName);
    }

    protected findPostLink(post: Element): string {
        const postChildren = flatBlock(post.children)
        for (const child of postChildren) {
            if (child.type === 'tag' && child.name === 'a' && child.attribs?.class?.split(' ').includes('tgme_widget_message_date')) {
                return child.attribs.href;
            }
        }
    }

    private filterNewPosts(): number {
        return this.posts.findIndex(post => this.findPostLink(post) === this.lastPost);
    }

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

    protected parsePostContent2(post): ParsedPostModel {
        const postChildren = flatBlock(post.children);

        let image = '';
        for (const child of postChildren) {
            if (child.type === 'tag' && child.name === 'a' && child.attribs?.class?.split(' ').includes('tgme_widget_message_photo_wrap')) {
                const parsedUrl = /(?<=\(').+(?='\))/gm.exec(child.attribs.style);
                if (parsedUrl) {
                    image = parsedUrl[0];
                }
                break;
            }
        }

        let title;
        for (const child of postChildren) {
            if (child.type === 'tag' && child.name === 'div' && child.attribs?.class?.split(' ').includes('tgme_widget_message_text')) {
                title = child.children.reduce((prev, curr) => {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    return curr.type === 'text' ? `${prev}\n${curr.data}` : prev;
                }, '');
                break;
            }
        }

        return {
            title,
            content: title,
            url: this.findPostLink(post),
            image,
            serviceName: this.serviceName
        };
    }

    protected getPostIcon(pageDivs: Element[]): string {
        const iconBlock = getFirstBlockByTagAndAttr(
            pageDivs,
            this.postIconParseMeta.tagName,
            this.postIconParseMeta.attrName
        );

        console.log(iconBlock)
        return iconBlock?.attribs?.src ?? '';
    }

    protected async getPostsContent(posts: string[]): Promise<ParsedPostModel[]> {
        const postsContent = [];
        for (const postUrl of posts) {
            // try {
            //     const postContent = await this.sendRequest(postUrl);
            //     const parsedContent = this.parsePostContent(
            //         postContent.data,
            //         this.postContentParseMeta,
            //         this.postHeaderParseMeta
            //     );
            //     parsedContent.url = postUrl;
            //     postsContent.push(parsedContent);
            // } catch (e) {
            //     console.log(`Error while getting post content (${postUrl}): ${e}`);
            // }
        }
        return postsContent;
    }

    public async getNewPosts(): Promise<ParsedPostModel[]> {
        this.options.headers['User-Agent'] = UserAgent.getRandomUserAgent();

        try {
            const response = await this.sendRequest(this.siteUrl);
            this.posts = this.getPostsByPage(response.data, this.mainPagePostMeta);
            this.posts.reverse();
            if (!this.lastPost && this.posts.length) {
                this.lastPost = this.findPostLink(this.posts[0]);
                return new Promise(() => null);
            } else {
                const newPosts = this.posts.slice(0, this.filterNewPosts());
                if (newPosts.length) {
                    const newPostsContent = [];
                    newPosts.forEach(post => {
                        newPostsContent.push(this.parsePostContent2(post));
                    });
                    this.lastPost = this.findPostLink(newPosts[0]);
                    return newPostsContent;
                } else {
                    return [];
                }
            }
        } catch (e) {
            console.log(`Error while getting new posts (${e.config?.url ?? ''}): ${e}`);
            return [];
        }
    }
}
