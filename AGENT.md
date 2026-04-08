# AGENT.md

## Purpose

This file defines the coding contract for contributors and coding agents working on **Hive Keychain**.

The goals are:

- keep the codebase **stable, readable, and predictable**;
- favor **reusability** over duplication;
- require **tests for behavior changes**;
- minimize **code creep** and avoid clever-but-fragile abstractions;
- preserve existing project structure and naming patterns unless there is a strong reason to change them.

When in doubt: **make the smallest correct change that fits existing patterns**. The repo is a wallet extension, not a creative writing contest.

---

## Project context

This repository is a browser extension with multiple surfaces:

- `src/background` → extension background logic and request handling
- `src/content-scripts` → injected / bridge logic for websites
- `src/dialog` → approval / signing dialogs
- `src/popup` → main extension UI
- `src/common-ui` → reusable UI primitives and shared UI blocks
- `src/utils` → shared utilities
- `src/interfaces` → shared interfaces and types
- `src/reference-data` → enums, constants, reference lists
- `src/__tests__` → test coverage, generally mirroring runtime structure

The codebase is mostly **TypeScript + React** with **SCSS**, **Webpack**, **Jest**, and browser-extension APIs.

---

## Non-negotiable principles

### 1) Minimum code creep

Every change must justify its existence.

- Do **not** introduce new abstractions unless at least one of these is true:
  - the logic is already duplicated;
  - the logic is clearly shared across modules;
  - the current structure makes testing or correctness meaningfully worse.
- Do **not** add generic helpers “for future use”.
- Do **not** rewrite unrelated files while touching a feature.
- Do **not** rename files, symbols, or folders unless the rename removes real ambiguity or fixes a broken convention.
- Prefer **surgical patches** over broad refactors.
- Keep public behavior unchanged unless the task explicitly requires otherwise.

### 2) Reuse before adding

Before creating new code, check whether the repo already has:

- a utility in `src/utils`;
- a reusable UI component in `src/common-ui`;
- an existing enum or interface in `src/reference-data` or `src/interfaces`;
- an existing logic/helper file near the feature;
- an existing test helper or mocking pattern in `src/__tests__`.

If something suitable already exists, reuse or extend it instead of reimplementing it.

### 3) Tests are part of the change

For any non-trivial behavior change:

- add or update tests in `src/__tests__`;
- prefer targeted tests close to the affected domain;
- cover success path, failure path, and regression risk when practical;
- do not ship logic-only changes without tests unless the change is truly mechanical.

### 4) Explicit beats implicit

This repo should favor code that is easy to read quickly.

- choose explicit names;
- choose explicit return values and guard clauses;
- prefer narrow helpers with clear inputs/outputs;
- avoid hidden side effects;
- avoid “magic” data reshaping in the middle of UI code.

---

## Repo conventions to preserve

These conventions are already strongly present in the codebase and should be followed.

### File naming

Use lowercase, hyphen-separated filenames.

Examples from the repo:

- `button.component.tsx`
- `requests.utils.ts`
- `provider-compatibility.test.ts`
- `local-storage-key.enum.ts`
- `initializeWallet.logic.current.test.ts`

Use descriptive suffixes consistently:

- `*.component.tsx` → React components
- `*.utils.ts` → utilities
- `*.logic.ts` → business logic helpers
- `*.module.ts` → service-like or grouped runtime modules
- `*.actions.ts` → Redux / action-related code
- `*.interface.ts` → interfaces and related types
- `*.enum.ts` → enums
- `*.list.ts` → reference lists/config lists
- `*.test.ts` / `*.test.tsx` → tests

Rules:

- filenames must describe the responsibility, not implementation trivia;
- avoid vague names like `helpers.ts`, `misc.ts`, `temp.ts`, `new.ts`;
- if a file serves one main responsibility, name it after that responsibility.

### Function naming

Function names must be explicit and intention-revealing.

Prefer names like:

- `getDefaultChains`
- `removeChainFromSetupChains`
- `sendRequestToBackground`
- `getProviderChainWithTimeout`

Avoid names like:

- `handleData`
- `processStuff`
- `run`
- `fix`
- `doWork`

Rules:

- use verbs for functions;
- use `get`, `set`, `add`, `remove`, `create`, `build`, `format`, `parse`, `validate`, `send`, `load`, `save`, `init` when they match the behavior;
- handlers should be named by event or action: `handleSubmit`, `handleClick`, `onClose`;
- boolean-returning helpers should read like predicates: `isValidChain`, `isWhitelisted`, `hasMoreThanXDecimal`.

### Prefer arrow functions

The codebase mostly uses arrow functions and new code should do the same.

Use:

```ts
const getChain = async (chainId: string) => {
  ...
};
```

Prefer arrow functions for:

- module-level helpers;
- exported utilities;
- React components;
- callbacks.

Use function declarations only when there is a strong local reason, such as a pre-existing pattern in the file that would be made worse by mixing styles.

### Imports

The repo heavily uses absolute imports via aliases and `src/...` imports.

Prefer:

- alias imports such as `@popup/...`, `@background/...`, `@interfaces/...`;
- `src/...` absolute imports when no alias exists.

Avoid long relative paths like:

```ts
../../../../utils/foo
```

Rules:

- keep import style consistent within a file;
- prefer existing alias coverage over introducing new aliases casually;
- do not mix multiple paths to the same module in nearby files unless unavoidable.

### TypeScript

The repo is in `strict` mode. Respect it.

Rules:

- prefer explicit types for public functions and complex return values;
- avoid `any`; if unavoidable, keep it local and justified;
- prefer existing interfaces and enums over ad-hoc inline object typing for shared shapes;
- keep type narrowing close to where uncertain data enters the system;
- do not silence type errors with broad casts unless there is no safer alternative.

Preferred:

- `interface` for shared object contracts used across files;
- `enum` when the project already models the domain that way;
- narrow union types when possible;
- typed predicates when validating unknown input.

### React components

The codebase uses function components with explicit props interfaces.

Rules:

- define a `Props` interface or explicit exported props type for non-trivial components;
- keep components focused on rendering and user interaction;
- move parsing, formatting, and cross-feature business logic out of the component when it grows beyond a small local helper;
- derive display values outside JSX when that improves readability;
- avoid deeply nested inline logic in markup.

Preferred structure:

1. imports
2. props/type declarations
3. component
4. small local handlers/helpers
5. export

### Utilities

Utilities are heavily used in this repo and must stay disciplined.

Rules:

- a util file should contain **cohesive helpers** around one topic;
- do not dump unrelated helpers into one file because they are “small”;
- if logic depends on browser APIs, storage, or background state, think twice before calling it a utility;
- keep utilities deterministic where possible;
- prefer pure functions for formatting, parsing, mapping, sorting, and validation.

Good utility themes:

- request classification
- formatting
- storage access wrappers
- chain parsing/mapping
- transaction ordering
- domain filtering

Bad utility themes:

- “random helpers”
- mixed UI + API + storage logic in one file

### Enums, constants, and reference data

Put shared constants in the right place:

- `src/reference-data` for reference enums/keys/lists;
- feature-local constants near the feature when not shared;
- avoid duplicating hardcoded strings that already exist as constants or enums.

### Logging

Logging exists, but it should remain meaningful.

Rules:

- log events that help diagnose real runtime flows or fallback decisions;
- avoid noisy logs in hot paths unless temporary and explicitly needed;
- do not add console calls directly when `Logger` or an existing logging wrapper is the project pattern;
- log messages should be explicit and searchable.

Good:

- `Initialized chains from api`
- `Chains API returned an invalid or empty payload, using fallback source`

Bad:

- `here`
- `got data`
- `test`

### i18n

This is an extension with translation support.

Rules:

- do not hardcode user-facing strings when the surrounding code uses `chrome.i18n.getMessage`;
- preserve existing translation-key patterns;
- hardcoded strings are acceptable only for truly internal/non-user-facing values.

### Styling

The repo uses SCSS and component-oriented styling.

Rules:

- keep styles close to the component/feature they belong to;
- do not introduce new styling paradigms in one-off patches;
- prefer extending existing classes and design patterns over inventing parallel ones;
- keep class naming readable and feature-oriented.

---

## Preferred coding style

### Write small, explicit helpers

Prefer this:

```ts
const getChainFromDefaultChains = async (
  chainId: Chain['chainId'],
): Promise<Chain | undefined> => {
  const chains = await getDefaultChains();
  return chains.find(
    (chain) => chain.chainId.toLowerCase() === chainId.toLowerCase(),
  );
};
```

Over this:

```ts
const x = async (id: any) => (await getDefaultChains()).find((c: any) => ...);
```

### Favor guard clauses

Prefer early returns over deeply nested branching.

### Keep side effects obvious

If a function mutates storage, sends a message, writes state, or triggers navigation, that should be obvious from its name and location.

### Keep async flows readable

- prefer one clear async path over layered promise gymnastics;
- handle fallbacks in a readable order;
- keep retries/fallbacks local and explicit.

### Keep JSX readable

- move non-trivial conditions into named variables;
- avoid long chains of ternaries;
- avoid embedding transformation logic directly in JSX if it can be named once above.

---

## What agents should do before editing

Before making a change:

1. inspect the nearest similar file and copy its local conventions;
2. search for an existing helper/component before creating a new one;
3. locate the tests covering the same feature area;
4. understand whether the change belongs in:
   - UI only,
   - feature logic,
   - shared utils,
   - background/runtime module,
   - reference data/interface layer.

Do not jump to a shared abstraction if the behavior is only used once.

---

## Reusability rules

A piece of code should be extracted only when it is genuinely reusable.

Extract shared code when:

- the same business rule appears in multiple places;
- the same formatting/parsing/mapping is repeated;
- tests become easier and clearer with extraction;
- the extracted unit has a stable responsibility.

Do **not** extract when:

- it is only used once;
- extraction makes the call site less readable;
- the shared helper would need many feature-specific flags;
- the abstraction is broader than the real use case.

A good reusable helper has:

- a precise name;
- a small parameter surface;
- a stable return shape;
- no hidden UI or storage assumptions unless that is its explicit purpose.

---

## Testing contract

### General

Tests should mirror runtime behavior, not implementation trivia.

- prefer testing exported behavior over private internals;
- keep tests close to the runtime area they cover;
- follow existing naming patterns in `src/__tests__`;
- mock only what is needed;
- keep mocks explicit and local to the behavior under test.

### Required when changing behavior

Add/update tests when changing:

- request routing or validation;
- storage behavior;
- chain/rpc/bootstrap logic;
- transaction or operation parsing;
- UI rendering branches with meaningful business impact;
- fallback behavior;
- ordering/sorting/filtering logic;
- security-sensitive flows.

### Test naming

Test names should describe behavior clearly.

Good:

- `maps dapp chainId values to chain logos from DEFAULT_CHAINS`
- `omits chain badges when DEFAULT_CHAINS is unavailable`
- `sorts dapps by current chain first, Hive second, and others last`

### Regression mindset

For every bug fix, ask:

- what exact scenario broke?
- what is the minimal test that would have caught it?
- what adjacent scenario is likely to break next?

Then encode that in tests.

---

## Error handling contract

- validate untrusted input at boundaries;
- fail safely and predictably;
- avoid swallowing errors silently unless the fallback is intentional and tested;
- if a fallback path exists, log it when that is operationally useful;
- never leak sensitive data in logs or UI errors.

When catching errors:

- keep the catch scope narrow;
- return a safe value only if the caller can handle it meaningfully;
- avoid empty catches.

---

## Security and wallet-specific caution

This is a wallet/extension codebase. Extra discipline is required.

- do not weaken validation for convenience;
- do not loosen typing around request/transaction payloads without reason;
- do not broaden permissions, trust boundaries, or message acceptance casually;
- sanitize and validate any data coming from pages, APIs, storage, or external providers;
- keep privilege boundaries clear between content script, dialog, popup, and background;
- avoid leaking sensitive information through logs, thrown errors, or UI fallbacks.

---

## When editing existing files

Prefer **conforming to the file’s local style** unless that style is clearly harmful.

Examples:

- if a util file is already object-export based and widely imported, do not convert it to named exports in a feature patch;
- if a component folder already follows a certain naming pattern, keep it;
- if a test suite uses a specific mocking pattern, extend that pattern rather than introducing a new one beside it.

Consistency inside a file or feature is usually more valuable than imposing a new style midstream.

---

## What not to do

- do not add broad framework-like abstractions;
- do not create generic helpers with vague names;
- do not move unrelated files during a feature patch;
- do not duplicate interfaces/constants already present elsewhere;
- do not mix UI rendering, API calls, storage writes, and parsing in one large function when they can be separated cleanly;
- do not add tests that only snapshot noise and prove little;
- do not leave TODO-based half-implementations unless the task explicitly allows it;
- do not use relative import spaghetti;
- do not introduce inconsistent naming just because TypeScript will technically allow it.

---

## Recommended review checklist

Before submitting code, verify:

- filenames follow repo suffix conventions;
- names are explicit;
- new functions use arrow syntax unless there is a good reason not to;
- shared logic was reused instead of duplicated;
- no unnecessary abstraction was added;
- types are strict enough and `any` was avoided;
- user-facing strings use i18n where appropriate;
- logs are meaningful and not noisy;
- tests were added/updated for behavior changes;
- the patch is minimal and scoped;
- imports are consistent with repo conventions.

---

## Preferred defaults for new code

Unless the surrounding code strongly suggests otherwise, new code should default to:

- **lowercase hyphenated filenames**;
- **explicitly named arrow functions**;
- **named exports for utils**;
- **default exports for React components only when consistent locally**;
- **absolute imports via alias or `src/...`**;
- **strict typing**;
- **small focused helpers**;
- **tests alongside behavioral changes**;
- **minimal patch surface**.

---

## Final rule

A good change in this repo should feel boring in the best possible way:

- easy to review,
- easy to test,
- easy to reason about,
- and not mysteriously larger than the problem it solves.

If a patch looks smarter than it needs to be, it probably is.
