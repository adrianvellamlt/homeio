import { Socket } from "net";
import { io } from "../server";

export default class SocketStream
{
    identifier: string;
    io: SocketIO.Server;
    ip: string;
    port: number;
    frame?: string;
    clientsocket?: Socket;
    interval: any;
    promise: Promise<SocketStream>;

    constructor(identifier: string, ip: string, port: number)
    {
        this.identifier = identifier;
        this.io = io;
        this.ip = ip;
        this.port = port;
        this.clientsocket = undefined;
        this.frame = undefined;

        this.promise = this.init();

        this.interval = setInterval(() => {
            if (this.frame !== undefined) { 
                this.io.of(`/${identifier}`).emit("frame", this.frame);
            }
        }, 1000 / this.FPS);
    }

    private init = () => 
        new Promise<SocketStream>((resolve, reject) => {
            const clientsocket = new Socket();
            const b64Signature = "data:image/jpeg;base64,";

            let imageBuffer = "";

            clientsocket.connect(this.port, this.ip, () => {
                console.log(`Connected to server at ${this.ip}:${this.port}`);
                resolve(this);
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
                reject(err);
            });
            
            clientsocket.on("close", () => {
                console.log("Connection dropped");
            });

            this.clientsocket = clientsocket;
        });

    get FPS() { return 10; };

    setSettings (streamIPs: Array<string>, rows: number, columns: number) 
    {
        if (this.clientsocket === undefined) return;

        const settings = `${streamIPs.join(",")}|${rows}x${columns}\r`;
        (<Socket>this.clientsocket).write(settings);
    }
}