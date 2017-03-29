import { Bean } from '@gabliam/core';
import { addMiddlewareMetadata } from '../metadata';


/**
 * MiddlewareInjectAfter decorator
 * Inject Middleware
 *
 * @param  {string} name name of Middleware to inject
 * @param  {any[]} ...values values for configuration of Middleware
 */
export function MiddlewareInject(name: string, ...values: any[]) {
    return function (target: any, key?: string) {
        let realTarget = target;
        // if key != undefined then it's a property decorator
        if (key !== undefined) {
            realTarget = target.constructor;
        }
        addMiddlewareMetadata([{name, values}], realTarget, key);
    };
};

/**
 * Create new Middleware
 *
 * @param  {string} name name of Middleware
 */
export function Middleware(name: string) {
    return Bean(`${name}Middleware`);
};
