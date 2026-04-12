import { Service } from "typedi";
import { ulid } from "ulid";

export interface IUser {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

interface IFind {
  data: {
    id: string;
  };
}

interface IFindByEmail {
  data: {
    email: string;
  };
}

interface IUpdate {
  data: {
    id: string;
    fields: Partial<Omit<IUser, "id" | "createdAt" | "updatedAt">>;
  };
}

interface ICreate {
  data: {
    name: string;
    email: string;
  };
}

interface IDelete {
  data: {
    id: string;
  };
}

@Service()
export class UserRepository {
  private userStore: IUser[] = [];

  async findAll(): Promise<IUser[]> {
    return this.userStore;
  }

  async find(data: IFind): Promise<IUser | null> {
    return this.userStore.find((user) => user.id === data.data.id) ?? null;
  }

  async findByEmail(data: IFindByEmail): Promise<IUser | null> {
    return (
      this.userStore.find((user) => user.email === data.data.email) ?? null
    );
  }

  async update(data: IUpdate): Promise<IUser | null> {
    const user = this.userStore.find((user) => user.id === data.data.id);
    if (!user) return null;
    Object.assign(user, data.data.fields);
    return user;
  }

  async create(data: ICreate): Promise<IUser> {
    const newUser: IUser = {
      id: ulid(),
      name: data.data.name,
      email: data.data.email,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.userStore.push(newUser);
    return newUser;
  }

  async delete(data: IDelete): Promise<void> {
    this.userStore = this.userStore.filter((user) => user.id !== data.data.id);
  }
}
