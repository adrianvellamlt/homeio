import { Socket } from "net";
import * as SocketIO from "socket.io";

import server from "../server";

export default class SocketStream
{
    identifier: string;
    io: SocketIO.Server;
    ip: string;
    port: number;
    frame?: string;
    clientsocket?: Socket;
    interval: any;

    constructor(identifier: string, ip: string, port: number)
    {
        this.identifier = identifier;
        this.io = SocketIO(server);
        this.ip = ip;
        this.port = port;
        this.clientsocket = undefined;
        this.frame = undefined;

        this.init();

        this.interval = setInterval(() => {
            if (this.frame !== undefined) { 
                this.io.of(`/stream-${identifier}`).emit("frame", this.frame);
            }
        }, 1000 / this.FPS);
    }

    private init () {
        const clientsocket = new Socket();
        const b64Signature = "data:image/jpeg;base64,";

        let imageBuffer = "";

        clientsocket.connect(this.port, this.ip, () => {
            console.log(`Connected to server at ${this.ip}:${this.port}`);
        });
        
        clientsocket.on("data", (data: Buffer) => {
            const stringified = data.toString();
            
            const split = (imageBuffer + stringified).split(b64Signature).filter(str => str !== "");

            if (split.length > 2)
            {
                for (let i = 0; i < split.length - 2; i ++)
                {
                    this.frame = b64Signature + split[i];
                }
                imageBuffer = b64Signature + split.slice(split.length - 2).join(b64Signature);
            }
            else imageBuffer = b64Signature + split.join(b64Signature);
        });

        clientsocket.on("error", (err: Error) => {
            console.log("Exception raised: ", err.toString());
        });
        
        clientsocket.on("close", () => {
            console.log("Connection dropped");
        });

        this.clientsocket = clientsocket;
    }

    get FPS() { return 30; };
}