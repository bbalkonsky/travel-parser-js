import { findBigrams, getRandomInt, transformCityName } from '../utils/helpers';

describe('helpers', () => {
    it('should transform array to bigrams', () => {
        const input = ['this', 'is', 'superb', 'test'];
        const bigrams = ['this', 'is', 'superb', 'test', 'this is', 'is superb', 'superb test'];
        expect(findBigrams(input)).toStrictEqual(bigrams);
    });

    it('should generate random number less than 100', () => {
       expect(getRandomInt(100)).toBeLessThanOrEqual(100);
    });

    it('should transform cities names', () => {
        expect(transformCityName(['москва', 'санкт-петербург'])).toEqual(['#Москва', '#СанктПетербург']);
    });
});
