import { DataTypes, Model } from 'sequelize';
import type { Optional } from 'sequelize';
import sequelize from '../config/database.js';
import Variant from './Variant.js';
import Color from './Color.js';

interface CarAttributes {
  id: number;
  variantId: number;
  colorId: number;
  carImage: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CarCreationAttributes extends Optional<CarAttributes, 'id' | 'isActive' | 'createdAt' | 'updatedAt'> { }

class Car extends Model<CarAttributes, CarCreationAttributes> implements CarAttributes {
  declare id: number;
  declare variantId: number;
  declare colorId: number;
  declare carImage: string;
  declare isActive: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Car.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    variantId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'variants',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    colorId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'colors',
        key: 'id',
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
    carImage: {
      type: DataTypes.STRING(500),
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
    tableName: 'cars',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['variantId', 'colorId'],
        name: 'unique_variant_color',
      },
    ],
  }
);

// Define relationships
Variant.hasMany(Car, {
  foreignKey: 'variantId',
  as: 'cars',
});

Car.belongsTo(Variant, {
  foreignKey: 'variantId',
  as: 'variant',
});

Color.hasMany(Car, {
  foreignKey: 'colorId',
  as: 'cars',
});

Car.belongsTo(Color, {
  foreignKey: 'colorId',
  as: 'color',
});

export default Car;
