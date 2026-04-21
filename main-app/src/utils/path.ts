const ensureLeadingSlash = (value: string) => (value.startsWith('/') ? value : `/${value}`);

const ensureTrailingSlash = (value: string) => (value.endsWith('/') ? value : `${value}/`);

const normalizePath = (value: string) => ensureTrailingSlash(ensureLeadingSlash(value.trim() || '/'));

export const getBasePath = () => {
  const publicPath = process.env.PUBLIC_PATH;
  if (publicPath && publicPath !== 'auto') {
    return normalizePath(publicPath);
  }

  return '/';
};

export const getRelativeRouteValue = (route: string) => {
  return normalizePath(route);
};

export const resolveRelativeRouteUrl = (route: string) => {
  const baseUrl = `${window.location.origin}${getBasePath()}`;
  const routePath = getRelativeRouteValue(route).replace(/^\/+/, '');
  return new URL(routePath, baseUrl).toString();
};
