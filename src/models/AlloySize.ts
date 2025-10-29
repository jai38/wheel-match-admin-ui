import { DataTypes, Model } from 'sequelize';
import type { Optional } from 'sequelize';
import sequelize from '../config/database.js';

interface AlloySizeAttributes {
  id: number;
  diameter: number;
  width: number;
  offset: number | null;
  specs: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AlloySizeCreationAttributes extends Optional<AlloySizeAttributes, 'id' | 'offset' | 'isActive' | 'createdAt' | 'updatedAt'> { }

class AlloySize extends Model<AlloySizeAttributes, AlloySizeCreationAttributes> implements AlloySizeAttributes {
  declare id: number;
  declare diameter: number;
  declare width: number;
  declare offset: number | null;
  declare specs: string;
  declare isActive: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

AlloySize.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    diameter: {
      type: DataTypes.DECIMAL(4, 1),
      allowNull: false,
      comment: 'Diameter in inches (e.g., 17.0, 18.5)',
    },
    width: {
      type: DataTypes.DECIMAL(4, 1),
      allowNull: false,
      comment: 'Width in inches (e.g., 8.0, 9.5)',
    },
    offset: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Offset in mm (e.g., 35, 45), optional',
    },
    specs: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: 'Display specs (e.g., "17x8", "18x9.5 ET45")',
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
    tableName: 'alloy_sizes',
    timestamps: true,
    indexes: [
      {
        fields: ['diameter'],
        name: 'idx_diameter',
      },
      {
        fields: ['width'],
        name: 'idx_width',
      },
    ],
  }
);

export default AlloySize;
