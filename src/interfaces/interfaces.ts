import * as express from 'express';

export interface Controller { }

export interface HandlerDecorator {
    (target: any, key: string, value: any): void;
}

export interface RestConfig {
    rootPath: string;
}

export interface MiddlewareConfigurator {
    (...values: any[]):  express.RequestHandler;
}

export interface MiddlewareDefinition {
    name: string;

    values: any[];
}
