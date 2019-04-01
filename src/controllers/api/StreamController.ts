import { Request, Response, Application } from "express";
import { streamRepository } from "../../app";
import { getIP } from "../../utils/RequestUtils";

export default class StreamController {

    constructor(app: Application)
    {
        app.post("/api/stream/register", this.register);
        app.delete("/api/stream/register", this.deregister);
    }
    
    register(req: Request, res: Response)
    {
        const ips = req.body["cam-ips"];
        const gridX = req.body["grid-x"];
        const gridY = req.body["grid-y"];

        streamRepository.register(getIP(req), ips, gridX, gridY);

        res.sendStatus(200).end();
    }

    deregister(req: Request, res: Response)
    {
        streamRepository.deregister(getIP(req));
        res.sendStatus(200).end();
    }

}