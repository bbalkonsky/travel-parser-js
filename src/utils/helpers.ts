import ParsedPostModel from '../models/parsed-post-model';
import { getPostCities } from '../services/city-finder';
import PreparedPostModel from '../models/prepared-post-model';

export function transformCityName(cities: string[]): string[] {
    const transformed = [];

    for (const city of cities) {
        const splitted = city.split(/[-\s]/);
        if (splitted.length === 1) {
            transformed.push(`#${city.charAt(0).toUpperCase() + city.slice(1)}`);
        }
        else {
            splitted.forEach((word, idx) => splitted[idx] = word.charAt(0).toUpperCase() + word.slice(1));
            transformed.push(`#${splitted.join('')}`);
        }
    }

    return transformed;
}

export function getRandomInt(max: number, min = 0): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function findBigrams(words: string[]): string[] {
    const result = [...words];
    words.forEach((word, idx) => {
        if (idx < words.length - 1 && !word.includes('-') && !words[idx + 1].includes('-')) {
            result.push(`${word} ${words[idx + 1]}`);
        }
    });
    return result;
}

export function createPostMessage(post: ParsedPostModel): PreparedPostModel {
    const postCities = getPostCities(post);
    // const hashCities = transformCityName(postCities);

    // return `${hashCities.join(' ')}\n\n${post.title}`;
    return {
        title: post.title,
        cities: postCities,
    };
}
