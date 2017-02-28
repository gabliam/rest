import { PluginConfig, Bean, Value } from '@gabliam/core';
import { DEFAULT_ROUTING_ROOT_PATH, REST_CONFIG } from './constants';
import {RestConfig} from './interfaces';

@PluginConfig()
export class RestPluginConfig {
    @Value('application.rest.rootPath')
    rootPath = DEFAULT_ROUTING_ROOT_PATH;


    @Bean(REST_CONFIG)
    restConfig(): RestConfig {
        return {
            rootPath: this.rootPath
        };
    }
}
