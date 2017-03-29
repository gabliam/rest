import { inversifyInterfaces } from '@gabliam/core';
import { MiddlewareMetadata, MiddlewareConfigurator, MiddlewareConfiguration } from '../interfaces';
import { METADATA_KEY } from '../constants';
import { isMiddlewareDefinition } from '../utils';

export function addMiddlewareMetadata(middlewares: MiddlewareMetadata[], target: Object, key?: string) {
    let metadataList: MiddlewareMetadata[] = [];

    if (!Reflect.hasOwnMetadata(METADATA_KEY.middleware, target, key)) {
        Reflect.defineMetadata(METADATA_KEY.middleware, metadataList, target, key);
    } else {
        metadataList = Reflect.getOwnMetadata(METADATA_KEY.middleware, target, key);
    }

    metadataList.push(...middlewares);
}

export function getMiddlewares(
    container: inversifyInterfaces.Container,
    target: Object,
    key?: string
): MiddlewareConfiguration {
    let metadataList: MiddlewareMetadata[] = [];
    if (Reflect.hasOwnMetadata(METADATA_KEY.middleware, target, key)) {
        metadataList = Reflect.getOwnMetadata(METADATA_KEY.middleware, target, key);
    }

    return metadataList
        .reduce<MiddlewareConfiguration>((prev, metadata) => {
            if (isMiddlewareDefinition(metadata)) {
                let middleware = container.get<MiddlewareConfigurator>(`${metadata.name}Middleware`)(...metadata.values);

                let p = metadata.after ? prev.after : prev.before;

                if (Array.isArray(middleware)) {
                    p.push(...middleware);
                } else {
                    p.push(middleware);
                }
            } else {
                prev.before.push(metadata);
            }

            return prev;
        }, {
            before: [],
            after: []
        });
}
