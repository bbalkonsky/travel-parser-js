import { getRepository } from 'typeorm';
import { User } from './entities/User';

export default class DataBaseController {
    static async createChat(chatId): Promise<void> {
        if (await this.getUser(chatId)) {
            return;
        }
        const newUser = new User();
        newUser.id = chatId;
        newUser.cities = null;
        await getRepository(User).save(newUser);
    }

    static async getAllUsers(): Promise<User[]> {
        return getRepository(User).find() ?? [];
    }

    static async getUserCities(chatId): Promise<string[]> {
        const user = await this.getUser(chatId);
        return JSON.parse(user.cities);
    }

    static async updateUserCities(chatId, cities: string): Promise<void> {
        const user = await this.getUser(chatId);
        user.cities = cities;
        await getRepository(User).save(user);
    }

    private static getUser(chatId): Promise<User> {
        return getRepository(User).findOne({
            where: {
                id: chatId,
            }
        });
    }
}
