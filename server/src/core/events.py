from typing import Any

from aws_lambda_powertools.utilities.parser.models import (
    ApiGatewayAuthorizerRequestV2,
    APIGatewayProxyEventV2Model,
    RequestContextV2,
    RequestContextV2Authorizer,
)
from pydantic import BaseModel, Field


class CustomLambdaAuthorizerContext(BaseModel):
    uid: str | None = None


class CustomRequestContextAuthorizer(RequestContextV2Authorizer):
    lambda_: CustomLambdaAuthorizerContext | None = Field(default=None, alias="lambda")


class CustomRequestContext(RequestContextV2):
    authorizer: CustomRequestContextAuthorizer | None = None


class CustomApiGatewayEvent(APIGatewayProxyEventV2Model):
    body: str | dict[str, Any] | None = None
    requestContext: CustomRequestContext


class CustomAuthorizerEvent(ApiGatewayAuthorizerRequestV2):
    body: str | dict[str, Any] | None = None
    requestContext: CustomRequestContext
