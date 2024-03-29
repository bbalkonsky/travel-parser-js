import ParsedPostModel from '../models/parsed-post-model';
import { findBigrams } from '../utils/helpers';
import stringSimilarity from 'string-similarity'

export class CityFinder {
    private static cities: string[];

    public static setCities(cities: string[]): void {
        this.cities = cities.map(city => city.toLowerCase());
    }

    public static getCities(): string[] {
        return this.cities;
    }
}

/**
 * split post content text to single words
 * @param post
 */
function splitContent(post: ParsedPostModel): string[] {
    let content = `${post.title} ${post.content}`.toLowerCase();
    content = replaceCitiesWithManyNames(content);

    // TODO to improve
    const regEqx = new RegExp(/[а-яА-Я]{2,}(?:[-а-яА-Я]{3,})?/gm);
    return content.match(regEqx);
}

/**
 * replace cities that have several name synonymous to standard name
 * @param content
 */
function replaceCitiesWithManyNames(content: string): string {
    content = replaceCity(
        content,
        'санкт-петербург',
        ['питер', 'петербург', 'ленинград', 'спб', 'северная столица']
    );
    content = replaceCity(
        content,
        'екатеринбург',
        ['свердловск', 'екб', 'ебург']
    );
    content = replaceCity(content,
        'минеральные воды',
        ['минводы']
    );
    content = replaceCity(content,
        'ростов-на-дону',
        ['ростов']
    );
    return content;
}

/**
 * replace word by substitutes list
 * @param content
 * @param city
 * @param synonyms
 */
const replaceCity = (content: string, city: string, synonyms: string[]): string => {
    const regex = new RegExp (synonyms.join('|'), 'gim');
    return content.replace(regex, city);
}

const checkWordsDistance = (city: string, word: string): boolean => {
    return stringSimilarity.compareTwoStrings(city, word) >= 0.8;
}

/**
 * find cities mentioned in the post
 * @param post
 */
export function getPostCities(post: ParsedPostModel): string[] {
    const splittedPost = splitContent(post);
    const bigrammedPost = findBigrams(splittedPost);
    const uniqueWords = [...new Set(bigrammedPost)];

    return CityFinder.getCities().reduce((acc, city) => {
        const largerWords = uniqueWords.filter(word => word.length >= city.length);
        for (const word of largerWords) {
            if (checkWordsDistance(city, word)) {
                acc.push(city);
                break;
            }
        }
        return acc;
    }, []);
}
