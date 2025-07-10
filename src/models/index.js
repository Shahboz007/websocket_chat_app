import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = {};

const files = fs.readdirSync(__dirname).filter(file =>
    file.indexOf('.') !== 0 && file !== path.basename(__filename) && file.slice(-3) === '.js'
);

for (const file of files) {
    const modelDefinition = await import(path.join('file://', __dirname, file));
    const model = modelDefinition.default(sequelize, DataTypes);
    db[model.name] = model;
}

Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = DataTypes.Sequelize;

export default db;