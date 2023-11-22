// Conditional ESM module loading (Node.js and browser)
// @ts-ignore: Property 'UrlPattern' does not exist 
if (!globalThis.URLPattern) { 
  await import("urlpattern-polyfill");
}

export interface URLPatternInit {
  baseURL?: string;
  username?: string;
  password?: string;
  protocol?: string;
  hostname?: string;
  port?: string;
  pathname?: string;
  search?: string;
  hash?: string;
}

export type URLPatternInput = URLPatternInit | string;
export type MatchingPagePatterns = (URLPattern | URLPatternInput)[]

export const protectedPages: URLPatternInput[] = [ 
  { pathname: `/profile` }, 
];

export const protectedPagePatterns = protectedPages.map((pattern) => {
	return new URLPattern(pattern)
});

export function isProtected(path: string, patterns: MatchingPagePatterns = protectedPagePatterns) {
	return patterns.some((pattern) => { 
		return pattern instanceof URLPattern ? 
			pattern.test(path) : 
			new URLPattern(pattern).test(path); 
	})
}