import ParserModel from '../models/parser-model';
import ParsedPostModel from '../models/parsed-post-model';
import UserAgent from '../services/user-agent';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import ParseMetaModel from '../models/parse-meta-model';
import { Element } from 'domhandler';
import * as parser from 'htmlparser2';
import { flatBlock, getBlocksByAttr } from '../utils/parser-helpers';

export default class TelegramParser implements ParserModel {

    protected readonly serviceName = 'TG: TicketsTurkey';
    protected readonly siteUrl: string = 'https://t.me/s/TicketsTurkey';
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
            if (child.type === 'tag' && child.name === 'a' && child.attribs?.class?.split(' ')
                .includes('tgme_widget_message_date')) {
                    return child.attribs.href;
                }
        }
    }

    private filterNewPosts(): number {
        return this.posts.findIndex(post => this.findPostLink(post) === this.lastPost);
    }

    protected parsePostContent(post): ParsedPostModel {
        const postChildren = flatBlock(post.children);

        let image = '';
        for (const child of postChildren) {
            if (child.type === 'tag' && child.name === 'a' && child.attribs?.class?.split(' ')
                .includes('tgme_widget_message_photo_wrap')) {
                    const parsedUrl = /(?<=\(').+(?='\))/gm.exec(child.attribs.style);
                    if (parsedUrl) {
                        image = parsedUrl[0];
                    }
                    break;
                }
        }

        let title;
        for (const child of postChildren) {
            if (child.type === 'tag' && child.name === 'div' && child.attribs?.class?.split(' ')
                .includes('tgme_widget_message_text')) {
                    title = child.children.reduce((prev, curr) => {
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        switch (curr.name) {
                            case 'br':
                                return `${prev}\n`;
                            case 'b':
                                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                // @ts-ignore
                                return `${prev}<b>${curr.children[0].data}</b>`;
                            case 'i':
                                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                // @ts-ignore
                                return `${prev}${curr.children[0].children[0].data}`;
                            case 'a':
                                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                // @ts-ignore
                                // eslint-disable-next-line max-len
                                return `${prev}<a href='${curr.attribs.href}'>${curr.children[0]?.data ?? curr.attribs.href}</a>`;
                            default:
                                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                // @ts-ignore
                                return `${prev}${curr.data}`;
                        }
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
                        newPostsContent.push(this.parsePostContent(post));
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
