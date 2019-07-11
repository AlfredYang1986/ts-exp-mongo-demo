import express from "express";
import API from "json-api";
import mongoose = require("mongoose");
import { PersonModel as Person } from "./models/Person";
import { PlaceModel as Place } from "./models/Place";

const app = express();
const port = 8080; // default port to listen

mongoose.connect("mongodb://localhost:27017/tstest", { useNewUrlParser: true }, (err) => {
    // tslint:disable-next-line:no-console
    console.log(err);
});

const models = {
    Person,
    Place
};

const adapter = new API.dbAdapters.Mongoose(models);
const registry = new API.ResourceTypeRegistry({
        people: {},
        places: {}
    }, {
    dbAdapter: adapter,
    urlTemplates: {
        self: "/{type}/{id}"
    }
});

// const opts = { host: 'api.pharbers.com' };

const Front = new API.httpStrategies.Express(
    new API.controllers.API(registry),
    new API.controllers.Documentation(registry, {name: "Pharbers API"})
);

app.get("/", Front.docsRequest);

// Add routes for basic list, read, create, update, delete operations
app.get("/:type(people|places)", Front.apiRequest);
app.get("/:type(people|places)/:id", Front.apiRequest);
app.post("/:type(people|places)", Front.apiRequest);
app.patch("/:type(people|places)/:id", Front.apiRequest);
app.delete("/:type(people|places)/:id", Front.apiRequest);

// Add routes for adding to, removing from, or updating resource relationships
app.post("/:type(people)/:id/relationships/:relationship", Front.apiRequest);
app.patch("/:type(people)/:id/relationships/:relationship", Front.apiRequest);
app.delete("/:type(people)/:id/relationships/:relationship", Front.apiRequest);

// start the Express server
app.listen( port, () => {
    // tslint:disable-next-line:no-console
    console.log( `server started at http://localhost:${ port }` );
} );
