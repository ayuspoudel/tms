import { v4 as uuid } from 'uuid';
import bcrypt from 'bcryptjs';

export class User {
    constructor({
        id = uuid(),
        firstName,
        lastName,
        dob,
        email,
        passwordHash,
        team,
        provider,
        createdAt,
        updatedAt
    }) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.dob = dob;
        this.passwordHash = passwordHash;
        this.email = email ? email.toLowerCase() : null;
        this.team = team || 'general';
        this.provider = provider || 'local';
        this.createdAt = createdAt || new Date().toISOString();
        this.updatedAt = updatedAt || new Date().toISOString();
    }

    safe() {
        const { passwordHash, ...rest } = this;
        return rest;
    }

    async verifyPassword(password) {
        return bcrypt.compare(password, this.passwordHash);
    }
}