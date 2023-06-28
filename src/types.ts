export type User = {
    id: string,
    name: string,
    email: string,
    password: string,
    createdAt?: string
}

export type UserDB = {
    id: string,
    name:string,
    email: string,
    password:string,
    created_at: string
}

export type Product = {
    id: string,
    name: string,
    price: number,
    description: string,
    imageUrl: string
}
export type ProductDB = {
    id: string,
    name: string,
    price: number,
    description: string,
    image_url: string
}
