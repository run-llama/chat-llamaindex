/**
 * Constructs a full URL pointing to the webapp using the base domain from the environment variables and a given path.
 *
 * @param path The path to append to the base domain.
 * @returns The full URL.
 */
export const webappUrl = (path: string): string => {
  const baseDomain =
    process.env.NEXT_PUBLIC_WEBAPP_URL || "https://app.localtest.local:3000";
  return `${baseDomain}${path}`;
};

/**
 * Constructs a full URL using the server domain from the environment variables and a given path.
 *
 * @param path The path to append to the auth server domain.
 * @returns The full URL.
 */
export const apiUrl = (path: string): string => {
  const authDomain =
    process.env.NEXT_PUBLIC_AUTH_SERVER_DOMAIN ||
    "https://app.localtest.local:3000";
  return `${authDomain}${path}`;
};
