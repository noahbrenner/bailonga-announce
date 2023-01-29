/*
 * We want to re-export the `TemplateFunction` type from `ejs`, but if we use an
 * `import` statement in this file, the types defined here won't be available
 * in our project as ambient declarations. Instead, we're using TypeScript's
 * `import()` function, which doesn't have that side-effect.
 *
 * https://stackoverflow.com/questions/39040108/import-class-in-definition-file-d-ts
 */

declare module '*.ejs' {
    const templateFunction: import('ejs').TemplateFunction;
    export default templateFunction;
}
