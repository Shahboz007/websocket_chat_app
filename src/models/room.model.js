export default (sequelize, DataTypes) => {
    const Room = sequelize.define('Room', {
        id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
            references: {
                model: 'Users',
                key: 'id'
            },
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: 'active',
        }
    })

    Room.associate = (models) => {
        Room.hasMany(models.Message, {
            foreignKey: 'roomId',
            onDelete: 'CASCADE',
        })

        Room.belongsTo(models.User, {foreignKey: 'userId'})
    }

    return Room;
}