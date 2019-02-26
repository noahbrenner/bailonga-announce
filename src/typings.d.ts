// `import` statements break global declarations, but this (hack) works:
// https://stackoverflow.com/questions/39040108/import-class-in-definition-file-d-ts
type TemplateFunction = import('ejs').TemplateFunction;

declare module '*.ejs.html' {
    const content: TemplateFunction;
    export default content;
}

declare module '*.ejs.txt' {
    const content: TemplateFunction;
    export default content;
}
