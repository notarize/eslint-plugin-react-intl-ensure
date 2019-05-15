<h1 align="center">ESLint Plugin React Intl Ensure</h1>
<p align="center">ESLint plugin that ensures your intl is up to spec.</p>

## Installation

```sh
npm i @notarize/eslint-plugin-react-intl-ensure --save-dev
# or
yarn add --dev @notarize/eslint-plugin-react-intl-ensure
```

## Usage

Configure in your eslint config file:

```json
{
  "plugins": ["@notarize/react-intl-ensure"],
  "rules": {
    "@notarize/react-intl-ensure/id-is-valid-uuid": "error"
  }
}
```

## Rules

<!-- prettier-ignore -->
| Name                                                         | Description                                                                                                                        |
| ---                                                          | ---                                                                                                                                |
| `@notarize/react-intl-ensure/id-is-valid-uuid` | Require that calls to `defineMessages` and `FormattedMessage` have UUID IDs. The `--fix` option will overwrite the ID with a UUID. |
