// Simple session helpers using sessionStorage
// Keys
const KEY = 'auth_session_v1';

export function saveSession(payload) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(payload));
  } catch (e) {
    console.error('Failed to save session', e);
  }
}

export function readSession() {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error('Failed to read session', e);
    return null;
  }
}

export function clearSession() {
  try {
    sessionStorage.removeItem(KEY);
  } catch (e) {
    console.error('Failed to clear session', e);
  }
}

export function getRole(session) {
  const s = session || readSession();
  return s?.user?.role || s?.role || null;
}

export function getToken(session) {
  const s = session || readSession();
  return s?.token || s?.accessToken || null;
}
