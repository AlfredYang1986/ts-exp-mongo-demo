"use strict"
import * as mongoose from "mongoose"
import { ModelType, prop, Typegoose} from "typegoose"
import IModelBase from "./modelBase"

class Place extends Typegoose implements IModelBase<Place> {
    @prop({ required: true })
    public name?: string

    public getModel() {
        return this.getModelForClass(Place)
    }
}

export default Place
