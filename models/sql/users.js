module.exports = (database, DataTypes) => {
    return database.define("users", {
        username: DataTypes.STRING,
        password: DataTypes.STRING,
        name: DataTypes.STRING,
        email: DataTypes.STRING,
        phone1: DataTypes.STRING,
        phone2: DataTypes.STRING,
        resetPasswordToken: DataTypes.STRING,
        resetPasswordExpires:DataTypes.STRING
    })
};