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

    async subscribe(clientIP: string, ips: Array<string>, rows: number, columns: number)
    {
        const cleanedIpId = ips.sort().join("_").split(".").join("").split(":").join("");
        const identifier = `stream-${cleanedIpId}-${rows}x${columns}`;

        if (this.repository[identifier] === undefined)
        {
            const stream = await new SocketStream(identifier, this.streamProviderIP, this.port).promise;

            stream.setSettings(ips, rows, columns);
            
            this.repository[identifier] = {
                Stream: stream,
                Clients: new Array<string>(clientIP)
            };
        }
        else if (!this.repository[identifier].Clients.includes(clientIP))
        {
            this.repository[identifier].Clients.push(clientIP);
        }

        return identifier;
    }

    unsubscribe(clientIP: string)
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