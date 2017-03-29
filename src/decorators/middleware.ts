import { Bean } from '@gabliam/core';
import { addMiddlewareMetadata } from '../metadata';

export interface MiddlewareInjectOptions {
    /**
     * Name of Middleware
     */
    name: string;

    /**
     * If true, inject the Middleware after the Controller/method
     */
    after: boolean;
}

function isMiddlewareInjectOptions(obj: any): obj is MiddlewareInjectOptions {
    return typeof obj === 'object' && obj.hasOwnProperty('name') && obj.hasOwnProperty('after');
}

/**
 * MiddlewareInjectAfter decorator
 * Inject Middleware
 *
 * @param  {MiddlewareInjectOptions} options options of Middleware
 * @param  {any[]} ...values values for configuration of Middleware
 */
export function MiddlewareInject(options: MiddlewareInjectOptions, ...values: any[]);

/**
 * MiddlewareInjectAfter decorator
 * Inject Middleware
 *
 * @param  {string} name name of Middleware to inject
 * @param  {any[]} ...values values for configuration of Middleware
 */
export function MiddlewareInject(name: string, ...values: any[]);
export function MiddlewareInject(opts: any, ...values: any[]) {
    return function (target: any, key?: string) {
        let name: string = opts;
        let after: boolean = false;
        if (isMiddlewareInjectOptions(opts)) {
            ({name, after} = opts);
        }
        let realTarget = target;
        // if key != undefined then it's a property decorator
        if (key !== undefined) {
            realTarget = target.constructor;
        }
        addMiddlewareMetadata([{name, values, after}], realTarget, key);
    };
};

/**
 * MiddlewareInjectAfter decorator
 * syntax sugar
 *
 * inject the Middleware after the Controller/method
 *
 * @param  {string} name name of Middleware to inject
 * @param  {any[]} ...values values for configuration of Middleware
 */
export function MiddlewareInjectAfter(name: string, ...values: any[]) {
    return function (target: any, key?: string) {
        let after: boolean = true;
        let realTarget = target;
        // if key != undefined then it's a property decorator
        if (key !== undefined) {
            realTarget = target.constructor;
        }
        addMiddlewareMetadata([{name, values, after}], realTarget, key);
    };
}


/**
 * Create new Middleware
 *
 * @param  {string} name name of Middleware
 */
export function Middleware(name: string) {
    return Bean(`${name}Middleware`);
};
