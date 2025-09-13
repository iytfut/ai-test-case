// Simple in-memory session store for production
// Note: This will reset sessions on server restart
// For production, consider using Redis or MongoDB

class MemorySessionStore {
  constructor() {
    this.sessions = new Map();
  }

  get(sessionId, callback) {
    const session = this.sessions.get(sessionId);
    console.log(
      "Session store GET:",
      sessionId,
      session ? "found" : "not found"
    );
    callback(null, session || null);
  }

  set(sessionId, session, callback) {
    console.log(
      "Session store SET:",
      sessionId,
      "User:",
      session.passport?.user?.username || "no user"
    );
    this.sessions.set(sessionId, session);
    callback(null);
  }

  destroy(sessionId, callback) {
    console.log("Session store DESTROY:", sessionId);
    this.sessions.delete(sessionId);
    callback(null);
  }

  touch(sessionId, session, callback) {
    console.log("Session store TOUCH:", sessionId);
    this.sessions.set(sessionId, session);
    callback(null);
  }
}

export default MemorySessionStore;
