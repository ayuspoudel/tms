import { UserRepository as UserRepoClass } from "./UserRepository.js";
import { UserSessionRepository as UserSessionRepoClass } from "./UserSessionRepository.js";

export const UserRepository = new UserRepoClass();
export const UserSessionRepository = new UserSessionRepoClass();
