import express, { Request, Response } from 'express';
import cors from 'cors';
import { db } from './database/knex';
import { Product, ProductDB, Purchase, User, UserDB } from './types';

const app = express();
app.use(express.json());
app.use(cors());

app.listen(3003, () => {
    console.log("server rodando na porta 3003");

});

app.get("/users", async (req: Request, res: Response) => {
    try {
        const userData: UserDB[] = await db("users")
        const response: User[] = userData.map((user) => {
            return {
                id: user.id,
                name: user.name,
                email: user.email,
                password: user.password,
                createdAt: user.created_at
            }
        })

        res.status(200).send(response)

    } catch (error: any) {
        res.status(400).send(error.message)
    }
})

app.post("/users", async (req: Request, res: Response) => {
    try {
        const { id, name, email, password } = req.body
        if (!id || !name || !email || !password) {
            throw new Error("É nescessário informar 'id', 'name', 'email' e 'password'")
        };

        if (typeof id !== "string" || typeof name !== "string" || typeof email !== "string" || typeof password !== "string") {
            throw new Error("Tipos de id, name, email e password, precisam ser string")
        };

        const [idExist] = await db("users").where({ id })
        if (idExist) {
            throw new Error("id já existe")
        };
        const [emailExist] = await db("users").where({ email })
        if (emailExist) {
            throw new Error("Email já cadastrado")
        };
        if (name.length < 3) {
            throw new Error("Nome precisa ser ao menos 3 caracteres")
        };
        const newUser: User = {
            id,
            name,
            email,
            password
        };

        await db("users").insert(newUser);

        res.status(201).send({ message: "Cadastro realizado com sucesso" });
    } catch (error: any) {
        res.status(400).send(error.message)

    }
})

app.get("/products", async (req: Request, res: Response) => {
    try {
        const name: string = req.query.name as string
        let productData: ProductDB[];
        if (name) {
            productData = await db("products").whereLike("name", `%${name}%`)
        } else {
            productData = await db("products")
        }


        const response: Product[] = productData.map((product) => {
            return {
                id: product.id,
                name: product.name,
                price: product.price,
                description: product.description,
                imageUrl: product.image_url
            }
        })
        res.status(200).send(response)
    } catch (error: any) {
        res.status(400).send(error.message)

    }
})

app.post("/products", async (req: Request, res: Response) => {
    try {
        const { id, name, price, description, imageUrl }: Product = req.body

        if (!id || !name || !price || !description || !imageUrl) {
            throw new Error("É nescessário informar id, name, price, description, e imageUrl para criar um produto")
        }
        if (typeof id !== "string" || typeof name !== "string" || typeof price !== "number" || typeof description !== "string" || typeof imageUrl !== "string") {
            throw new Error("Os tipos de dados de id, name, description imageUrl devem ser string e price deve ser number")
        }
        const [idExist] = await db("products").where({ id })
        if (idExist) {
            throw new Error("Id de produto já cadastrado")
        }
        const newProduct: ProductDB = {
            id,
            name,
            price,
            description,
            image_url: imageUrl
        }
        await db("products").insert(newProduct)

        res.status(201).send({ message: "Produto cadastrado com sucesso" })
    } catch (error: any) {
        res.status(400).send(error.message)

    }
})

app.put("/products/:id", async (req: Request, res: Response) => {
    try {
        const idToEdit: string = req.params.id
        const { id, name, price, description, imageUrl }: Product = req.body


        if (id) {
            if (typeof id !== "string") {
                throw new Error("tipo de dado de id precisa ser string")
            }
        }
        if (name) {
            if (typeof name !== "string") {
                throw new Error("tipo de dado de id precisa ser string")
            }
        }
        if (price) {
            if (typeof price !== "number") {
                throw new Error("tipo de dado de id precisa ser number")
            }
        }
        if (description) {
            if (typeof description !== "string") {
                throw new Error("tipo de dado de id precisa ser string")
            }

            if (imageUrl) {
                if (typeof imageUrl !== "string") {
                    throw new Error("tipo de dado de id precisa ser string")
                }
            }
        }
        const [productToEdit]: ProductDB[] = await db("products").where({ id: idToEdit })

        if (!productToEdit) {
            throw new Error("Id não existe ou é invalido")
        }

        const newProduct: ProductDB = {
            id: id || productToEdit.id,
            name: name || productToEdit.name,
            price: price || productToEdit.price,
            description: description || productToEdit.description,
            image_url: imageUrl || productToEdit.image_url
        }

        await db("products").update(newProduct).where({ id: idToEdit })

        res.status(200).send("produto atualizado com sucesso")
    } catch (error: any) {
        res.status(400).send(error.message)
    }
})

app.post("/purchases", async (req: Request, res: Response) => {
    try {
        const { id, buyer, products }: Purchase = req.body

        if (!id || !buyer || !products) {
            throw new Error("É nescessário passar as informações de id, buyer e products")
        }
        if (typeof id !== 'string' || typeof buyer !== 'string') {
            throw new Error('Tipos de dados de id e buyer precisam ser string')
        }
        const productsIsArray = Array.isArray(products)
        if (productsIsArray === false) {
            throw new Error("Products precisa ser um array")
        }
        const [idValid] = await db("purchases").where({ id })
        if (idValid) {
            throw new Error("Id de usuario já em uso")
        }
        const [buyerExist] = await db("users").where({ id: buyer })
        if (!buyerExist) {
            throw new Error("Id de usuário inválido")
        }
        const productsIds = products.map(prod => prod.id)

        const productsExists: ProductDB[] = await db('products').whereIn("id", productsIds)

        if (products.length > productsExists.length) {
            throw new Error("Verifique os ids de compra dos produtos")
        }
        const totalPrice = productsExists.map((product) => {
            const productToSum = products.find(prod => prod.id === product.id)

            if (productToSum) {
                return product.price * productToSum.quantity
            }
            return 0
        }).reduce((total, price) => total + price, 0)

        const newPurchase = {
            id,
            buyer,
            total_price: totalPrice
        }

        await db("purchases").insert(newPurchase)

        await db("purchases_products").insert(products.map((prod) => ({
            purchase_id: id,
            product_id: prod.id,
            quantity: prod.quantity
        })))
        res.status(200).send({ message: "Pedido realizado com sucesso" })

    } catch (error: any) {
        res.status(400).send(error.message)
    }
})
app.get("/purchases/:id", async (req: Request, res: Response) => {
    try {

        const id = req.params.id

        const [idExist] = await db("purchases").where({ id })
        if (!idExist) {
            throw new Error("id de compra inválido")
        }

        const purchaseResponse = await db("purchases AS pur").select(
            "pur.id AS purchaseId",
            "u.id AS buyerId",
            "u.name as buyerName",
            "u.email AS buyerEmail",
            "pur.total_price AS  totalPrice",
            "pur.created_at AS createdAt"
        )
            .innerJoin("users as u", "u.id", "=", "pur.buyer")
            .where("pur.id", "=", id)

        const productResponse = await db("products AS pro")
        .select(
            "pro.id AS id",
            "pro.name AS name",
            "pro.price AS price",
            "pro.description AS description",
            "pro.image_url AS imageUrl",
            "pur.quantity AS quantity"
        )
        .innerJoin("purchases_products AS  pur", "pur.product_id", "=", "pro.id")
        .where("pur.purchase_id", "=", id)

        const result = {...purchaseResponse[0], products: [...productResponse]}
            res.status(200).send(result)
    } catch (error: any) {
        res.status(400).send(error.message)
    }
})

app.delete("/purchases/:id", async (req: Request, res: Response) => {
    try {
        const id = req.params.id
        const [idExist] = await db("purchases").where({ id })
        if (!id) {
            throw new Error("Id da compra inválido")
        }
        await db("purchases_products").del().where({ purchase_id: id })
        await db("purchases").del().where({ id })
        res.status(200).send({ message: "Pedido cancelado com sucesso" })

    } catch (error: any) {
        res.status(400).send(error.message)
    }
})
