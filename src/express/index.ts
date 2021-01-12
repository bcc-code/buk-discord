import express from 'express';
import fileUpload from 'express-fileupload';
import bodyParser from 'body-parser';
import config from '../config';
import apiFunctions from './functions';
import path from 'path';

interface PostFunction {
    type: string;
    data: string;
}

export default async function (): Promise<void> {
    const app = express();

    app.use(bodyParser.json());

    app.use(
        fileUpload({
            limits: { fileSize: 50 * 1024 * 1024 },
        })
    );

    app.use((req, res, next) => {
        // require every request to have an authorization header
        if (['/dms','/favicon.ico', '/'].includes(req.path)) return next();
        if (req.headers.authorization) {
            const parts = req.headers.authorization.trim().split(' ')
            const accessToken = parts.pop()
            if (config.express.auth.tokens.includes(accessToken)) {
                next();
            }
        } else {
            console.log(req.hostname, req.path, req.originalUrl)
            res.status(401)
            return next('NOT AUTHORIZED')
        }
    });

    app.listen(config.express.port, () => {
        console.log(`EXPRESS SERVER RUNNING ON PORT ${config.express.port}`);
    });

    // app.post('/:type/:data', async (req, res) => {
    //     const type = req.params?.type;
    //     const data = req.params?.data;
    //     if (!Object.keys(postFunctions).includes(type)) return res.json("INVALID REQUEST");
    //     const auth = config.express.auth;
    //     if (req.headers.Authorization === `Bearer ${auth.token}`) {
    //         const result = await postFunctions[type]?.(data);
    //         res.json(result);
    //     } else {
    //         res.json("AUTH FAILED");
    //     }
    // });

    // app.post('/member', async (req, res) => {
    //     const request = req.body as PostFunction;
    //     const auth = config.express.auth;

    //     if (req.headers.authorization === `Basic ${auth.token}`) {
    //         res.status(200);
    //         const result =
    //             (await apiFunctions[request.type]?.(request.data)) ||
    //             (() => {
    //                 res.status(400);
    //                 return { response: 'INVALID REQUEST' };
    //             })();
    //         res.json(result.response);
    //     } else {
    //         res.json('AUTH FAILED').status(400);
    //     }
    // });

    app.post('/Update', async (req, res) => {
        const user = req.body as Player;
        res.json((await apiFunctions.Update(user)).response);
    });

    app.get('/dms', async (req, res) => {
        res.sendFile(path.join(__dirname, '../../index.html'));
    });

    app.get('/dms/:token', async (req, res) => {
        if (config.express.auth.tokens.includes(req.params.token)) {
            const result= (await apiFunctions.GetDms()).response;
            res.json(result);
        }
    })

    app.get('/Search/:string', async (req, res) => {
        const string = req.params.string as string;
        res.json((await apiFunctions.Search(string)).response);
    });

    app.get('/IsConnected/:string', async (req, res) => {
        const string = req.params.string as string;
        res.json((await apiFunctions.IsConnected(string)).response);
    });

    app.post('/Sync', async (req, res) => {
        const player = req.body.player;
        const organizations = req.body.organizations;
        res.json(await apiFunctions.Sync(player, organizations));
    });

    // app.post('/upload', async (req, res) => {
    //     if (req.headers.authorization !== `Basic 123456`)
    //         return res.status(401).send('Unauthorized');
    //     if (!req.files || Object.keys(req.files).length === 0) {
    //         return res.status(400).send('No files were uploaded.');
    //     }
    //     const file = (req.files as any).file;
    //     file.mv(`${__dirname}/../../tmp/${file.name}`, (err: any) => {
    //         if (err) return res.status(500).send(err);
    //         res.send('FILE UPLOADED');
    //     });
    // });

    app.get('/:type/:data', async (req, res) => {
        const type = req.params?.type;
        const data = req.params?.data;
        const auth = config.express.auth;
        if (auth.tokens.includes(req.headers.authorization?.split(" ")[1]) && type) {
            const result = await apiFunctions[type]?.(data) || { response: "INVALID REQUEST" };
            res.json(result.response);
        } else {
            res.json("AUTH FAILED");
        }
    });

    app.get('/', async (req, res) => {
        res.sendFile(path.join(__dirname, '../../index.html'));
    });
}
