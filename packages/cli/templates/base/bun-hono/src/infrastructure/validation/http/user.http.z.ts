import z from "zod";
import { ResponseSchema } from "~/interfaces/http/route";
import { zUserResponseMinimal } from "../responses/user.response.z";

export const zUserHttpGet = ResponseSchema({
  data: z.object({
    user: zUserResponseMinimal,
  }),
});
export type IzUserHttpGet = z.infer<typeof zUserHttpGet>;

export const zUsersHttpGet = ResponseSchema({
  data: z.object({
    users: z.array(zUserResponseMinimal),
  }),
});
export type IzUsersHttpGet = z.infer<typeof zUsersHttpGet>;

export const zUserHttpGetEmpty = ResponseSchema({
  data: z.object({}),
});
export type IzUserHttpGetEmpty = z.infer<typeof zUserHttpGetEmpty>;
