import { Request, Response, Application } from "express";

export default class ViewController {

    constructor(app: Application)
    {
        app.get("/", this.main);
        app.get("/live", this.live);
    }

    main (req: Request, res: Response) {
        res.render("index", { 
            title: "Overview"
        });
    }

    live (req: Request, res: Response)
    {
        res.render("live", {
            title: "Live"
        });
    }

}