import { Sequelize } from 'sequelize';
import { env } from '../utils/env.js';
import { DATABASE } from './constants.js';

const sequelize = new Sequelize({
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  dialect: 'mysql',
  logging: env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: DATABASE.POOL.MAX,
    min: DATABASE.POOL.MIN,
    acquire: DATABASE.POOL.ACQUIRE,
    idle: DATABASE.POOL.IDLE,
  },
  define: {
    timestamps: true,
    underscored: false,
    freezeTableName: true,
  },
});

export default sequelize;
