export function transformCityName(city: string): string {
    return city.trim()
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
