import { Sequelize, DataTypes, Model } from 'sequelize';
import path from 'path';

export const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '..', 'database.sqlite'),
    logging: false,
});

export class Entry extends Model {
    public id!: string;
    public user_id!: string;
    public raw_text!: string;
    public sentiment!: 'Positive' | 'Negative' | 'Neutral';
    public emotion_type!: string;
    public confidence!: number;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Entry.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: 'anonymous',
        },
        raw_text: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        sentiment: {
            type: DataTypes.ENUM('Positive', 'Negative', 'Neutral'),
            allowNull: false,
        },
        emotion_type: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        confidence: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: 'Entry',
        tableName: 'entries',
        timestamps: true, // provides createdAt which satisfies created_at requirements
    }
);
