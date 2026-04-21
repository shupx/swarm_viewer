const ensureLeadingSlash = (value: string) => (value.startsWith('/') ? value : `/${value}`);

const ensureTrailingSlash = (value: string) => (value.endsWith('/') ? value : `${value}/`);

const normalizePath = (value: string) => ensureTrailingSlash(ensureLeadingSlash(value.trim() || '/'));

const looksLikeFilePath = (pathname: string) => {
  const lastSegment = pathname.split('/').filter(Boolean).pop() ?? '';
  return lastSegment.includes('.');
};

export const getBasePath = () => {
  const { pathname } = window.location;

  if (looksLikeFilePath(pathname)) {
    return normalizePath(pathname.slice(0, pathname.lastIndexOf('/') + 1));
  }

  return normalizePath(pathname);
};

export const getRouteValue = (route: string) => {
  return normalizePath(route);
};

export const resolveSiteRelativeRouteUrl = (route: string) => {
  return new URL(getRouteValue(route), window.location.origin).toString();
};

export const resolvePageRelativeRouteUrl = (route: string) => {
  const baseUrl = `${window.location.origin}${getBasePath()}`;
  const routePath = getRouteValue(route).replace(/^\/+/, '');
  return new URL(routePath, baseUrl).toString();
};
