// src/repositories/index.js

import { UserRepository as DevRepo } from "./dev/UserRepository.js";
import { UserRepository as StgRepo } from "./stg/UserRepository.js";
import { UserRepository as ProdRepo } from "./prod/UserRepository.js";

let RepoClass;

if (process.env.NODE_ENV === "production") {
  RepoClass = ProdRepo;
} else if (process.env.NODE_ENV === "staging" || process.env.NODE_ENV === "stg") {
  RepoClass = StgRepo;
} else {
  // default: dev AND test
  RepoClass = DevRepo;
}

export const UserRepository = new RepoClass();
