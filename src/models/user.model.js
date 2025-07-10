export default (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    })

    User.associate = (models) => {
        User.hasOne(models.Room, {
            foreignKey: 'userId',
            as: 'room',
            onDelete: 'CASCADE',
        })
    }

    return User;
}