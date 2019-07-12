"use strict"
import { objectExpression } from "babel-types"
import * as fs from "fs"
import * as yaml from "js-yaml"
import { JsonConvert, OperationMode, ValueCheckingMode } from "json2typescript"
import mongoose = require("mongoose")
import { ServerConf } from "./serverConf"

export default class ConfFactory {
    public get Conf(): ServerConf {
        return this.conf
    }

    private conf: ServerConf

    constructor() {
        const path = process.env.PH_TS_SERVER_HOME + "/conf"
        try {
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

    public generateModels(): any {
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

    public connect2MongoDB() {
        mongoose.connect("mongodb://localhost:27017/tstest", { useNewUrlParser: true }, (err) => {
            // tslint:disable-next-line:no-console
            console.log(process.env.JAVA_HOME)
        })
    }

    public generateRoutes() {
        
    }
}
