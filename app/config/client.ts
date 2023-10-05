import { BuildConfig, getBuildConfig } from "./build";
import { getServerSideConfig } from "./server";

export type ClientConfig = BuildConfig & {
  hasNextAuth: boolean;
};

export function getClientConfig(): ClientConfig {
  if (typeof document !== "undefined") {
    // client side
    return JSON.parse(queryMeta("config")) as ClientConfig;
  }

  if (
    typeof self === "object" &&
    self.constructor &&
    self.constructor.name === "DedicatedWorkerGlobalScope"
  ) {
    // worker side
    return (self as any)?.startData?.config;
  }

  if (typeof process !== "undefined") {
    // server side generation of the client config
    return {
      ...getBuildConfig(),
      hasNextAuth: !!getServerSideConfig().nextAuthUrl,
    };
  }
  throw new Error("code is neither running in the browser nor in node.js");
}

function queryMeta(key: string, defaultValue?: string): string {
  let ret: string;
  if (document) {
    const meta = document.head.querySelector(
      `meta[name='${key}']`,
    ) as HTMLMetaElement;
    ret = meta?.content ?? "";
  } else {
    ret = defaultValue ?? "";
  }

  return ret;
}
