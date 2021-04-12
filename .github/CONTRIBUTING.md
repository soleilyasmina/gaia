![GA Cog](./cog.png)

# Contributing to GAIA

## Table of Contents

- [Welcome!](#welcome)
- [Git Conventions](#git-conventions)
- [Style Conventions](#style-conventions)

## Welcome!

Welcome to GAIA, the SEI NYC toolkit for doing all of the tedium with less effort. We always want new ideas and contributors to ensure we're doing the most to make our work easier. There are a variety of tools in this kit, but the majority of them rely on the following:

- Node.js
- Bash
- JQ (Shell JSON parser)

Currently, there is support for Node.js and Ruby (insofar as git-over-here goes). Future support for Python could be useful, but is not necessary at the moment.

## Git Conventions

Here's a brief list of the Git conventions when contributing to the repository:

1. please do not merge your fork's main branch, please do so through a branch
2. naming conventions are:
    - `doc/some-docs` for documentation updates
    - `feature/some-feature` for feature branches
    - `fix/some-fix` for bug fixes
3. please merge to the development branch as opposed to the main branch, as the main branch is for releases

## Style Conventions

When working in Node.js, please use 2 spaces for your tabs. This generally follows the [airbnb Style Guide](https://github.com/airbnb/javascript). When working on documentation, please use [Alex](https://alexjs.com/) to lint your Markdown.
