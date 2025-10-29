import { DataTypes, Model } from 'sequelize';
import type { Optional } from 'sequelize';
import sequelize from '../config/database.js';
import AlloyDesign from './AlloyDesign.js';
import AlloyPCD from './AlloyPCD.js';
import AlloyFinish from './AlloyFinish.js';
import AlloySize from './AlloySize.js';

interface AlloyAttributes {
  id: number;
  designId: number;
  pcdId: number;
  finishId: number;
  sizeId: number;
  alloyName: string;
  alloyImages: string[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AlloyCreationAttributes extends Optional<AlloyAttributes, 'id' | 'alloyName' | 'isActive' | 'createdAt' | 'updatedAt'> { }

class Alloy extends Model<AlloyAttributes, AlloyCreationAttributes> implements AlloyAttributes {
  declare id: number;
  declare designId: number;
  declare pcdId: number;
  declare finishId: number;
  declare sizeId: number;
  declare alloyName: string;
  declare alloyImages: string[];
  declare isActive: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Alloy.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    designId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'alloy_designs',
        key: 'id',
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
    pcdId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'alloy_pcds',
        key: 'id',
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
    finishId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'alloy_finishes',
        key: 'id',
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
    sizeId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'alloy_sizes',
        key: 'id',
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
    alloyName: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: 'Auto-generated: {specs} {design} {pcd} {finish}',
    },
    alloyImages: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      comment: 'Array of image URLs',
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
    tableName: 'alloys',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['designId', 'pcdId', 'finishId', 'sizeId'],
        name: 'unique_alloy_combination',
      },
      {
        fields: ['alloyName'],
        name: 'idx_alloy_name',
      },
    ],
  }
);

// Define relationships
AlloyDesign.hasMany(Alloy, {
  foreignKey: 'designId',
  as: 'alloys',
});

Alloy.belongsTo(AlloyDesign, {
  foreignKey: 'designId',
  as: 'design',
});

AlloyPCD.hasMany(Alloy, {
  foreignKey: 'pcdId',
  as: 'alloys',
});

Alloy.belongsTo(AlloyPCD, {
  foreignKey: 'pcdId',
  as: 'pcd',
});

AlloyFinish.hasMany(Alloy, {
  foreignKey: 'finishId',
  as: 'alloys',
});

Alloy.belongsTo(AlloyFinish, {
  foreignKey: 'finishId',
  as: 'finish',
});

AlloySize.hasMany(Alloy, {
  foreignKey: 'sizeId',
  as: 'alloys',
});

Alloy.belongsTo(AlloySize, {
  foreignKey: 'sizeId',
  as: 'size',
});

export default Alloy;
