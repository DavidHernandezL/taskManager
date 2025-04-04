import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';

import User from '../models/User.js';

import { createAccessToken, verifyAccessToken } from '../utils/jwt.js';

const login = async (req: Request, res: Response): Promise<any> => {
    try {
        const { username, password } = req.body;
        const userFounded = await User.findOne({ username });

        if (!userFounded) {
            return res
                .status(400)
                .json({ status: 'error', msg: 'Usuario o contraseña incorrectos.' });
        }

        const isMatch = bcrypt.compareSync(password, userFounded.password);

        if (!isMatch) {
            return res
                .status(400)
                .json({ status: 'error', msg: 'Usuario o contraseña incorrectos.' });
        }

        const token = await createAccessToken({ id: userFounded._id }, '1h');

        return res.json({
            status: 'success',
            msg: 'Usuario autenticado',
            data: userFounded.toJSON(),
            token,
        });
    } catch (error) {
        return res.status(500).json({
            msg: 'Fallo en el servidor',
        });
    }
};

const verifyToken = async (req: Request, res: Response): Promise<any> => {
    const { token } = req.headers;

    if (!token) {
        return res.status(401).json({ status: 'error', msg: 'Token no válido' });
    }

    try {
        const { id } = await verifyAccessToken(token as string);
        const userFounded = await User.findById(id);

        if (!userFounded) {
            return res.status(401).json({ status: 'error', msg: 'Token no válido' });
        }

        res.json({ status: 'OK', msg: 'Token válido', data: userFounded.toJSON() });
    } catch (error) {
        return res.status(401).json({ status: 'error', msg: 'Token no válido' });
    }
};

export { login, verifyToken };