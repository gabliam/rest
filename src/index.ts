import { interfaces as coreInterfaces, registry, inversifyInterfaces, Scan } from '@gabliam/core';
import { TYPE, METADATA_KEY, REST_CONFIG } from './constants';
import * as interfaces from './interfaces';
import * as express from 'express';
import * as d from 'debug';
const debug = d('Gabliam:Plugin::rest');



export * from './decorators';
export { interfaces };

@Scan(__dirname)
export default class RestPlugin implements coreInterfaces.GabliamPlugin {
    constructor(public app: express.Application, public container: inversifyInterfaces.Container){}

    bind() {
        registry.get(TYPE.Controller)
            .forEach(({id, target}) => this.container.bind<any>(id).to(target).inSingletonScope());
    }

    build() {
        let restConfig = this.container.get<interfaces.RestConfig>(REST_CONFIG);
        this.registerControllers(restConfig);
    }

    private registerControllers(restConfig: interfaces.RestConfig) {
        debug('registerControllers');
        let controllerIds = registry.get(TYPE.Controller);
        controllerIds.forEach(({id: controllerId}) => {
            let controller = this.container.get<interfaces.Controller>(controllerId);

            let controllerMetadata: interfaces.ControllerMetadata = Reflect.getOwnMetadata(
                METADATA_KEY.controller,
                controller.constructor
            );

            let methodMetadata: interfaces.ControllerMethodMetadata[] = Reflect.getOwnMetadata(
                METADATA_KEY.controllerMethod,
                controller.constructor
            );

            if (controllerMetadata && methodMetadata) {
                let router = express.Router();
                let routerPath = cleanPath(`${restConfig.rootPath}${controllerMetadata.path}`);
                debug(`New route : "${routerPath}"`);
                methodMetadata.forEach((metadata: interfaces.ControllerMethodMetadata) => {
                    let metadataPath = cleanPath(metadata.path);
                    debug(metadataPath);
                    let handler: express.RequestHandler = this.handlerFactory(controllerId, metadata.key, controllerMetadata.json);
                    router[metadata.method](
                        metadataPath,
                        ...controllerMetadata.middlewares,
                        ...metadata.middlewares,
                        handler
                    );
                });
                this.app.use(routerPath, router);
            }
        });
    }

    private handlerFactory(controllerId: any, key: string, json: boolean): express.RequestHandler {
        return (req: express.Request, res: express.Response, next: express.NextFunction) => {
            let result: any = this.container.get(controllerId)[key](req, res, next);

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

            } else if (result && !res.headersSent) {
                if (json) {
                    res.json(result);
                } else {
                    res.send(result);
                }
            }
        };
    }
}

function cleanPath(path: string) {
    return path.replace(/\/+/gi, '/');
}