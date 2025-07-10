export default (sequelize, DataTypes) => {
    const Message = sequelize.define('Message', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        roomId: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
                model: 'Rooms',
                key: 'id'
            }
        },
        senderId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        senderRole: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
    })

    Message.assocate = (models) => {
        Message.belongsTo(models.Room, {foreignKey: 'roomId'})
    }

    return Message;
}