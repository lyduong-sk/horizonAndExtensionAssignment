# Address Form

This is a custom address form

## Install

```
yarn bootstrap
```

## Run

To run locally in Phoenix, run:

```
yarn preview
```

Then add the local storage value `horizonsPreviewPorts` in your browser with the preview port number specified in the terminal, usually 6543.

## Linting

```
yarn lint
```

## Test

```
yarn test
```

## Reference this component within Skedulo

To reference this component, add the following code to your page template configuration:

```
<platform-component package-name="AddressForm" name="ComponentName"></platform-component>
```

## Setup Prettier in IDE

Skedulo uses Prettier as the main code formatter. This repository already have Prettier installed, but needs to be enabled in the IDE.
Please refer to this [Prettier doc](https://prettier.io/docs/en/editors.html) to enable format on save in your IDE

## Install Sked CLI and Setup

```sh
yarn global add @skedulo/cli
sked tenant login access-token -e test
```

### Deploy Component

```sh
sked package deploy local -p ~/path-to-the-component/AddressForm
```
