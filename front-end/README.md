# front-end

## Tooling

- Written in JavaScript using the official ECMAScript module system (ESM)

- Developed using [React](https://react.dev/) and [TypeScript](https://www.typescriptlang.org/)

- Uses [vite](https://vitejs.dev/) to host and build the website
    - Native support for TypeScript and ESM
    - Uses [SWC](https://swc.rs/) instead of [Babel](https://babeljs.io/) to transpile (very fast!)
    - Automatically uses Rollup to minimize the build

- Uses [vitest](https://vitest.dev/) to run unit tests
    - Native support for TypeScript and ESM (unlike [Jest](https://jestjs.io/))
    - Very fast
    - Built-in mocking, asserting, coverage, and more
    - Few dependencies

## Setting up

```sh
cd front-end
npm install
```

To see your changes, use
```sh
npm run dev
```
and `vite` will host the website locally.

To build the website for production, use
```sh
npm run build
```
which will output the results in the `/dist` directory. To preview the built website, use
```sh
npm run preview
```

To run unit tests, use
```sh
npm run test
```

Before submitting any changes, be sure to use
```sh
npm run lint
```
