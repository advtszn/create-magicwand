import { Service } from "typedi";
import { type IUser, UserRepository } from "./user.repository";

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
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getUsers(): Promise<IUser[]> {
    return this.userRepository.findAll();
  }

  async getUser(data: IGetUser): Promise<IUser | null> {
    return this.userRepository.find(data);
  }

  async getUserByEmail(data: IGetUserByEmail): Promise<IUser | null> {
    return this.userRepository.findByEmail(data);
  }

  async createUser(data: ICreateUser): Promise<IUser> {
    return this.userRepository.create(data);
  }

  async updateUser(data: IUpdateUser): Promise<IUser | null> {
    return this.userRepository.update(data);
  }

  async deleteUser(data: IDeleteUser): Promise<void> {
    return this.userRepository.delete(data);
  }
}
