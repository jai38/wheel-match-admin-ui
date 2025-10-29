import { DataTypes, Model } from 'sequelize';
import type { Optional } from 'sequelize';
import sequelize from '../config/database.js';

interface AlloyDesignAttributes {
  id: number;
  name: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AlloyDesignCreationAttributes extends Optional<AlloyDesignAttributes, 'id' | 'isActive' | 'createdAt' | 'updatedAt'> { }

class AlloyDesign extends Model<AlloyDesignAttributes, AlloyDesignCreationAttributes> implements AlloyDesignAttributes {
  declare id: number;
  declare name: string;
  declare isActive: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

AlloyDesign.init(
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
    tableName: 'alloy_designs',
    timestamps: true,
  }
);

export default AlloyDesign;
