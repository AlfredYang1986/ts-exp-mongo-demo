"use strict";
import { prop, Ref, Typegoose } from "typegoose";
import { Place } from "./place";

class Person extends Typegoose {
    @prop({ required: true })
    public name?: string;

    @prop({ required: true })
    public age: number;

    @prop({ ref: Place, required: true })
    public place: Ref<Place>;
}

export const PersonModel = new Person().getModelForClass(Person);
