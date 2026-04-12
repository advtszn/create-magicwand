import { Service } from "typedi";
import z from "zod";
import { UserApplication } from "~/application/users/user.application";
import type { IUser } from "~/domain/users/user.repository";
import {
  IzUserHttpGet,
  IzUserHttpGetEmpty,
  IzUsersHttpGet,
  zUserHttpGet,
  zUserHttpGetEmpty,
  zUsersHttpGet,
} from "~/infrastructure/validation/http/user.http.z";
import {
  InternalServerError,
  NotFoundError,
} from "~/shared/errors/http.errors";
import {
  Methods,
  type RequestContext,
  RequestSchema,
  Route,
} from "../../route";

const zGetUsersRequestSchema = RequestSchema({});

const zGetUserRequestSchema = RequestSchema({
  params: z.object({
    id: z.string(),
  }),
});

const zCreateUserRequestSchema = RequestSchema({
  body: z.object({
    email: z.email(),
    name: z.string(),
  }),
});

const zUpdateUserRequestSchema = RequestSchema({
  params: z.object({ id: z.string() }),
  body: z
    .object({
      email: z.email(),
      name: z.string(),
    })
    .partial(),
});

const zDeleteUserRequestSchema = RequestSchema({
  params: z.object({ id: z.string() }),
});

@Service()
export class UserRoute extends Route {
  constructor(private readonly userApplication: UserApplication) {
    super();
  }

  setupRoutes(): void {
    this.register({
      method: Methods.GET,
      path: "/",
      requestSchema: zGetUsersRequestSchema,
      responseSchema: zUsersHttpGet,
      handler: this.getUsers.bind(this),
    });

    this.register({
      method: Methods.GET,
      path: "/:id",
      requestSchema: zGetUserRequestSchema,
      responseSchema: zUserHttpGet,
      handler: this.getUser.bind(this),
    });

    this.register({
      method: Methods.POST,
      path: "/",
      requestSchema: zCreateUserRequestSchema,
      responseSchema: zUserHttpGet,
      handler: this.createUser.bind(this),
    });

    this.register({
      method: Methods.PUT,
      path: "/:id",
      requestSchema: zUpdateUserRequestSchema,
      responseSchema: zUserHttpGet,
      handler: this.updateUser.bind(this),
    });

    this.register({
      method: Methods.DELETE,
      path: "/:id",
      requestSchema: zDeleteUserRequestSchema,
      responseSchema: zUserHttpGetEmpty,
      handler: this.deleteUser.bind(this),
    });
  }

  private async getUsers({
    data,
  }: RequestContext<typeof zGetUsersRequestSchema>): Promise<IzUsersHttpGet> {
    void data;

    const users = await this.userApplication.getUsers();

    return {
      success: true,
      data: { users },
    };
  }

  private async getUser({
    data,
  }: RequestContext<typeof zGetUserRequestSchema>): Promise<IzUserHttpGet> {
    const user = await this.userApplication.getUser({
      data: { id: data.params.id },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return {
      success: true,
      data: { user },
    };
  }

  private async createUser({
    data,
  }: RequestContext<typeof zCreateUserRequestSchema>): Promise<IzUserHttpGet> {
    const user = await this.userApplication.createUser({ data: data.body });

    return {
      success: true,
      data: { user },
    };
  }

  private async updateUser({
    data,
  }: RequestContext<typeof zUpdateUserRequestSchema>): Promise<IzUserHttpGet> {
    const fields: Partial<Omit<IUser, "id" | "createdAt" | "updatedAt">> = {};

    if (data.body.email !== undefined) {
      fields.email = data.body.email;
    }

    if (data.body.name !== undefined) {
      fields.name = data.body.name;
    }

    const user = await this.userApplication.updateUser({
      data: { id: data.params.id, fields },
    });

    if (!user) {
      throw new InternalServerError("Failed to update user");
    }

    return {
      success: true,
      data: { user },
    };
  }

  private async deleteUser({
    data,
  }: RequestContext<
    typeof zDeleteUserRequestSchema
  >): Promise<IzUserHttpGetEmpty> {
    await this.userApplication.deleteUser({ data: { id: data.params.id } });

    return {
      success: true,
      data: {},
    };
  }
}
