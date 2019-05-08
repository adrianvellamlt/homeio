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
                // { selected: true, ip: "raspione", port:"8089", text: "Raspi One" },
                { selected: true, ip: "192.168.1.120", port:"8089", text: "Raspi Two" },
                { selected: false, ip: "192.168.1.119", port:"8089", text: "Raspi Three" },
                { selected: false, ip: "192.168.1.118", port:"8089", text: "Raspi Four" }
            ],
            gridShape: { x: 1, y: 1 },
        });
    }

}