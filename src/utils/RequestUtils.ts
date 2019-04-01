import { Request } from "express";

export const getIP = (req: Request) => <string>(req.headers['x-forwarded-for'] || req.connection.remoteAddress);