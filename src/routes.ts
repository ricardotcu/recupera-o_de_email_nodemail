import { Router, Request, Response } from 'express';
import { saveUser, getUser, login, forgoutPass } from './controller/UserController'

const routes = Router();

routes.get('/', (request: Request, response: Response) => {
    return response.json({ message: "hello World !" })
});

routes.post('/users', saveUser);
routes.get('/getUsers', getUser);
routes.post('/session', login);
routes.post('/forgout', forgoutPass);

export default routes;