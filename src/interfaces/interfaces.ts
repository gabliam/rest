import * as express from 'express';

export interface Controller { }

export interface HandlerDecorator {
    (target: any, key: string, value: any): void;
}

export interface RestConfig {
    rootPath: string;
}

export interface MiddlewareConfigurator {
    (...values: any[]):  express.RequestHandler | express.RequestHandler[] | express.ErrorRequestHandler | express.ErrorRequestHandler[];
}

export interface MiddlewareDefinition {
    name: string;

    values: any[];

    after: boolean;
}

export interface MiddlewareConfiguration {
    before: (express.RequestHandler| express.ErrorRequestHandler)[];

    after: (express.RequestHandler| express.ErrorRequestHandler)[];
}
