import { Request, Response } from "express";
import { Dictionary } from "@insite/client-framework/Common/Types";
import logger from "@insite/client-framework/Logger";

interface ApiMethod {
    (request: Request, response: Response): Promise<void>;
}

interface Relay {
    [endpoint: string]: ApiMethod;
}

/** Creates a function that relays the request to a different URL. */
function createRelay(prefix: string) {
    return async function relay(request: Request, response: Response) {
        const headers: Dictionary<string> = {};

        for (const prop in request.headers) {
            // Naively forwarding all headers can conflict with Node/Express behavior.
            switch (prop.toLowerCase()) {
            case "host":
            case "origin":
            case "referer":
                continue;
            }

            const value = request.headers[prop];
            // Type here is string | string[] | undefined
            if (!value) {
                // Shouldn't happen with the for loop above but satisfies the type check for undefined.
                continue;
            }

            const singleValue = typeof value !== "string" ? value[0] : value;

            headers[prop] = singleValue;
        }

        const url = `${prefix}${request.originalUrl}`;
        logger.info(`Relaying ${request.method} ${request.originalUrl} to ${url}.`);

        const result = await fetch(url, {
            method: request.method,
            body: request.body,
            headers,
        });

        const body = await (result as any).buffer(); // Buffer is part of node-fetch but not standard fetch.

        response.status(result.status);

        const headersCollection: Dictionary<string[]> = {};

        result.headers.forEach((value: string, key: string) => {
            // Naively returning all headers can conflict with Node/Express behavior.
            switch (key.toLowerCase()) {
            case "content-encoding":
            case "content-length":
            case "content-type": // Handled later
            case "date":
            case "server":
            case "x-powered-by":
                return;
            }

            if (typeof headersCollection[key] === "undefined") {
                headersCollection[key] = [];
            }

            headersCollection[key].push(value);
        });

        for (const key in headersCollection) {
            response.setHeader(key, headersCollection[key]);
        }

        if (body.byteLength === 0) {
            response.end();
            return;
        }

        response
            .contentType(result.headers.get("Content-Type") || "application/octet-stream")
            .send(body);
    };
}

// This code is always the first to access process.env.ISC_API_URL so it has to make sure it's right.
let ISC_API_URL = process.env.ISC_API_URL;
if (!ISC_API_URL) {
    logger.warn("ISC_API_URL environment variable not found, defaulting to https://commerce.local.com/.");
    ISC_API_URL = process.env.ISC_API_URL = "https://commerce.local.com/";
} else if (!ISC_API_URL.startsWith("http")) {
    logger.warn("ISC_API_URL doesn't start with `http`, prefixing with `https://`.");
    ISC_API_URL = process.env.ISC_API_URL = `https://${process.env.ISC_API_URL}`;
}

process.env.ISC_API_URL = ISC_API_URL = ISC_API_URL.trim();

logger.log(`Server-side API URL is ${ISC_API_URL}.`);

/** Web API logic intended to be accessed via a Node/Express server host. */
const relayMethod = createRelay(ISC_API_URL);
/** To support POST, items listed here also need to be in the development/production startup procedure with raw parsing. */
const relay: Relay = {
    api: relayMethod,
    identity: relayMethod,
    systemresources: relayMethod,
    ckfinder: relayMethod,
    admin: relayMethod,
    bundles: relayMethod,
    userfiles: relayMethod,
    email: relayMethod,
    excel: relayMethod,
    sitemap: relayMethod,
};

export default relay;