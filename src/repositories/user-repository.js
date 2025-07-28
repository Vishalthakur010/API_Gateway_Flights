const crudRepository = require('./crud-repository')
const { User } = require('../models')

class UserRepository extends crudRepository {
    constructor() {
        super(User)
    }

    async getUserByEmail(email){
        const user = User.findOne({where:{email : email}})
        return user
    }
}

module.exports = UserRepository