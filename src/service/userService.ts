import { CreateUserRequest, UserResponse, toUserResponse, LoginUserRequest, UpdateUserRequest, UpdateCurrentUserRequest} from "../model/userModel";
import { Validation } from "../validation/validation";
import { UserValidation } from "../validation/userValidation";
import {prismaClient} from "../application/db";
import {ResponseError} from "../error/responseError"
import bcrypt from "bcrypt"
import { randomUUID } from "node:crypto"
import { User } from "@prisma/client";

export class UserService {

    static async delete(id: number, currentUser: User): Promise<UserResponse> {
        const userId = Validation.validate(UserValidation.DELETE, id)

        const user = await prismaClient.user.findUnique({
            where: {
                id: userId
            }
        })

        if (!user) {
            throw new ResponseError(404, "User not found")
        }

        if (user.id === currentUser.id) {
            throw new ResponseError(409, "You cannot delete your own account")
        }

        if (user.role === "ADMIN") {
            const totalAdmins = await prismaClient.user.count({where: {role: "ADMIN"}})
            if (totalAdmins <= 1) {
                throw new ResponseError(409, "The last ADMIN cannot be deleted")
            }
        }

        const result = await prismaClient.user.delete({
            where: {
                id: userId
            }
        })

        return toUserResponse(result)
    }

    static async register(request: CreateUserRequest) : Promise<UserResponse>{
        const registerRequest = Validation.validate(UserValidation.REGISTER, request)

        const totalUserWithSameUsername = await prismaClient.user.count({
            where:{
                username: registerRequest.username
            }
        })

        if(totalUserWithSameUsername != 0) {
            throw new ResponseError(409, "Username already exists")
        }

        const totalUserWithSameEmail = await prismaClient.user.count({
            where: { email: registerRequest.email }
        })
        if (totalUserWithSameEmail > 0) {
            throw new ResponseError(409, "Email already exists")
        }

        registerRequest.password = await bcrypt.hash(registerRequest.password,10)

        const user = await prismaClient.user.create({
            data: registerRequest
        })

        return toUserResponse(user)

    }

    static async login(request: LoginUserRequest) : Promise<UserResponse>{
        const loginRequest = Validation.validate(UserValidation.LOGIN, request)

        const user = await prismaClient.user.findUnique({
            where:{
                username: loginRequest.username
            }
        })
        if(!user){
            throw new ResponseError(401, "username or password is incorrect")
        }

        const isPasswordValid = await bcrypt.compare(loginRequest.password, user.password)
        if(!isPasswordValid){
            throw new ResponseError(401, "username or password is incorrect")
        }

        const updatedUser = await prismaClient.user.update({
            where: {
                username: user.username
            },
            data: {
                token: randomUUID()
            }
        })

        const response =  toUserResponse(updatedUser)
        response.token = updatedUser.token!
        return response
    }

    static async getAll(): Promise<UserResponse[]> {
        const users = await prismaClient.user.findMany({
            orderBy: { id: "asc" }
        })
        return users.map(toUserResponse)
    }

    static async getById(id: number): Promise<UserResponse> {
        const userId = Validation.validate(UserValidation.ID, id)
        const user = await prismaClient.user.findUnique({where: {id: userId}})
        if (!user) {
            throw new ResponseError(404, "User not found")
        }
        return toUserResponse(user)
    }

    static async updateById(id: number, request: UpdateUserRequest): Promise<UserResponse> {
        const userId = Validation.validate(UserValidation.ID, id)
        const user = await prismaClient.user.findUnique({where: {id: userId}})
        if (!user) {
            throw new ResponseError(404, "User not found")
        }
        return this.update(user, request)
    }

    static async updateCurrent(user: User, request: UpdateCurrentUserRequest): Promise<UserResponse> {
        const updateRequest = Validation.validate(UserValidation.UPDATE_CURRENT, request)
        return this.update(user, updateRequest)
    }

    static async get(user: User): Promise<UserResponse> {
        return toUserResponse(user)
    }

    static async update(user: User, request: UpdateUserRequest): Promise<UserResponse> {
        const updateRequest = Validation.validate(UserValidation.UPDATE, request)
      
        if (updateRequest.username !== undefined) {
            const totalUsers = await prismaClient.user.count({
                where: { username: updateRequest.username, NOT: { id: user.id } }
            })
            if (totalUsers > 0) {
                throw new ResponseError(409, "Username already exists")
            }
        }
        if (updateRequest.email !== undefined) {
            const totalUsers = await prismaClient.user.count({
                where: { email: updateRequest.email, NOT: { id: user.id } }
            })
            if (totalUsers > 0) {
                throw new ResponseError(409, "Email already exists")
            }
        }
        if (user.role === "ADMIN" && updateRequest.role === "STAF") {
            const totalAdmins = await prismaClient.user.count({where: {role: "ADMIN"}})
            if (totalAdmins <= 1) {
                throw new ResponseError(409, "The last ADMIN cannot be changed to STAF")
            }
        }

        if (updateRequest.username) {
            user.username = updateRequest.username.toString()
        }
        if (updateRequest.password) {
            user.password = await bcrypt.hash(updateRequest.password.toString(), 10)
        }
        if (updateRequest.name) {
            user.name = updateRequest.name.toString()
        }
        if (updateRequest.jenis_kel) {
            user.jenis_kel = updateRequest.jenis_kel.toString()
        }
        if (updateRequest.email) {
            user.email = updateRequest.email.toString()
        }
        if (updateRequest.no_hp) {
            user.no_hp = updateRequest.no_hp.toString()
        }
        if (updateRequest.alamat) {
            user.alamat = updateRequest.alamat.toString()
        }
        if (updateRequest.role) {
            user.role = updateRequest.role.toString()
        }

        const result = await prismaClient.user.update({
            where: {
                id: user.id
            },
            data: {
                username: user.username,
                password: user.password,
                name: user.name,
                jenis_kel: user.jenis_kel,
                email: user.email,
                no_hp: user.no_hp,
                alamat: user.alamat,
                ...(updateRequest.role !== undefined ? {role: user.role} : {})
            }
        })

        return toUserResponse(result)

    }

     static async logout(user: User): Promise<UserResponse> {

        const result = await prismaClient.user.update({
            where: {
                id: user.id
            },
            data: {
                token: null
            }
        })

        return toUserResponse(result)

    }


}
