const { randomUUID } = require('crypto');

class User {
    constructor({
        id = randomUUID(),
        username = null,
        email,
        firstName,
        lastName,
        displayName = null,

        passwordHash,
        role = "USER", // OWNER|USER|ADMIN|MANAGER
        status = "PENDING_VERIFICATION", //PENDING_VERIFICATION|ACTIVE|SUSPENDED
        emailVerified = false,
        lastLoginAt = null,
        failedLoginAttempts = 0,
        lockedUntil = null,

        createdAt = new Date().toISOString(),
        updatedAt = new Date().toISOString(),

        profile = {} // making this extendable
    }) {
        this.id = id;
        this.username = username;
        this.firstName = firstName;
        this.lastName = lastName;
        this.displayName = displayName || `${firstName} ${lastName}`;
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
        this.status = status;
        this.emailVerified = emailVerified;
        this.lastLoginAt = lastLoginAt;
        this.failedLoginAttempts = failedLoginAttempts;
        this.lockedUntil = lockedUntil;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.profile = profile;
    }

    safe() {
        const { passwordHash, ...safeData } = this;
        return safeData;
    }

    markLoginSuccess() {
        this.lastLoginAt = new Date().toISOString();
        this.failedLoginAttempts = 0;
        this.updatedAt = new Date().toISOString();
        this.lockedUntil = null;
    }

    markLoginFailure() {
        this.failedLoginAttempts += 1;
        this.updatedAt = new Date().toISOString();
        if (this.failedLoginAttempts >= 5) {
            this.lockedUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // lock account for 15 minutes
        }
    }

    verifyEmail() {
        this.emailVerified = true;
        this.status = "ACTIVE";
        this.updatedAt = new Date().toISOString();
    }

    updateProfile(updates) {
        this.profile = { ...this.profile, ...updates };
        this.updatedAt = new Date().toISOString();
    }
}

module.exports = { User };