import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class User {
    @PrimaryColumn({
        unique: true
    })
    id: number;

    @Column({
        nullable: true
    })
    cities: string;
}
