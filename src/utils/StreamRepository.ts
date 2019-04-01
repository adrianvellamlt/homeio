import { Socket } from "net";
import SocketStream from "./SocketStream";

export default class StreamRepository
{
    port: number;
    streamProviderIP: string;
    repository: { 
        [key: string]: { 
            Stream: SocketStream, 
            Clients: Array<string> 
        } 
    };

    constructor(streamProviderIP: string, port: number){
        this.repository = {}
        this.port = port;
        this.streamProviderIP = streamProviderIP;
    }

    register(clientIP: string, ips: Array<string>, gridX: number, gridY: number)
    {
        const identifier = `${ips.sort().join("_").split(".").join("")}-${gridX}x${gridY}`;

        if (this.repository[identifier] === undefined)
        {
            this.repository[identifier] = {
                Stream: new SocketStream(identifier, this.streamProviderIP, this.port),
                Clients: new Array<string>(clientIP)
            };
        }
        else this.repository[identifier].Clients.push(clientIP);
    }

    deregister(clientIP: string)
    {
        for(let identifier in this.repository)
        {
            if (this.repository[identifier].Clients.includes(clientIP))
            {
                this.repository[identifier].Clients = this.repository[identifier]
                    .Clients.filter(x => x !== clientIP);

                if (this.repository[identifier].Clients.length === 0)
                {
                    clearInterval(this.repository[identifier].Stream.interval);
                    (<Socket>this.repository[identifier].Stream.clientsocket).destroy();
                    delete this.repository[identifier];
                }
            }

        }
    }
}