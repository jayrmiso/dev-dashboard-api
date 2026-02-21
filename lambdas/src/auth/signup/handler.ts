import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { SupabaseImpl } from "../../_service/integrations/supabase";
import { signup } from "./signup";

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    const supabase = new SupabaseImpl()
    const result = await signup(event, supabase)
    return result
}