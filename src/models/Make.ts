import { DataTypes, Model } from 'sequelize';
import type { Optional } from 'sequelize';
import sequelize from '../config/database.js';

interface MakeAttributes {
  id: number;
  name: string;
  slug: string;
  logoUrl?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface MakeCreationAttributes extends Optional<MakeAttributes, 'id' | 'slug' | 'logoUrl' | 'isActive' | 'createdAt' | 'updatedAt'> { }

class Make extends Model<MakeAttributes, MakeCreationAttributes> implements MakeAttributes {
  declare id: number;
  declare name: string;
  declare slug: string;
  declare logoUrl?: string;
  declare isActive: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Make.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    slug: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    logoUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
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
    tableName: 'makes',
    timestamps: true,
  }
);

export default Make;
