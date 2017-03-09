import { interfaces as coreInterfaces, inversifyInterfaces, Scan, Registry } from '@gabliam/core';
import { TYPE, METADATA_KEY, REST_CONFIG } from './constants';
import { getMiddlewares } from './metadata';
import { cleanPath } from './utils';
import * as interfaces from './interfaces';
import * as express from 'express';
import * as d from 'debug';
const debug = d('Gabliam:Plugin::rest');



export * from './decorators';
export { interfaces };

@Scan(__dirname)
export default class RestPlugin implements coreInterfaces.GabliamPlugin {

    bind(app: express.Application, container: inversifyInterfaces.Container, registry: Registry) {
        registry.get(TYPE.Controller)
            .forEach(({ id, target }) => container.bind<any>(id).to(target).inSingletonScope());
    }

    build(app: express.Application, container: inversifyInterfaces.Container, registry: Registry) {
        let restConfig = container.get<interfaces.RestConfig>(REST_CONFIG);
        debug('registerControllers', TYPE.Controller);
        let controllerIds = registry.get(TYPE.Controller);
        controllerIds.forEach(({ id: controllerId }) => {
            let controller = container.get<interfaces.Controller>(controllerId);

            let controllerMetadata: interfaces.ControllerMetadata = Reflect.getOwnMetadata(
                METADATA_KEY.controller,
                controller.constructor
            );

            let controllerMiddlewares = getMiddlewares(container, controller.constructor);

            let methodMetadatas: interfaces.ControllerMethodMetadata[] = Reflect.getOwnMetadata(
                METADATA_KEY.controllerMethod,
                controller.constructor
            );

            if (controllerMetadata && methodMetadatas) {
                let router = express.Router();
                let routerPath = cleanPath(`${restConfig.rootPath}${controllerMetadata.path}`);
                debug(`New route : "${routerPath}"`);
                methodMetadatas.forEach((methodMetadata: interfaces.ControllerMethodMetadata) => {
                    let methodMetadataPath = cleanPath(methodMetadata.path);
                    let methodMiddlewares = getMiddlewares(container, controller.constructor, methodMetadata.key);
                    debug(methodMetadataPath);
                    debug({ methodMiddlewares, controllerMiddlewares });
                    let handler: express.RequestHandler = this.handlerFactory(
                        container,
                        controllerId,
                        methodMetadata.key,
                        controllerMetadata.json
                    );
                    router[methodMetadata.method](
                        methodMetadataPath,
                        ...controllerMiddlewares,
                        ...methodMiddlewares,
                        handler
                    );
                });
                app.use(routerPath, router);
            }
        });
    }

    private handlerFactory(
        container: inversifyInterfaces.Container,
        controllerId: any,
        key: string,
        json: boolean
    ): express.RequestHandler {
        return (req: express.Request, res: express.Response, next: express.NextFunction) => {
            let result: any = container.get(controllerId)[key](req, res, next);

            // try to resolve promise
            if (result && result instanceof Promise) {

                result.then((value: any) => {
                    if (value && !res.headersSent) {
                        if (json) {
                            res.json(value);
                        } else {
                            res.send(value);
                        }
                    }
                })
                    .catch((error: any) => {
                        next(error);
                    });

            } else if (result !== undefined && !res.headersSent) {
                if (json) {
                    res.json(result);
                } else {
                    res.send(result);
                }
            }
        };
    }
}
