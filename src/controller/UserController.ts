import { FindOperator, getRepository } from "typeorm";
import { Request, Response } from "express";
import { User } from "../entity/User";
import * as nodemailer from 'nodemailer';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

export const saveUser = async (req: Request, res: Response) => {
    const { nome, email, senha } = req.body;
    
    try {
        const senhaHash = await bcrypt.hash(senha, 8);

        const user = await getRepository(User).save({
            nome,
            email,
            senha: senhaHash
        });
        
        return res.status(201).json(user);

    } catch (err) {
        return res.status(402).json({message: "erro user controller"})
    }
}

export const getUser = async (req: Request, res: Response) => {
   
    const users = await getRepository(User).find();

    return res.json(users);

}


export const login = async (req: Request, res: Response) => {
    const { email, senha } = req.body;
    
    try {

        const user = await getRepository(User).find({
            where: {
                email
            }
        });

        if (await bcrypt.compare(senha, user[0].senha)) {
            const data = {
                id: user[0].id,
                nome: user[0].nome,
                email: user[0].email
            }
            
            return res.json(data);
        } else {
            return res.status(404).json({messge: "erro no login controler"})
        }

    } catch (err) {
        return res.status(402).json({message: "erro user controller"})
    }
}

export const forgoutPass = async (req: Request, res: Response) => {
    const { email } = req.body;
    
    try {

        const user = await getRepository(User).find({
            where: {
                email
            }
        });

        const transporte = nodemailer.createTransport({
            host: "smtp.mailtrap.io",
            port: 2525,
            auth: {
                user: "28b78cc0f74aae",
                pass: "e1c2632ca9942b"
            }
        });

        const novaSenha = crypto.randomBytes(4).toString('HEX')
        
        transporte.sendMail({
            from: 'administrador <dc1d1eeef9-eb0505@inbox.mailtrap.io>',
            to: email,
            subject: "recuperação de senha",
            html: `<p>óla, sua nova senha para acessar o sistema: ${novaSenha} </p><br /><a href="localhost:3333/session">sistema</a>`
        }).then(
            () => {
                bcrypt.hash(novaSenha, 8).then(
                    senha => {
                        getRepository(User).update(user[0].id, {
                            senha
                        }).then(
                            () => {
                                return res.status(200).json({message: "email enviado"})
                            }
                        ).catch(
                            () => {
                                return res.status(404).json({message: "user not found"})
                            }
                        )
                    }
                )

                
            }
        ).catch(
            () => {
                return res.status(404).json({message: "erro send email"})           
            }
        )

    } catch (err) {
        return res.status(402).json({message: "erro user controller"})
    }
}