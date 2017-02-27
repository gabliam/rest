import * as express from 'express';

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
