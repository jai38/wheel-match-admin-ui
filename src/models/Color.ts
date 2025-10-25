import { DataTypes, Model } from 'sequelize';
import type { Optional } from 'sequelize';
import sequelize from '../config/database.js';

interface ColorAttributes {
  id: number;
  name: string;
  colorCode: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ColorCreationAttributes extends Optional<ColorAttributes, 'id' | 'isActive' | 'createdAt' | 'updatedAt'> { }

class Color extends Model<ColorAttributes, ColorCreationAttributes> implements ColorAttributes {
  declare id: number;
  declare name: string;
  declare colorCode: string;
  declare isActive: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Color.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    colorCode: {
      type: DataTypes.STRING(7),
      allowNull: false,
      validate: {
        is: /^#[0-9A-F]{6}$/i,
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'colors',
    timestamps: true,
  }
);

export default Color;
