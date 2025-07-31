const { StatusCodes } = require('http-status-codes')
const AppError = require('../utils/errors/app-error')
const { UserRepository, RoleRepository } = require('../repositories')
const {AUTH, Enums} = require('../utils/common')

const userRepo = new UserRepository()
const roleRepo = new RoleRepository()

async function create(data) {
    try {
        const user = await userRepo.create(data)
        const role = await roleRepo.getRoleByName(Enums.USER_ROLES_ENUMS.CUSTOMER)
        user.addRole(role)
        return user
    }
    catch (error) {
        if (error.name == 'SequelizeValidationError' || error.name == 'SequelizeUniqueConstraintError') {
            let explanation = []
            error.errors.forEach((err) => {
                explanation.push(err.message)
            })
            throw new AppError(explanation, StatusCodes.BAD_REQUEST)
        }
        throw new AppError('Cannot create a new user object', StatusCodes.INTERNAL_SERVER_ERROR)
    }
}

async function signin(data) {
    try {
        const user = await userRepo.getUserByEmail(data.email)
        if (!user) {
            throw new AppError('No user found for the given email', StatusCodes.NOT_FOUND)
        }

        const passwordMatch = AUTH.checkPassword(data.password, user.password)
        if (!passwordMatch) {
            throw new AppError('Invalid Password', StatusCodes.BAD_REQUEST)
        }

        const jwt = AUTH.createToken({ id: user.id, email: user.email })
        return jwt
    } catch (error) {
        if(error instanceof AppError) throw error
        console.log(error)
        throw new AppError('Something went wrong', StatusCodes.INTERNAL_SERVER_ERROR)
    }
}

async function isAuthenticated(token) {
    try {
        if (!token) {
            throw new AppError('Missing jwt token', StatusCodes.INTERNAL_SERVER_ERROR)
        }
        const response = AUTH.verifyToken(token)
        const user = userRepo.get(response.id)
        if (!user) {
            throw new AppError('No user found', StatusCodes.INTERNAL_SERVER_ERROR)
        }
        return response.id
    } catch (error) {
        if (error instanceof AppError) throw error
        if (error.name == 'JsonWebTokenError') {
            throw new AppError('Invalid jwt Token', StatusCodes.BAD_REQUEST)
        }
        if (error.name == 'TokenExpiredError') {
            throw new AppError('Token has expired', StatusCodes.BAD_REQUEST)
        }
        console.log(error)
        throw new AppError('Something went wrong', StatusCodes.INTERNAL_SERVER_ERROR)
    }
}

module.exports = {
    create,
    signin,
    isAuthenticated
}