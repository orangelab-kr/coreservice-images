export interface CloudfrontEvent {
  Records: [{ cf: CloudfrontEventCf }];
}

export interface CloudfrontEventCf {
  config: CloudfrontEventCfConfig;
  request: CloudfrontEventCfRequest;
  response: CloudfrontEventCfResponse;
}

export interface CloudfrontEventCfResponse {
  headers: CloudfrontEventCfHeaders;
  status: number;
  statusDescription: string;
  body?: string;
  bodyEncoding?: string;
}

export interface CloudfrontEventCfConfig {
  distributionDomainName: string;
  distributionId: string;
  eventType: CloudfrontEventCfConfigEventType;
  requestId: string;
}

export type CloudfrontEventCfConfigEventType =
  | 'viewer-request'
  | 'origin-request'
  | 'origin-response'
  | 'viewer-response';

export type CloudfrontEventCfRequestMethod =
  | 'GET'
  | 'HEAD'
  | 'OPTIONS'
  | 'PUT'
  | 'PATCH'
  | 'POST'
  | 'DELETE';

export interface CloudfrontEventCfHeaders {
  [key: string]: [
    {
      key: string;
      value: string;
    }
  ];
}

export interface CloudfrontEventCfRequest {
  clientIp: string;
  headers: CloudfrontEventCfHeaders;
  method: CloudfrontEventCfRequestMethod;
  origin: CloudfrontEventCfRequestOrigin;
  querystring: string;
  uri: string;
}

export interface CloudfrontEventCfRequestOrigin {
  s3: {
    authMethod: 'none';
    customHeaders: {};
    domainName: string;
    path: string;
  };
}

export const setHeader = (
  response: CloudfrontEventCfResponse,
  key: string,
  value: string
) => (response.headers[key] = [{ key, value }]);

export const setBody = (response: CloudfrontEventCfResponse, body: any) => {
  response.body = body;
  setHeader(response, 'Content-Type', 'application/json');
};
