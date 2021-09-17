import { getRandomInt } from '../utils/helpers';

export default abstract class UserAgent {

    private static userAgents: string[];

    public static setUserAgentList(userAgents: string[]): void {
        UserAgent.userAgents = userAgents;
    }

    public static getRandomUserAgent(): string {
        return UserAgent.userAgents[getRandomInt(UserAgent.userAgents.length - 1)];
    }
}
