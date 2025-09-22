// repositories/index.js
let RepoClass;

if (process.env.NODE_ENV === "production") {
  const { UserRepository } = await import("./prod/UserRepository.js");
  RepoClass = UserRepository;
} else if (process.env.NODE_ENV === "staging" || process.env.NODE_ENV === "stg") {
  const { UserRepository } = await import("./stg/UserRepository.js");
  RepoClass = UserRepository;
} else {
  const { UserRepository } = await import("./dev/UserRepository.js");
  RepoClass = UserRepository;
}

// Export a singleton instance
export const UserRepository = new RepoClass();
