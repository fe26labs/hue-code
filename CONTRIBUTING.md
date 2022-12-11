# Contributing

## Getting Started

- View the [vsc-extension-quickstart.md](/docs/vsc-extension-quickstart.md) file for details on getting started created a VSCode extension.
- The main file is the `extension.js` file in the root directory.
- Code files file the extension are stored in the src folder.
- Resources used by the extension for things such as icons are store in the media folder.
- Screenshots, logos and other media used for documentation are stored in the media folder.

### Debugging

A vscode launch file has already been created, which should allow you to easily run the extension within a vscode instance.

### Linting

- Linting should automatically work within vscode.
- The ruleset of the @matthewbill/eslint-config-mdb is used. This is an npm package stored on the GitHub registry.
- Linting can be also run manually by running the npm script lint:

```sh
npm run lint
```

- The .eslintignore file contains details of what not to run the linting over.

### Git Setup

The .gitignore file contains details of what not to include in the git repo.
The .gitattributes file is used to normalise line endings between devices. Normally needed when working on both windows and mac/linux.

### Packaging

The `vscode.ignore` contains details of what not to include in the extension.

### Hue Responses

Sample json responses from the hue hub can be found in the docs/responses folder.

### Key Variables

The follow are key variables used within the extension:

#### Configuration

| Property | Description |
| -------- | ----------- |
| `bridgeIp` | The IP of the bridge hue code is trying to connect to |

#### Global Properties

| Property | Description |
| -------- | ----------- |
| `connected` | True if VS code is connected to a hue hub |
| `enabled` | True if VS code is connected to the hue hub and is enabled to change the lights |

## Archive

The archive folder at root level contains old files that are useful for reference, such as build files for other providers such as Travis.
