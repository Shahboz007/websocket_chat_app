import "dotenv/config"
import {Sequelize} from "sequelize";

const dbUrl = process.env.DATABASE_URL

if(!dbUrl){
    throw new Error("DATABASE_URL environment variable is not defined!")
}

export const sequelize = new Sequelize(dbUrl, {
    dialect: 'postgres',
    logging: false,
})

try{
    await  sequelize.authenticate()
    console.log('Database connection has been established successfully')
}catch (error){
    console.error("Unable to connect to the database:", error)
}
