import { DataTypes, Model } from 'sequelize';
import type { Optional } from 'sequelize';
import sequelize from '../config/database.js';
import Make from './Make.js';

interface CarModelAttributes {
  id: number;
  makeId: number;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CarModelCreationAttributes extends Optional<CarModelAttributes, 'id' | 'slug' | 'isActive' | 'createdAt' | 'updatedAt'> { }

class CarModel extends Model<CarModelAttributes, CarModelCreationAttributes> implements CarModelAttributes {
  declare id: number;
  declare makeId: number;
  declare name: string;
  declare slug: string;
  declare isActive: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

CarModel.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    makeId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'makes',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(100),
      allowNull: false,
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
    tableName: 'car_models',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['makeId', 'name'],
        name: 'unique_make_model',
      },
    ],
  }
);

// Define relationships
Make.hasMany(CarModel, {
  foreignKey: 'makeId',
  as: 'models',
});

CarModel.belongsTo(Make, {
  foreignKey: 'makeId',
  as: 'make',
});

export default CarModel;
