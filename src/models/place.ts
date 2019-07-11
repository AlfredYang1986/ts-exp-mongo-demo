"use strict";
import { prop, Typegoose} from "typegoose";

export class Place extends Typegoose {
    @prop({ required: true })
    public name?: string;
}

export const PlaceModel = new Place().getModelForClass(Place);
