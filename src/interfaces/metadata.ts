import * as express from 'express';
import { MiddlewareDefinition } from './interfaces';

export interface ControllerMetadata {
    path: string;
    middlewares: express.RequestHandler[];
    target: any;
    json?: boolean;
}

export interface ControllerMethodMetadata extends ControllerMetadata {
    method: string;
    key: string;
}

export interface MiddlewareMetadata {
    target: any;

    key: string;

    middlewares: (express.RequestHandler | MiddlewareDefinition)[];
}
