import json


def make_api_gateway_event(
    *,
    route_key: str = "GET /api/v1/example",
    raw_path: str = "/api/v1/example",
    method: str = "GET",
    body=None,
    serialize_body: bool = True,
    authenticated_uid: str | None = "user-123",
):
    authorizer = {"lambda": {"uid": authenticated_uid}} if authenticated_uid is not None else None
    return {
        "version": "2.0",
        "routeKey": route_key,
        "rawPath": raw_path,
        "rawQueryString": "",
        "headers": {},
        "requestContext": {
            "accountId": "123456789012",
            "apiId": "api-id",
            "authorizer": authorizer,
            "domainName": "example.com",
            "domainPrefix": "example",
            "http": {
                "method": method,
                "path": raw_path,
                "protocol": "HTTP/1.1",
                "sourceIp": "127.0.0.1",
                "userAgent": "pytest",
            },
            "requestId": "request-id",
            "routeKey": route_key,
            "stage": "$default",
            "time": "06/Jul/2026:00:00:00 +0000",
            "timeEpoch": 1783296000000,
        },
        "body": json.dumps(body) if serialize_body and body is not None else body,
    }


def make_authorizer_event(
    *,
    raw_path: str = "/api/v1/example",
    route_key: str = "GET /api/v1/example",
    method: str = "GET",
    authorization_header: str | None = "Bearer token",
):
    headers = {"Authorization": authorization_header} if authorization_header is not None else {}
    return {
        "version": "2.0",
        "type": "REQUEST",
        "routeArn": "arn:aws:execute-api:us-east-1:123456789012:api-id/$default/GET/api/v1/example",
        "routeKey": route_key,
        "headers": headers,
        "rawPath": raw_path,
        "rawQueryString": "",
        "requestContext": {
            "accountId": "123456789012",
            "apiId": "api-id",
            "domainName": "example.com",
            "domainPrefix": "example",
            "http": {
                "method": method,
                "path": raw_path,
                "protocol": "HTTP/1.1",
                "sourceIp": "127.0.0.1",
                "userAgent": "pytest",
            },
            "requestId": "request-id",
            "routeKey": route_key,
            "stage": "$default",
            "time": "06/Jul/2026:00:00:00 +0000",
            "timeEpoch": 1783296000000,
        },
    }
