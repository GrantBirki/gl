# G + L 💍

[![deploy](https://github.com/GrantBirki/gl/actions/workflows/deploy.yml/badge.svg)](https://github.com/GrantBirki/gl/actions/workflows/deploy.yml) [![ci](https://github.com/GrantBirki/gl/actions/workflows/ci.yml/badge.svg)](https://github.com/GrantBirki/gl/actions/workflows/ci.yml) [![lint](https://github.com/GrantBirki/gl/actions/workflows/lint.yml/badge.svg)](https://github.com/GrantBirki/gl/actions/workflows/lint.yml) [![CodeQL](https://github.com/GrantBirki/gl/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/GrantBirki/gl/actions/workflows/codeql-analysis.yml)

Wedding website for Grant and Leah

[gl.birki.io](https://gl.birki.io) 🔗

![homepage](src/assets/images/default.png)

## Commands

All commands are run from the root of the project, from a terminal:

| Command                          | Action                                             |
| :------------------------------- | :------------------------------------------------- |
| `npm install`                    | Installs dependencies                              |
| `npm run dev`                    | Starts local dev server at `localhost:3000`        |
| `npm run build`                  | Build your production site to `./dist/`            |
| `npm run preview`                | Preview your build locally, before deploying       |
| `npm run format`                 | Format codes with Prettier                         |
| `npm run lint:eslint`            | Run Eslint                                         |
| `npm run astro ...`              | Run CLI commands like `astro add`, `astro preview` |
| `npm run bootstrap`              | Bootstraps the project                             |
| `script/generate-gallery-images` | Generate gallery images                            |

## Development

Here are some basic commands to get you up and running to develop with this template:

1. Install `npm` dependencies

   ```bash
   npm i
   ```

2. Start the development server

   ```bash
   npm start
   ```

3. View your site at [`localhost:3000`](http://localhost:3000/)

> Live reload is enabled by default, so any changes you make will be reflected in the browser.

## Build Cache

This templates also uses a custom GitHub Actions build cache to help speed things up in CI when processing images. If you make any changes to images when working on a project using this template, please ensure to run `npm run build` before deploying to ensure your `cache.json` file is updated.
