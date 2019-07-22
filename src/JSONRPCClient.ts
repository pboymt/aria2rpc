import { request as httpRequest } from "http";
import { request as httpsRequest } from "https";
import { format } from "url";
import { RPCMethod } from "./Aria2RPCMethod";

export type JSONRPCParams = string | string[] | object | number;

export interface JSONRPCClientOptions {
    secret?: string;
    https?: boolean;
    host?: string;
    port?: number;
    path?: string;
}

export interface JSONRPCRequestBody {
    jsonrpc: '2.0';
    id: string;
    method: string;
    params: JSONRPCParams[];
}

export interface JSONRPCResponseBody<T> {
    jsonrpc: '2.0';
    id: string;
    result: T;
}

export class JSONRPCClient {

    private id = 0;

    private readonly defaultOptions: JSONRPCClientOptions = {
        https: false,
        host: '127.0.0.1',
        port: 6800,
        path: '/jsonrpc'
    }

    private options: JSONRPCClientOptions;

    private get url() {

        return format({
            protocol: this.options.https ? 'https:' : 'http:',
            hostname: this.options.host,
            port: this.options.port,
            pathname: this.options.path
        });

    }

    constructor(options: JSONRPCClientOptions) {

        this.options = Object.assign({}, this.defaultOptions, options);

    }

    private body(method: string, params: any[]): JSONRPCRequestBody {

        const body: JSONRPCRequestBody = {
            jsonrpc: '2.0',
            id: (this.id++).toString(),
            method,
            params: this.options.secret ? [`token:${this.options.secret}`, ...params] : [...params]
        };

        return body;

    }

    private async httpRequest<T>(method: RPCMethod, params: any[] = []) {
        return new Promise<JSONRPCResponseBody<T>>((resolve, reject) => {

            const req = httpRequest(this.url, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                }
            }, (res) => {

                const bufs: Buffer[] = [];

                res.on('data', (chunk: Buffer) => {

                    bufs.push(chunk);

                });

                res.on('end', () => {

                    const bodyString = Buffer.concat(bufs).toString();

                    const body = JSON.parse(bodyString);

                    if (res.statusCode === 200) {

                        resolve(body);

                    } else {

                        reject(body);

                    }

                });

            });

            req.once('error', (err) => {

                reject(err);

            });

            req.end(JSON.stringify(this.body(method, params)));

        });
    }

    private async httpsRequest<T>(method: RPCMethod, params: any[] = []) {
        return new Promise<JSONRPCResponseBody<T>>((resolve, reject) => {

            const req = httpsRequest(this.url, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                }
            }, (res) => {

                const bufs: Buffer[] = [];

                res.on('data', (chunk: Buffer) => {

                    bufs.push(chunk);

                });

                res.on('end', () => {

                    const bodyString = Buffer.concat(bufs).toString();

                    console.log(bodyString);
                    const body = JSON.parse(bodyString);

                    if (res.statusCode === 200) {

                        resolve(body);

                    } else {

                        reject(body);

                    }

                });

            });

            req.once('error', (err) => {

                reject(err);

            });

            req.end(JSON.stringify(this.body(method, params)));

        });
    }

    async request<T>(method: RPCMethod, params: JSONRPCParams[] = []) {

        if (this.options.https) {

            return await this.httpsRequest<T>(method, params);

        } else {

            return await this.httpRequest<T>(method, params);

        }

    }

}