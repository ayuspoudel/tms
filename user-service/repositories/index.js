let UserRepository;

if (process.env.NODE_ENV === "production") {
  // Production: DynamoDB
  UserRepository = (await import("./prod/UserRepository.js")).UserRepository;
} else if (process.env.NODE_ENV === "staging" || process.env.NODE_ENV === "stg") {
  // Staging: In-memory MongoDB for integration tests
  UserRepository = (await import("./stg/UserRepository.js")).UserRepository;
} else {
  // Development (and unit testing): mock/in-memory repo
  UserRepository = (await import("./dev/UserRepository.js")).UserRepository;
}

export { UserRepository };