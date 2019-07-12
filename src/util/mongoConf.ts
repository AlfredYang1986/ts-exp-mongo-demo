"use strict"
import {JsonObject, JsonProperty} from "json2typescript"

@JsonObject("MongoConf")
export class MongoConf {

    @JsonProperty("host", String)
    public host: string = undefined

    @JsonProperty("port", Number)
    public port: number = undefined

    @JsonProperty("username", String)
    public username: string = undefined

    @JsonProperty("pwd", String)
    public pwd: string = undefined
}
