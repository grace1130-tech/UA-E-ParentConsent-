
export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("loggedInUser");

  window.location.href = "/login";
}

export function isTokenExpired(token) {
  if (!token) {
    return true;
  }

  try {
    const payload = token.split(".")[1];

    if (!payload) {
      return true;
    }

    const decodedPayload = JSON.parse(
      atob(
        payload.replace(/-/g, "+").replace(/_/g, "/")
      )
    );

    if (!decodedPayload.exp) {
      return true;
    }

    const expirationTime = decodedPayload.exp * 1000;

    return Date.now() >= expirationTime;

  } catch (error) {
    return true;
  }
}
