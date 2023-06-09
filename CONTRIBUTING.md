## Pull Request Guidelines

- Fork this repository to your own account.

### When adding/modifying/renaming any attribute method or event 
  **MUST HAVE**
  - Must be supported with an issue and provide little description about it, including the name, allowed values, defaults etc
  - Add relevant documentation, (possibly in `./docs/documentation.md`)

## Prerequisites
`Node 16+` and `npm 6.14.4+` are required.

For development:
```shell
git clone https://github.com/Authress/component-library.js.git
yarn
yarn start
# open http://localhost:8080
```

To generate the static production bundle:
```shell
yarn build
```
