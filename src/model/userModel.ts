import {User} from "@prisma/client"

export type DeleteUserRequest = {
    confirm: boolean
    replacement_user_id?: number | undefined
}

export type DeleteUserPreviewResponse = {
    user: UserResponse
    active_activities: number
    requires_replacement: boolean
}

export type UserResponse = {
    id: number
    username: string
    name: string
    jenis_kel: string
    email: string
    no_hp: string
    alamat: string
    role: string
    token?: string
}

export type CreateUserRequest = {
    username: string
    password: string
    name: string
    jenis_kel: string
    email: string
    no_hp: string
    alamat: string
    role: string
}

export type LoginUserRequest = {
    username: string
    password: string
}

export function toUserResponse(user:User): UserResponse {
    return {
        id: user.id,
        username: user.username,
        name: user.name,
        jenis_kel: user.jenis_kel,
        email: user.email,
        no_hp: user.no_hp,
        alamat: user.alamat,
        role: user.role,
    }
}

export type UpdateUserRequest = {
    username?: string | undefined
    password?: string | undefined
    name?: string | undefined
    jenis_kel?: string | undefined
    email?: string | undefined
    no_hp?: string | undefined
    alamat?: string | undefined
    role?: string | undefined
}

export type UpdateCurrentUserRequest = Omit<UpdateUserRequest, "role">
