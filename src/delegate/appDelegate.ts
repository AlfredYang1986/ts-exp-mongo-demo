"use strict"
import { objectExpression } from "babel-types"
import express from "express"
import * as fs from "fs"
import * as yaml from "js-yaml"
import API, { ResourceTypeRegistry } from "json-api"
import { JsonConvert, OperationMode, ValueCheckingMode } from "json2typescript"
import mongoose = require("mongoose")
import { ServerConf } from "../configFactory/serverConf"

export default class AppDelegate {
    public get Conf(): ServerConf {
        return this.conf
    }

    private conf: ServerConf
    private app = express()

    public exec() {
        this.loadConfiguration()
        this.connect2MongoDB()
        this.generateRoutes(this.getModelRegistry())
        this.listen2Port(8080)
    }

    protected loadConfiguration() {
        try {
            const path = process.env.PH_TS_SERVER_HOME + "/conf"
            const jsonConvert: JsonConvert = new JsonConvert()
            const doc = yaml.safeLoad(fs.readFileSync(path + "/server.yml", "utf8"))
            // jsonConvert.operationMode = OperationMode.LOGGING // print some debug data
            jsonConvert.ignorePrimitiveChecks = false // don't allow assigning number to string etc.
            jsonConvert.valueCheckingMode = ValueCheckingMode.DISALLOW_NULL // never allow null
            this.conf = jsonConvert.deserializeObject(doc, ServerConf)
          } catch (e) {
            // tslint:disable-next-line:no-console
            console.log(e as Error)
          }
    }

    protected generateModels(): any {
        const prefix = "/dist/models/"
        const path = process.env.PH_TS_SERVER_HOME + prefix
        const suffix = ".js"
        const result: {[index: string]: any} = {}
        this.conf.models.forEach((ele) => {
                const filename = path + ele.file + suffix
                const one = require(filename).default
                result[ele.file] = new one().getModel()
            })
        return result
    }

    protected connect2MongoDB() {
        const prefix = "mongodb"
        const host = this.conf.mongo.host
        const port = `${this.conf.mongo.port}`
        // const username = this.conf.mongo.username
        // const pwd = this.conf.mongo.pwd
        const coll = this.conf.mongo.coll
        mongoose.connect(prefix + "://" + host + ":" + port + "/" + coll, { useNewUrlParser: true }, (err) => {
            // tslint:disable-next-line:no-console
            console.log(process.env.JAVA_HOME)
        })
    }

    protected getModelRegistry(): ResourceTypeRegistry {
        const result: {[index: string]: any} = {}
        this.conf.models.forEach((ele) => {
            result[ele.reg] = {}
        })
        return new API.ResourceTypeRegistry(result, {
            dbAdapter: new API.dbAdapters.Mongoose(this.generateModels()),
            urlTemplates: {
                self: "/{type}/{id}"
            }
        })
    }

    protected generateRoutes(registry: ResourceTypeRegistry) {
        const Front = new API.httpStrategies.Express(
            new API.controllers.API(registry),
            new API.controllers.Documentation(registry, {name: "Pharbers API"})
        )

        // this.app.get("/", Front.docsRequest)
        const perfix = "/:type"
        const ms = this.conf.models.map((x) => x.reg).join("|")
        const suffix = "/:id"

        const all = perfix + "(" + ms + ")"
        const one = all + suffix
        const relation = one + "/relationships/:relationship" 

        // Add routes for basic list, read, create, update, delete operations
        this.app.get(all, Front.apiRequest)
        this.app.get(one, Front.apiRequest)
        this.app.post(all, Front.apiRequest)
        this.app.patch(one, Front.apiRequest)
        this.app.delete(one, Front.apiRequest)

        // Add routes for adding to, removing from, or updating resource relationships
        this.app.post(relation, Front.apiRequest)
        this.app.patch(relation, Front.apiRequest)
        this.app.delete(relation, Front.apiRequest)
    }

    protected listen2Port(port: number) {
        // start the Express server
        this.app.listen( port, () => {
            // tslint:disable-next-line:no-console
            console.log( `server started at http://localhost:${ port }` )
        } )
    }
}
