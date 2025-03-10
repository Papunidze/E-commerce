import { isLeft } from "fp-ts/lib/Either";
import { TypeOf, Mixed } from "io-ts";

export type RequestMethod = "POST" | "GET" | "DELETE" | "PUT";
export type RequestBody = Record<string | number, any>;
export type RequestType = "FORM" | "JSON";

export const request =
  (reqMethod: RequestMethod) =>
  (reqUrl: string, reqBody?: RequestBody, reqType: RequestType = "JSON") => {
    return {
      decode: async <T extends Mixed>(codec: T) => {
        const requestUrl = `${reqUrl}`;
        const requestBody =
          reqType === "FORM"
            ? new URLSearchParams(reqBody)
            : JSON.stringify(reqBody);

        const headers: HeadersInit = {
          "Content-Type": reqType === "JSON" ? "application/json" : "",
        };

        const response = await fetch(requestUrl, {
          method: reqMethod,
          body: requestBody,
          headers: headers,
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();

          if (isLeft(codec.decode(data)))
            console.error("Failed to decode json", JSON.stringify(data));
          return data as TypeOf<typeof codec>;
        } else {
          const error = (await response.json()) as {
            message: string;
          };
          return Promise.reject({
            ...error,
          }) as unknown as TypeOf<typeof codec>;
        }
      },
    };
  };
export const rest = {
  post: request("POST"),
  delete: request("DELETE"),
  put: request("PUT"),
  get: request("GET"),
};
