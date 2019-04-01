import * as path from "path";
import { json, urlencoded } from "body-parser";
import * as compression from "compression";

import express = require("express");
import * as session from "express-session"; //todo: implement session
import expressValidator = require("express-validator");
import handlebars = require("express-handlebars");

import StreamController from "./controllers/api/StreamController";
import ViewController from "./controllers/ViewController";
import StreamRepository from "./utils/StreamRepository";

const app = express();

app.engine('handlebars', handlebars({
    defaultLayout: 'main',
    extname: '.handlebars',
    layoutsDir: path.join(__dirname, '../views/layouts'),
    helpers: {
        section: function(name: string, options: any) { 
          if (!this._sections) this._sections = {};
            this._sections[name] = options.fn(this); 
            return null;
        }
    }
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, '../views'));

app.use(express.static("public"));

app.use(compression());
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(expressValidator());

app.set("port", process.env.PORT || 3000);

new StreamController(app);
new ViewController(app);

export const streamRepository = new StreamRepository("10.0.75.1", 8080);

export default app;