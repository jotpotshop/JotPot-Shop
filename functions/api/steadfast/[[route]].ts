import { handleSteadfastRequest, SteadfastEnv } from '../../../src/server/steadfastHandler';

export const onRequest: PagesFunction<SteadfastEnv> = async (context) => {
  return handleSteadfastRequest(context.request, context.env);
};
