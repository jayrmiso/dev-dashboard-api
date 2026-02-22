import { APIGatewayTokenAuthorizerEvent } from "aws-lambda";
import { SupabaseImpl } from "../../_service/integrations/supabase";
import { ApiAuthRequest, ApiRequest, ApiResponse } from "../../api/common";
import { authorizer } from "./authorizer";

export const handler = async (event: ApiAuthRequest) => {
  const supabase = new SupabaseImpl()
  const response = await authorizer(event, supabase)

  return response
}