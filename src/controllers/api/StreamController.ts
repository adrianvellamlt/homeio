import { Request, Response, Application } from "express";
import { streamRepository } from "../../app";
import { getIP } from "../../utils/RequestUtils";

export default class StreamController {

    constructor(app: Application)
    {
        app.post("/api/stream/register", this.register);
        app.post("/api/stream/deregister", this.deregister);
    }
    
    async register(req: Request, res: Response)
    {
        const ips = <Array<string>>req.body["cam-ips"];
        const gridX = <number>req.body["grid-x"];
        const gridY = <number>req.body["grid-y"];

        const identifier = await <Promise<string>>streamRepository.register(getIP(req), ips, gridX, gridY);

        res.status(200).send(identifier);
    }

    deregister(req: Request, res: Response)
    {
        streamRepository.deregister(getIP(req));
        res.sendStatus(200).end();
    }

}