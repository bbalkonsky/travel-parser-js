import { CityFinder, getPostCities } from '../services/city-finder';
import ParsedPostModel from '../models/parsed-post-model';

describe('helpers', () => {
    it('should hehe', () => {
        jest.spyOn(CityFinder, 'getCities').mockReturnValue(['москва', 'курск']);
        const post: ParsedPostModel = {
            title: 'москвы',
            content: 'курс доллара',
            url: '',
            image: '',
            serviceName: ''
        };
        expect(getPostCities(post)).toEqual(['москва']);
    });
});
