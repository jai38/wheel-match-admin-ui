import { DataTypes, Model } from 'sequelize';
import type { Optional } from 'sequelize';
import sequelize from '../config/database.js';
import CarModel from './CarModel.js';

interface VariantAttributes {
  id: number;
  modelId: number;
  name: string;
  defaultAlloySize: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface VariantCreationAttributes extends Optional<VariantAttributes, 'id' | 'isActive' | 'createdAt' | 'updatedAt'> { }

class Variant extends Model<VariantAttributes, VariantCreationAttributes> implements VariantAttributes {
  declare id: number;
  declare modelId: number;
  declare name: string;
  declare defaultAlloySize: number;
  declare isActive: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Variant.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    modelId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'car_models',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    defaultAlloySize: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: false,
      validate: {
        min: 10.0,
        max: 30.0,
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
    tableName: 'variants',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['modelId', 'name'],
        name: 'unique_model_variant',
      },
    ],
  }
);

// Define relationships
CarModel.hasMany(Variant, {
  foreignKey: 'modelId',
  as: 'variants',
});

Variant.belongsTo(CarModel, {
  foreignKey: 'modelId',
  as: 'model',
});

export default Variant;
