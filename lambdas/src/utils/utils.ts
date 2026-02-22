import { AuthError } from "@supabase/supabase-js";
import { ApiAuthRequest, ApiRequest } from "../api/common";
import { APIGatewayAuthorizerEvent } from "aws-lambda";

export const retrieveToken = (event: ApiAuthRequest): string => {
  if (!event.authorizationToken) {
    throw new AuthError('Missing access token.')
  }

  return event.authorizationToken.replace("Bearer ", "")
}