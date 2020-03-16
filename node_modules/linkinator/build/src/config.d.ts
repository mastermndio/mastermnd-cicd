export interface Flags {
    concurrency?: number;
    config?: string;
    recurse?: boolean;
    skip?: string;
    format?: string;
    silent?: boolean;
}
export declare function getConfig(flags: Flags): Promise<Flags>;
