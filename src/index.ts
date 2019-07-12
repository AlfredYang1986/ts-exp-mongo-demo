import express from "express"
import API from "json-api"
import ConfFactory from "./util/confFactory"

const app = express()
const port = 8080 // default port to listen

const tmp = new ConfFactory()
tmp.connect2MongoDB()

const registry = new API.ResourceTypeRegistry({
        people: {},
        places: {}
    }, {
    dbAdapter: new API.dbAdapters.Mongoose(tmp.generateModels()),
    urlTemplates: {
        self: "/{type}/{id}"
    }
})

const Front = new API.httpStrategies.Express(
    new API.controllers.API(registry),
    new API.controllers.Documentation(registry, {name: "Pharbers API"})
)

app.get("/", Front.docsRequest)

// Add routes for basic list, read, create, update, delete operations
app.get("/:type(people|places)", Front.apiRequest)
app.get("/:type(people|places)/:id", Front.apiRequest)
app.post("/:type(people|places)", Front.apiRequest)
app.patch("/:type(people|places)/:id", Front.apiRequest)
app.delete("/:type(people|places)/:id", Front.apiRequest)

// Add routes for adding to, removing from, or updating resource relationships
app.post("/:type(people)/:id/relationships/:relationship", Front.apiRequest)
app.patch("/:type(people)/:id/relationships/:relationship", Front.apiRequest)
app.delete("/:type(people)/:id/relationships/:relationship", Front.apiRequest)

// start the Express server
app.listen( port, () => {
    // tslint:disable-next-line:no-console
    console.log( `server started at http://localhost:${ port }` )
} )
