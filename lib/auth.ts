export type AuthRole = 'guest' | 'user' | 'admin';

export type AuthSession = {
  role: AuthRole;
  username: string | null;
};

let session: AuthSession = {
  role: 'guest',
  username: null,
};

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function getSession() {
  return session;
}

export function setSession(nextSession: AuthSession) {
  session = nextSession;
  notify();
}

export function clearSession() {
  session = {
    role: 'guest',
    username: null,
  };
  notify();
}

export function subscribeSession(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}