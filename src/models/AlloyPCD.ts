import { DataTypes, Model } from 'sequelize';
import type { Optional } from 'sequelize';
import sequelize from '../config/database.js';

interface AlloyPCDAttributes {
  id: number;
  name: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AlloyPCDCreationAttributes extends Optional<AlloyPCDAttributes, 'id' | 'isActive' | 'createdAt' | 'updatedAt'> { }

class AlloyPCD extends Model<AlloyPCDAttributes, AlloyPCDCreationAttributes> implements AlloyPCDAttributes {
  declare id: number;
  declare name: string;
  declare isActive: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

AlloyPCD.init(
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
    tableName: 'alloy_pcds',
    timestamps: true,
  }
);

export default AlloyPCD;
