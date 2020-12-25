import { Request } from "express";

export type ControllerInputAdapter<T> = (req: Request) => T;
