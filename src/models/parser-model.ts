import ParsedPostModel from './parsed-post-model';

export default interface ParserModel {
    getNewPosts(): Promise<ParsedPostModel[]>;
}
