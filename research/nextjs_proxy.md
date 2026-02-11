# **The Architectural Evolution of Request Interception: A Comprehensive Analysis of Next.js 16 and the Proxy Standard**

The transition from the legacy middleware.ts convention to the formalized proxy.ts standard in Next.js 16 represents a fundamental shift in how the framework conceptualizes the network boundary of modern web applications.1 This evolution is not merely a semantic renaming of a file convention but a strategic response to the shifting requirements of full-stack React architectures, specifically the need for clearer separation between request-level routing logic and application-level business logic.3 By establishing the proxy.ts file as the primary mechanism for early request interception, Next.js 16 addresses long-standing ambiguities regarding the role of "middleware" in a serverless and edge-first world, while simultaneously expanding the technical capabilities available to developers through the stabilization of the Node.js runtime for these operations.5

## **The Philosophy of the Network Boundary and the Motivations for Change**

The shift from middleware.ts to proxy.ts is rooted in a desire to align the framework’s nomenclature with the actual behavior of the request pipeline.2 Historically, the term "middleware" in the JavaScript ecosystem was popularized by frameworks like Express.js, where it typically referred to functions that executed within the same process as the route handlers, sharing a common request-response object and often performing heavy lifting such as database hydration or complex session management.4 However, Next.js Middleware was architecturally distinct, running in a restricted Edge Runtime (V8 isolates) that lacked many standard Node.js APIs, leading to significant developer friction when attempting to port existing patterns into the Next.js ecosystem.4

The renaming to proxy.ts clarifies that this layer serves as a "network boundary" or a "lightweight routing layer" that sits between the external network and the core application.1 This distinction is critical for maintaining high-performance applications; by framing the feature as a proxy, the framework encourages developers to keep this layer thin, focusing on tasks such as URI rewriting, redirection, and header manipulation, rather than embedding complex authorization or data-fetching logic that would better reside within Server Components or Server Actions.1

| Concept | Legacy Middleware Paradigm | Modern Proxy Paradigm |
| :---- | :---- | :---- |
| **Architectural Role** | Ambiguous interceptor often mistaken for Express-style middleware.2 | Explicit network boundary and routing layer.1 |
| **Mental Model** | Part of the application logic chain.4 | Intermediary sitting in front of the application.12 |
| **Developer Intent** | Often used for complex session management.11 | Reserved for traffic control and optimistic checks.1 |
| **Inversion of Control** | Implicit execution before all routes.8 | Explicit interception defining where the app begins.3 |

The ambiguity of the "middleware" label frequently led to architectural anti-patterns, such as attempting to validate deep JWT signatures or perform database lookups within the Edge-based middleware file.10 These operations often failed or performed poorly due to the limitations of the Edge Runtime, such as the absence of filesystem access or the incompatibility of certain cryptographic libraries.9 By adopting the "proxy" terminology, the framework signals that this layer is intended for operations that can be performed with minimal latency, ideally those that could eventually be offloaded to a CDN or a standalone proxy server.12

## **Technical Foundations: The Shift to the Node.js Runtime**

A cornerstone of the Next.js 16 update is the stabilization of the Node.js runtime for the proxy.ts file.5 While previous versions of Next.js relied almost exclusively on the Edge Runtime for request interception, Next.js 16 allows the proxy function to run within the full Node.js environment by default.5 This change is transformative for the "potential" of the file, as it eliminates the "painful" limitations of V8 isolates and provides access to the comprehensive ecosystem of Node.js modules and APIs.6

### **Runtime Comparison and Capability Mapping**

The move to Node.js addresses the overwhelming feedback that the Edge Runtime was too restrictive for real-world enterprise requirements.10 Developers can now integrate robust logging libraries, interact directly with native Node.js modules for monitoring, and use standard identity provider SDKs that were previously incompatible with the Edge.8

| Capability | Edge Runtime (Legacy) | Node.js Runtime (Modern Proxy) |
| :---- | :---- | :---- |
| **API Surface Area** | Restricted (Web APIs only).9 | Full Node.js API surface.5 |
| **Filesystem Access** | None (Security restriction).9 | Full access (within process limits).9 |
| **Native Modules** | Unsupported.9 | Fully supported.6 |
| **Dynamic Execution** | Highly restricted.9 | Standard Node.js behavior.6 |
| **Cold Start Speed** | Extremely fast (Microseconds).8 | Fast (Optimized for BFF patterns).8 |

Despite the benefits of the Node.js runtime, the framework maintains support for the Edge Runtime via the legacy middleware.ts filename for specific use cases where global distribution and minimal latency are the primary drivers.5 However, this legacy convention is deprecated and serves as a transitionary path toward a future where the proxy layer is unified under a single, predictable runtime.5

### **Infrastructure Implications: Turbopack and Build Speeds**

The introduction of proxy.ts coincides with Turbopack becoming the default bundler for Next.js 16\.3 Turbopack’s incremental computation engine is written in Rust and is designed to handle the complexity of modern request-handling pipelines with significantly lower overhead than Webpack.15 This integration is vital for the proxy layer because proxy.ts is often the most frequently modified file during the development of routing and security logic.12

The transition to Turbopack delivers up to 10x faster Fast Refresh and 5x faster production builds, ensuring that modifications to the proxy.ts logic are reflected almost instantly in the developer's feedback loop.5 This performance boost is particularly beneficial for large-scale monorepos or applications with hundreds of routes, where the overhead of recompiling the middleware/proxy layer for every change was previously a significant bottleneck.15

## **Implementation Syntax and Configuration of proxy.ts**

The syntax for proxy.ts in Next.js 16 is designed to be familiar to those who used Middleware while introducing stricter conventions to ensure build-time optimization and runtime predictability.12 The file must reside at the project root or within the /src directory, maintaining the same level as the app or pages folders.12

### **Core Function Export Patterns**

The proxy.ts file must export a single function, which can be either a named export called proxy or a default export.11 This function receives a NextRequest object—an extension of the standard Web Request API—and must return a NextResponse or a standard Response.13

TypeScript

// Standard Named Export Syntax  
import { NextResponse } from 'next/server';  
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {  
  // Logic to modify the request or response  
  return NextResponse.next();  
}

// Alternative Default Export Syntax  
export default function proxy(request: NextRequest) {  
  // Logic to redirect or rewrite  
  return NextResponse.redirect(new URL('/home', request.url));  
}

The ability to mark the proxy function as async is a critical feature, particularly when the proxy must perform lightweight I/O, such as checking a Redis-backed rate limiter or fetching a feature flag from an external service.8 However, the framework continues to caution against "slow data fetching" within this layer, as the proxy blocks the entire request-response cycle until it completes.11

### **Modularization and Organization**

While Next.js only supports a single proxy.ts file per project, developers are encouraged to organize their logic into separate modules.11 This is especially relevant for enterprise applications where the proxy must handle diverse concerns such as authentication, internationalization, and multi-zone routing.11 By breaking functionalities into separate .ts files and aggregating them in the main proxy.ts, teams can maintain a centralized control point without creating a "monolithic" and unmaintainable middleware file.11

### **The Config Object and Advanced Static Matchers**

The config object in proxy.ts is the mechanism by which the framework optimizes the execution path.13 By defining a matcher, developers can ensure the proxy only runs on relevant requests, avoiding the overhead of executing JavaScript for static assets, images, or internal Next.js files.8

#### **Standard Path Matching**

The most basic matcher is a string or an array of strings representing the paths where the proxy should be invoked.13 Next.js 16 supports named parameters, modifiers (zero or more \*, one or more \+, zero or one ?), and regular expressions enclosed in parentheses.13

| Matcher Type | Example Syntax | Matching Behavior |
| :---- | :---- | :---- |
| **Static Path** | '/about' | Matches only /about. 13 |
| **Multiple Paths** | \['/about', '/contact'\] | Matches either /about or /contact. 13 |
| **Named Parameter** | '/about/:path' | Matches /about/a but not /about/a/b. 13 |
| **Wildcard** | '/about/:path\*' | Matches /about/a/b/c (zero or more). 13 |
| **Negative Lookahead** | '/( (?\!api|\_next/static|.\*\\\\.png$).\*)' | Excludes API routes, static files, and PNGs. 8 |

#### **Conditional Matching with "has" and "missing"**

A significant advancement in the proxy.ts configuration is the support for conditional matching based on request headers, query parameters, or cookies.13 This allows the framework to determine whether to run the proxy based on the *state* of the incoming request without ever invoking the JavaScript function, providing a massive performance win at the network edge.13

The matcher property accepts an array of objects, where each object can contain source, locale, has, and missing keys.13

TypeScript

export const config \= {  
  matcher:,  
      missing: \[  
        { type: 'cookie', key: 'session', value: 'active' }  
      \],  
    },  
  \],  
};

This syntax enables scenarios where the proxy is only triggered if a user *has* a specific token but *is missing* an active session cookie, effectively automating the logic for initiating an authentication flow or a session upgrade.13 It is critical to note that matcher values must be constants to allow for static analysis at build-time; dynamic variables will be ignored by the compiler.13

## **Security Architectures: Authentication and Authorization Boundaries**

Next.js 16 introduces a refined security model that leverages proxy.ts as the primary gatekeeper for "optimistic" checks while moving the heavy lifting of authorization downstream.1 This architectural shift is designed to improve the security posture of applications by making authentication and authorization boundaries explicit and predictable.1

### **The Role of Optimistic Security Checks**

The proxy layer is the ideal location for high-level traffic control.1 In an authentication context, this typically involves checking for the existence of a session cookie or an authorization header.1 If these credentials are absent, the proxy can immediately issue a redirect to a login page, preventing the request from ever reaching the server components or API routes that might otherwise attempt to process unauthorized data.1

TypeScript

export function proxy(request: NextRequest) {  
  const token \= request.cookies.get('auth\_token');  
    
  if (\!token) {  
    // Redirect unauthenticated users immediately  
    return NextResponse.redirect(new URL('/login', request.url));  
  }  
    
  return NextResponse.next();  
}

This approach follows the "fail-fast" principle, reducing the resource consumption of the server when dealing with unauthorized requests.8 However, the framework documentation is explicit that proxy.ts is *not* intended for full session management or complex authorization, such as validating the cryptographic signature of a JWT or checking granular user permissions.1 These tasks should live closer to the data in Server Components or Server Actions, where they can benefit from the full Node.js environment and more robust data-fetching capabilities.1

### **Auth0 and Identity Provider Integration**

The evolution toward proxy.ts has direct implications for third-party identity providers like Auth0.1 The nextjs-auth0 SDK is being updated to align with these new boundaries, encouraging a pattern where the proxy handles the initial redirect to the Auth0 login page, while the server components use the SDK's server-side methods to hydrate the user session and perform permission checks.1

This clear separation of concerns ensures that the "edge logic" remains simple and fast, while the "application logic" handles the complexity of the identity protocol.1 For developers using Auth0, the proxy.ts file effectively becomes the "enforcer" of the authentication boundary, while the Auth0Client in the application layer serves as the "validator" of the user's identity.1

### **Caching Defaults and Data Leaks**

Security in Next.js 16 is further enhanced by the new "dynamic by default" caching model.1 When cacheComponents: true is enabled, the framework no longer attempts to cache dynamic data by default; instead, developers must explicitly opt-in using the use cache directive.1 This shift significantly reduces the risk of accidental data leaks, where the authorized data of one user might be served to another from a shared cache.1

When combined with proxy.ts, this model ensures that authorization checks happen in real-time for every request.1 If the proxy allows a request through, the developer can be confident that the downstream components will perform their own real-time role checks before rendering any sensitive UI.1

## **The Evolution of Caching and "Read-Your-Writes" Semantics**

A major theme of Next.js 16 is the replacement of "brittle" ISR (Incremental Static Regeneration) workflows with explicit caching APIs that provide granular control over when and how content is updated.3 While these APIs primarily live in Server Actions and Components, their behavior is inextricably linked to the request interception logic in proxy.ts.1

### **updateTag() and Immediate UI Feedback**

The updateTag() API is a new addition to Server Actions that provides "read-your-writes" semantics.1 In a security context, this is critical: if a user updates their profile or changes their account settings, the application must reflect those changes immediately on the very next render.1

| API | Use Case | consistency Model |
| :---- | :---- | :---- |
| revalidateTag(tag, profile) | General content updates (e.g., blog posts). 6 | Eventual consistency (SWR). |
| updateTag(tag) | Critical state changes (e.g., role changes). 1 | Immediate consistency (Read-your-writes). |
| refresh() | Triggering a client-side router refresh. 6 | Instant UI synchronization. |

The proxy.ts file supports this model by ensuring that the headers and cookies used to drive these caching decisions are correctly intercepted and forwarded to the rest of the application.13 If a permission is revoked, the combination of proxy.ts blocking the request at the boundary and updateTag() clearing the cached authorized content ensures that the change takes effect instantly.1

### **The use cache Directive and Personalized Data**

Next.js 16 introduces the use cache directive, which leverages the compiler to automatically generate cache keys.3 To prevent cross-user data leakage, developers must pass unique identifiers (such as a userId) as arguments to functions using use cache.1 The proxy.ts file often plays a role here by extracting the userId from a secure session cookie and injecting it into the request headers, making it easily accessible to the downstream functions that need to generate user-specific cache keys.1

## **Advanced Routing Patterns: Multi-Zones and BFF Layers**

The potential of proxy.ts extends far beyond simple redirects; it is a primary tool for orchestrating complex application architectures, such as Multi-Zone microfrontends and Backend-for-Frontend (BFF) layers.12

### **Orchestrating Microfrontends with Multi-Zones**

In a Multi-Zone architecture, a single domain is served by multiple independently deployed Next.js applications.12 A "shell" application (typically the marketing site or homepage) acts as the entry point, using proxy.ts to decide which sub-application should handle a specific path.21

Vercel’s multi-zone pattern leverages a microfrontends.json configuration file to map paths like /docs or /shop to different microservice ports.21 The proxy.ts function in the shell application performs dynamic proxying, recognizing these routes and seamlessly forwarding the request to the correct microfrontend.12

TypeScript

// shell-app/proxy.ts  
import { NextResponse } from 'next/server';

export function proxy(request) {  
  const { pathname } \= request.nextUrl;  
    
  if (pathname.startsWith('/docs')) {  
    // Dynamic rewrite to the documentation microfrontend  
    return NextResponse.rewrite(new URL('https://docs-app.internal' \+ pathname));  
  }  
    
  return NextResponse.next();  
}

This pattern allows large teams to develop, test, and deploy their parts of the application independently while maintaining a unified experience for the end-user.21

### **The Proxy as a BFF Facade**

Next.js 16 increasingly positions itself as a robust BFF layer for modern frontends.12 The proxy.ts file can act as an API facade, aggregating data from multiple microservices or transforming external API responses before they reach the React application.12

For e-commerce platforms, the proxy might sit in front of dynamic inventory or pricing APIs.12 While the product pages themselves are statically generated (SSG) for performance, the proxy intercepts requests for real-time data, providing an elegant place to manage authentication, domain consolidation, and A/B experimentation without building a full custom server.12

## **Performance and Observability: Request Logs and AI Debugging**

The move to proxy.ts is accompanied by significant improvements in developer experience, particularly regarding how request timing and errors are visualized.5

### **Extended Request Logs**

Next.js 16 extends the development request logs to show exactly where time is spent during the request lifecycle.5 The logs are now broken down into "Compile" (routing and compilation) and "Render" (React rendering and code execution).5 This transparency is vital for debugging proxy.ts, as it allows developers to see if a specific rewrite or header modification is introducing unexpected latency before the rendering even begins.5

### **Next.js DevTools and the Model Context Protocol (MCP)**

A groundbreaking feature in Next.js 16 is the introduction of DevTools MCP.5 MCP is a protocol that allows AI agents and development tools to gain deep context about an application's routing, caching, and rendering behavior.5

When a developer encounters an error in their proxy.ts file or a matcher fails to behave as expected, the AI agent can access:

* **Unified Logs**: A single view of both browser and server logs.5  
* **Page Awareness**: Contextual understanding of the active route and its configuration.5  
* **Stack Traces**: Detailed error information without manual copying and pasting.5

This integration speaks "Next.js natively," dramatically shortening the path from identifying an error in the proxy layer to resolving it.3

## **Real-World Implementation: API Rate Limiting**

The potential of the Node.js runtime in proxy.ts is perhaps most evident in the implementation of in-memory or Redis-based rate limiting.8 Unlike the Edge Runtime, where persistent in-memory state was difficult to maintain due to the ephemeral nature of V8 isolates, the Node.js-based proxy can use established rate-limiting algorithms to protect API endpoints.8

### **The Fixed Window Algorithm**

In a fixed window rate-limiting algorithm, the proxy tracks the number of requests made by a specific IP address within a defined time period.8 If the threshold is exceeded, the proxy blocks any subsequent requests and returns a 429 Too Many Requests status code.8

TypeScript

// proxy.ts Rate Limiting Example  
import { proxy } from "next/server";

export default proxy(async (req) \=\> {  
  const ip \= req.ip |

| "unknown";  
  const allowed \= await checkRateLimit(ip); // Custom logic using Redis or in-memory cache  
    
  if (\!allowed) {  
    return new Response("Too Many Requests", { status: 429 });  
  }  
    
  return Response.next();  
});

This pattern is essential for preventing API abuse and ensuring the stability of the application under heavy load.8 Because the proxy runs *before* routing, the expensive work of rendering the page or executing a route handler is completely avoided for blocked requests.8

## **Migration Strategies and Pitfalls**

Upgrading from middleware.ts to proxy.ts is designed to be automated, but it requires a conscious audit of existing logic to ensure it aligns with the new runtime and naming conventions.3

### **Automated Migration with Codemods**

The most efficient way to migrate is by using the Next.js codemod: npx @next/codemod@canary upgrade latest.2 This tool automatically renames middleware.ts to proxy.ts, updates the exported function name, and adjusts the configuration to match version 16 standards.2

### **The Cloudflare Proxy Issue**

A critical "actual result" identified by the developer community involves deploying Next.js 16 behind a Cloudflare Proxy.23 In certain configurations (specifically when Cloudflare's "orange-cloud" proxy is enabled), the proxy.ts file may fail to execute in production, even if it works perfectly in local development.23

This issue highlights the importance of thorough environment-specific testing.3 The behavior occurs because the Cloudflare Proxy can modify the incoming request headers in a way that interferes with the Next.js server's ability to invoke the proxy function.23 Developers facing this issue are advised to audit their Cloudflare transformation rules and verify that the proxy.ts file is not being bypassed by edge-level caching or redirection logic.3

### **Deployment and CDN Optimization**

Because proxy.ts is intended to be invoked separately from the render code, it can be deployed to the CDN for fast redirect and rewrite handling.13 However, this deployment model imposes strict constraints: developers should not rely on shared globals or modules between the proxy and the rest of the application.13 Information must be passed via standard HTTP mechanisms—cookies, headers, and URL parameters—to ensure the proxy remains a stateless, high-performance interceptor.13

## **Comparative Analysis of Request Handling Layers**

With the arrival of proxy.ts, the Next.js request lifecycle is more structured than ever before.13 Understanding where the proxy sits in relation to other features is key to utilizing its full potential.11

| Layer | Execution Order | Best Use Case |
| :---- | :---- | :---- |
| **next.config.js** | First (Static) | Global headers and simple path-based redirects. 11 |
| **proxy.ts** | Second (Dynamic) | Auth redirects, A/B testing, and dynamic rewrites. 12 |
| **Middleware (Legacy)** | Parallel (Edge) | Low-latency globally distributed routing logic. 5 |
| **Route Handlers** | Third (After Routing) | Standard REST APIs and data transformation. 12 |
| **Server Components** | Fourth (Rendering) | Data fetching and building the UI. 1 |

The proxy layer occupies a "sweet spot" in this hierarchy.11 It is more powerful than static configuration because it can execute code, but it is more efficient than route handlers because it runs before the framework attempts to match the request to the filesystem or render a React tree.12

## **Summary of the proxy.ts Transformation**

The potential of proxy.ts in Next.js 16 represents a maturation of the framework's server model.1 By clarifying the role of request interception, stabilizing the Node.js runtime, and introducing advanced matching and caching APIs, Next.js 16 provides a professional-grade toolkit for building secure, high-performance applications.1

Key takeaways for architectural planning include:

* **Clarified Boundary**: Use proxy.ts as a network boundary, not a business logic container.1  
* **Predictable Runtime**: Leverage the Node.js environment for robust logging and SDK integration.5  
* **Advanced Matching**: Offload conditional logic to the config object’s has and missing keys to maximize performance.13  
* **Integrated Security**: Combine "optimistic" proxy checks with "read-your-writes" caching APIs for a bulletproof security posture.1

The move to proxy.ts is not just a renaming of a file; it is a fundamental redesign of how requests are handled, ensuring that as Next.js applications grow in complexity, their routing and security foundations remain clear, maintainable, and lightning-fast.3

#### **Works cited**

1. Next.js 16: What's New for Authentication and Authorization \- Auth0, accessed February 7, 2026, [https://auth0.com/blog/whats-new-nextjs-16/](https://auth0.com/blog/whats-new-nextjs-16/)  
2. Renaming Middleware to Proxy \- Next.js, accessed February 7, 2026, [https://nextjs.org/docs/messages/middleware-to-proxy](https://nextjs.org/docs/messages/middleware-to-proxy)  
3. How Next.js 16's New Turbopack and Caching Mechanisms Change Your Development Experience \- Strapi, accessed February 7, 2026, [https://strapi.io/blog/next-js-16-features](https://strapi.io/blog/next-js-16-features)  
4. Next.js 16 Beta replaces middleware.ts with proxy.ts — what do you think about the rename? : r/nextjs \- Reddit, accessed February 7, 2026, [https://www.reddit.com/r/nextjs/comments/1o4me50/nextjs\_16\_beta\_replaces\_middlewarets\_with\_proxyts/](https://www.reddit.com/r/nextjs/comments/1o4me50/nextjs_16_beta_replaces_middlewarets_with_proxyts/)  
5. Next.js 16, accessed February 7, 2026, [https://nextjs.org/blog/next-16](https://nextjs.org/blog/next-16)  
6. Next.js 16: Complete Guide to Cache Components, Turbopack, and Revolutionary Features, accessed February 7, 2026, [https://www.nandann.com/blog/nextjs-16-release-comprehensive-guide](https://www.nandann.com/blog/nextjs-16-release-comprehensive-guide)  
7. Rename middleware.ts in NextJs 16 Beta · vercel next.js · Discussion \#84842 \- GitHub, accessed February 7, 2026, [https://github.com/vercel/next.js/discussions/84842](https://github.com/vercel/next.js/discussions/84842)  
8. Next.js 16 Update: middleware Is Now proxy — What Developers ..., accessed February 7, 2026, [https://medium.com/@amitupadhyay878/next-js-16-update-middleware-js-5a020bdf9ca7](https://medium.com/@amitupadhyay878/next-js-16-update-middleware-js-5a020bdf9ca7)  
9. Edge Runtime \- API Reference \- Next.js, accessed February 7, 2026, [https://nextjs.org/docs/app/api-reference/edge](https://nextjs.org/docs/app/api-reference/edge)  
10. Next.js Runtimes: Edge vs. Node.js : r/nextjs \- Reddit, accessed February 7, 2026, [https://www.reddit.com/r/nextjs/comments/1idjr5i/nextjs\_runtimes\_edge\_vs\_nodejs/](https://www.reddit.com/r/nextjs/comments/1idjr5i/nextjs_runtimes_edge_vs_nodejs/)  
11. Getting Started: Proxy | Next.js, accessed February 7, 2026, [https://nextjs.org/docs/app/getting-started/proxy](https://nextjs.org/docs/app/getting-started/proxy)  
12. Using Proxy (before Middleware) in Next.js: a modern layer \- DEV Community, accessed February 7, 2026, [https://dev.to/u11d/using-proxy-before-middleware-in-nextjs-a-modern-layer-1iik](https://dev.to/u11d/using-proxy-before-middleware-in-nextjs-a-modern-layer-1iik)  
13. File-system conventions: proxy.js | Next.js, accessed February 7, 2026, [https://nextjs.org/docs/app/api-reference/file-conventions/proxy](https://nextjs.org/docs/app/api-reference/file-conventions/proxy)  
14. Next.js 16 Route Handlers Explained: 3 Advanced Use Cases \- Strapi, accessed February 7, 2026, [https://strapi.io/blog/nextjs-16-route-handlers-explained-3-advanced-usecases](https://strapi.io/blog/nextjs-16-route-handlers-explained-3-advanced-usecases)  
15. Next.js 15 vs. Next.js 16: What's the Difference? \- Descope, accessed February 7, 2026, [https://www.descope.com/blog/post/nextjs15-vs-nextjs16](https://www.descope.com/blog/post/nextjs15-vs-nextjs16)  
16. Upgrading: Version 16 | Next.js, accessed February 7, 2026, [https://nextjs.org/docs/app/guides/upgrading/version-16](https://nextjs.org/docs/app/guides/upgrading/version-16)  
17. File-system conventions: Proxy | Next.js, accessed February 7, 2026, [https://nextjs.org/docs/pages/api-reference/file-conventions/proxy](https://nextjs.org/docs/pages/api-reference/file-conventions/proxy)  
18. Guides: Authentication \- Next.js, accessed February 7, 2026, [https://nextjs.org/docs/app/guides/authentication](https://nextjs.org/docs/app/guides/authentication)  
19. auth0/nextjs-auth0: Next.js SDK for signing in with Auth0 \- GitHub, accessed February 7, 2026, [https://github.com/auth0/nextjs-auth0](https://github.com/auth0/nextjs-auth0)  
20. Add Login to Your Next.js Application \- Auth0 Docs, accessed February 7, 2026, [https://auth0.com/docs/quickstart/webapp/nextjs](https://auth0.com/docs/quickstart/webapp/nextjs)  
21. Next.js Multi-Zones Starter \- Vercel, accessed February 7, 2026, [https://vercel.com/templates/next.js/microfrontends-multi-zones](https://vercel.com/templates/next.js/microfrontends-multi-zones)  
22. How to Build an In-Memory Rate Limiter in Next.js \- freeCodeCamp, accessed February 7, 2026, [https://www.freecodecamp.org/news/how-to-build-an-in-memory-rate-limiter-in-nextjs/](https://www.freecodecamp.org/news/how-to-build-an-in-memory-rate-limiter-in-nextjs/)  
23. proxy.ts does not execute in production when behind Cloudflare Proxy (middleware.ts works) · Issue \#86122 · vercel/next.js \- GitHub, accessed February 7, 2026, [https://github.com/vercel/next.js/issues/86122](https://github.com/vercel/next.js/issues/86122)