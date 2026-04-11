import { Service } from "typedi";
import type { IUser } from "~/domain/users/user.repository";
import { UserService } from "~/domain/users/user.service";

interface IGetUser {
  data: {
    id: string;
  };
}

interface IGetUserByEmail {
  data: {
    email: string;
  };
}

interface ICreateUser {
  data: {
    name: string;
    email: string;
  };
}

interface IUpdateUser {
  data: {
    id: string;
    fields: Partial<Omit<IUser, "id" | "createdAt" | "updatedAt">>;
  };
}

interface IDeleteUser {
  data: {
    id: string;
  };
}

@Service()
export class UserApplication {
  constructor(private readonly userService: UserService) {}

  async getUsers(): Promise<IUser[]> {
    return this.userService.getUsers();
  }

  async getUser(data: IGetUser): Promise<IUser | null> {
    return this.userService.getUser(data);
  }

  async getUserByEmail(data: IGetUserByEmail): Promise<IUser | null> {
    return this.userService.getUserByEmail(data);
  }

  async createUser(data: ICreateUser): Promise<IUser> {
    return this.userService.createUser(data);
  }

  async updateUser(data: IUpdateUser): Promise<IUser | null> {
    return this.userService.updateUser(data);
  }

  async deleteUser(data: IDeleteUser): Promise<void> {
    return this.userService.deleteUser(data);
  }
}
