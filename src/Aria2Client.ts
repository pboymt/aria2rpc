import { JSONRPCClient, JSONRPCClientOptions, JSONRPCParams } from "./JSONRPCClient";
import { GlobalStat, Status, Uri, File, Peer, Server, StatusKey, Version } from "./Aria2RPCResults";
import { HttpOptions, FtpSftpOptions, AddUriOptions, GlobalOptions } from "./Aria2RPCOptions";
import { Multicall, RPCMethod } from "./Aria2RPCMethod";

export class Aria2Client {

    client: JSONRPCClient = new JSONRPCClient(this.options);

    constructor(private options: JSONRPCClientOptions) { }

    private stringifyOptions(options: object) {
        const mappedOptions: { [key: string]: string } = {};
        for (const entry of Object.entries(options)) {
            if (typeof entry[1] === 'string') {
                mappedOptions[entry[0]] = entry[1];
            } else {
                mappedOptions[entry[0]] = String(entry[1]);
            }
        }
        return mappedOptions;
    }

    async call<T>(method: RPCMethod, params: JSONRPCParams[]) {
        return await this.client.request<T>(method, params);
    }

    async addUri(urls: string[], options: AddUriOptions = {}, position?: number) {
        const mappedOptions = this.stringifyOptions(options);
        return await this.client.request<string>('aria2.addUri', typeof position === 'number' ? [urls, mappedOptions, position] : [urls, mappedOptions]);
    }

    async addTorrent(torrent: string, uris?: string[], options?: AddUriOptions, position?: number) {
        const mappedOptions = this.stringifyOptions(options || {});
        if (typeof position === 'number') {
            return await this.client.request<string>(
                'aria2.addTorrent',
                [torrent, uris || [], mappedOptions, position]
            );
        }
        if (uris instanceof Array) {
            return await this.client.request<string>('aria2.addTorrent', [torrent, uris, mappedOptions]);
        }
        return await this.client.request<string>('aria2.addTorrent', [torrent]);
    }

    async addMetalink(metalink: string, uris?: string[], options?: AddUriOptions, position?: number) {
        const mappedOptions = this.stringifyOptions(options || {});
        if (typeof position === 'number') {
            return await this.client.request<string>(
                'aria2.addMetalink',
                [metalink, uris || [], mappedOptions, position]
            );
        }
        if (uris instanceof Array) {
            return await this.client.request<string>('aria2.addMetalink', [metalink, uris, mappedOptions]);
        }
        return await this.client.request<string>('aria2.addMetalink', [metalink]);
    }

    async remove(gid: string) {
        return await this.client.request<string>('aria2.remove', [gid]);
    }

    async forceRemove(gid: string) {
        return await this.client.request<string>('aria2.forceRemove', [gid]);
    }

    async pause(gid: string) {
        return await this.client.request<string>('aria2.pause', [gid]);
    }

    async pauseAll() {
        return await this.client.request<'OK'>('aria2.pauseAll');
    }

    async forcePause(gid: string) {
        return await this.client.request<string>('aria2.forcePause', [gid]);
    }

    async forcePauseAll() {
        return await this.client.request<'OK'>('aria2.forcePauseAll');
    }

    async unpause(gid: string) {
        return await this.client.request<string>('aria2.unpause', [gid]);
    }

    async unpauseAll() {
        return await this.client.request<'OK'>('aria2.unpauseAll');
    }

    async tellStatus(gid: string, keys?: StatusKey[]) {
        return await this.client.request<Status>('aria2.tellStatus', keys instanceof Array ? [gid, keys] : [gid])
    }

    async getUris(gid: string) {
        return await this.client.request<Uri[]>('aria2.getUris', [gid]);
    }

    async getFiles(gid: string) {
        return await this.client.request<File[]>('aria2.getFiles', [gid]);
    }

    async getPeers(gid: string) {
        return await this.client.request<Peer[]>('aria2.getPeers', [gid]);
    }

    async getServers(gid: string) {
        return await this.client.request<Server[]>('aria2.getServers', [gid]);
    }

    async tellActive(keys?: StatusKey[]) {
        if (keys instanceof Array) {
            return await this.client.request<Status[]>('aria2.tellActive', [keys]);
        } else {
            return await this.client.request<Status[]>('aria2.tellActive');
        }
    }

    async tellWaiting(offset: number, count: number, keys?: StatusKey[]) {
        if (keys instanceof Array) {
            return await this.client.request<Status[]>('aria2.tellWaiting', [offset, count, keys]);
        } else {
            return await this.client.request<Status[]>('aria2.tellWaiting', [offset, count]);
        }
    }

    async tellStopped(offset: number, count: number, keys?: StatusKey[]) {
        if (keys instanceof Array) {
            return await this.client.request<Status[]>('aria2.tellStopped', [offset, count, keys]);
        } else {
            return await this.client.request<Status[]>('aria2.tellStopped', [offset, count]);
        }
    }

    async changePosition(gid: string, pos: number, how: 'POS_SET' | 'POS_CUR' | 'POS_END') {
        return await this.client.request<number>('aria2.changePosition', [gid, pos, how]);
    }

    async changeUri(gid: string, fileIndex: number, delUris: string[], addUris: string[], position?: number) {
        return await this.client.request<[number, number]>('aria2.changeUri',
            typeof position === 'number' ?
                [gid, fileIndex, delUris, addUris, position] :
                [gid, fileIndex, delUris, addUris]
        );
    }

    async getOption(gid: string) {
        return await this.client.request<GlobalOptions>('aria2.getOption', [gid]);
    }

    async changeOption(gid: string, options: GlobalOptions) {
        const mappedOptions = this.stringifyOptions(options);
        return await this.client.request<'OK'>('aria2.changeOption', [gid, mappedOptions]);
    }

    async getGlobalOption(gid: string) {
        return await this.client.request<GlobalOptions>('aria2.getGlobalOption', [gid]);
    }

    async changeGlobalOption(gid: string, options: GlobalOptions) {
        const mappedOptions = this.stringifyOptions(options);
        return await this.client.request<'OK'>('aria2.changeGlobalOption', [gid, mappedOptions]);
    }

    async getGlobalStat() {
        return await this.client.request<GlobalStat>('aria2.getGlobalStat');
    }

    async purgeDownloadResult() {
        return await this.client.request<'OK'>('aria2.purgeDownloadResult');
    }

    async removeDownloadResult(gid: string) {
        return await this.client.request<'OK'>('aria2.removeDownloadResult', [gid]);
    }

    async getVersion() {
        return await this.client.request<Version>('aria2.getVersion');
    }

    async getSessionInfo() {
        return await this.client.request<{ sessionId: string }>('aria2.getSessionInfo');
    }

    async shutdown() {
        return await this.client.request<'OK'>('aria2.shutdown');
    }

    async forceShutdown() {
        return await this.client.request<'OK'>('aria2.forceShutdown');
    }

    async saveSession() {
        return await this.client.request<'OK'>('aria2.saveSession');
    }

    async multicall<T>(...commands: Multicall[]) {
        if (commands.length) {
            return await this.client.request<T>('system.multicall', [commands]);
        }
    }

}