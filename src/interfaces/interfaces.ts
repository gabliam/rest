
export interface Controller { }

export interface HandlerDecorator {
    (target: any, key: string, value: any): void;
}

export interface RestConfig {
    rootPath: string;
}
