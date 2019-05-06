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
            title: "Live",
            streamList: [
                { selected: true, ip: "raspione", port:"8089", text: "Raspi One" },
                { selected: false, ip: "raspitwo", port:"8089", text: "Raspi Two" },
                { selected: true, ip: "raspithree", port:"8089", text: "Raspi Three" },
                { selected: false, ip: "raspifour", port:"8089", text: "Raspi Four" }
            ],
            gridShape: { x: 2, y: 2 },
        });
    }

}