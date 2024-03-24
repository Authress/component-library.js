<p id="main" align="center">
  <img src="https://authress.io/static/images/linkedin-banner.png" alt="Authress media banner">
</p>

# Authress Web Component Library
This is the Authress web component library. It provides full featured web components to provide easy and direct integration with Authress.

<p align="center">
    <a href="./LICENSE" alt="apache 2.0 license"><img src="https://img.shields.io/badge/license-Apache%202.0-blue.svg"></a>
    <a href="https://www.npmjs.com/package/@authress/component-library" alt="npm version"><img src="https://badge.fury.io/js/@authress%2Fcomponent-library.svg"></a>
    <a href="https://www.npmjs.com/package/@authress/component-library" alt="npm version"><img src="https://img.shields.io/badge/webcomponents.org-@Authress%2FLogin-blue.svg?style=social"></a>
</p>


### Library Contents:
* [MFA Device Management](./src/components/mfaDevices/mfaDevices.js) - Library component to automatically display a users existing MFA devices and manage them.
* [User Profile](./src/components/userProfile/userProfile.js) - Easily display the user profile view with all their data sourced from your user's access token.
* [Role Selector](./src/components/roleSelector/roleSelector.js) - Displays a configurable drop down which lets a user invite, share, and select user roles for other users for a specific resource. Requests can be proxied through your service or update Authress access records and permissions directly.
* [Vanishing Keys](./src/components/vanishingKeys.js) - The UI web component that communicates with the [Authress Vanishing Keys](https://github.com/Authress/vanishing-keys) service.

## Usage

```sh
npm install @authress/component-library
```

```js
import '@authress/component-library';
```

```html
<authress-mfa-devices></authress-mfa-devices>
<authress-user-profile></authress-user-profile>
<authress-role-selector></authress-role-selector>
<authress-vanishing-keys></authress-vanishings-keys>
```
