import * as express from 'express';
import { MiddlewareDefinition } from './interfaces';

export interface ControllerMetadata {
    path: string;
    target: any;
    json?: boolean;
}

export interface ControllerMethodMetadata extends ControllerMetadata {
    method: string;
    key: string;
}

export type MiddlewareMetadata = express.RequestHandler | MiddlewareDefinition;
