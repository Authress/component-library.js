/* eslint-disable indent */
import { LitElement, css, html } from 'lit';
import { LoginClient } from '@authress/login';

import Styles from '../../bootstrap';

const logger = console;
const loginClient = new LoginClient({ applicationId: '', authressLoginHostUrl: window.location.origin }, logger);

const states = {
  LOADING: 'LOADING',
  LIST: 'LIST',
  NEW: 'NEW',
  DELETE: 'DELETE'
};

export default class MfaDevices extends LitElement {
  static get properties() {
    return {
      redirectUrl: { type: String }
    };
  }

  constructor() {
    super();
    this.shareUrl = null;

    this.error = null;
    this.state = states.LOADING;
    this.modalDeviceId = null;
    this.devices = [];

    this.fetchDevices();
  }

  async fetchDevices() {
    try {
      // Note: this waits until there is a session before attempting to fetch devices
      this.devices = await loginClient.getDevices();

      this.state = states.LIST;
      this.requestUpdate();
    } catch (error) {
      logger.error('Failed to fetch devices', error);
    }
  }

  deleteDevice(deviceId) {
    logger.log('Removing device', deviceId);
    this.state = states.LOADING;
    this.requestUpdate();

    setTimeout(async () => {
      try {
        await loginClient.deleteDevice(deviceId);
        this.devices = this.devices.filter(d => d.deviceId !== deviceId);
        this.state = states.LIST;
      } catch (error) {
        logger.error('Failed to remove device', deviceId, error);
        this.state = states.DELETE;
      }

      this.requestUpdate();
    });
  }

  registerDevice() {
    const deviceNameElement = this.shadowRoot.getElementById('deviceName');
    const deviceName = deviceNameElement && deviceNameElement.value;

    this.state = states.LOADING;
    this.requestUpdate();

    setTimeout(async () => {
      logger.log('Registering new device', deviceName);
      try {
        const result = await loginClient.registerDevice({ name: deviceName });
        this.devices.push(result);
        this.state = states.LIST;
      } catch (error) {
        if (error.status === 422 && error.data && error.data.errorCode === 'InvalidDevice') {
          logger.log('Failed to register new device because it is not supported', error);
          this.state = states.NEW;
          this.error = 'This device no longer supports security devices.';
          return;
        }
        logger.error('Failed to register new device', error);
        this.error = error.message || error.data && (error.data.title || error.data.errorCode);
        this.state = states.NEW;
      }

      this.requestUpdate();
    }, 10);
  }

  static finalizeStyles() {
    return [
      Styles,
      css`
      .deviceDisplay {
        background: var(--brand-color--fg);
        color: var(--brand-color--text);
      }

      @keyframes spin {
        from { transform:rotate(0deg); }
        to { transform:rotate(360deg); }
      }
      .spin {
        animation-name: spin;
        animation-duration: 3000ms;
        animation-iteration-count: infinite;
        animation-timing-function: linear; 
      }
      
      .d-panel {
        height: 100%;
        margin-top: 1rem;
        padding: 2rem 3rem;
      }
      
      .create-button {
        background-color: white;
        color: #000515;
        border-color: var(--info);
        box-shadow: 0 2px 5px var(--brand-color--bg-shadow);
      }
      .create-button:focus, .create-button:active:focus {
        box-shadow: none;
      }
      .create-button:hover:not(:disabled) {
        background-color: var(--brand-color--bg);
        color: white;
      }

      .create-button:hover:not(:disabled) svg path {
        stroke: white;
        fill: white;
      }
      
      .create-button:active:not(:disabled) {
        background-color: var(--brand-color--bg);
        color: var(--light);
        border-color: var(--brand-color--bg);
      }

      .back-button {
        background-color: white;
        color: #000515;
        border-color: var(--info);
        box-shadow: 0 2px 5px var(--brand-color--bg-shadow);
      }
      .back-button svg path {
        fill: #464455;
      }

      .back-button:focus, .back-button:active:focus {
        box-shadow: none;
      }
      .back-button:hover:not(:disabled) {
        background-color: var(--brand-color--bg);
        color: white;
      }

      .back-button:hover:not(:disabled) svg path {
        stroke: white;
        fill: white;
      }
      
      .back-button:active:not(:disabled) {
        background-color: var(--brand-color--bg);
        color: var(--light);
        border-color: var(--brand-color--bg);
      }

      .delete-button {
        background-color: white;
        color: #000515;
        border-color: var(--info);
        box-shadow: 0 2px 5px var(--brand-color--bg-shadow);
      }
      .delete-button svg path {
        stroke: #464455;
      }

      .delete-button:focus, .delete-button:active:focus {
        box-shadow: none;
      }
      .delete-button:hover:not(:disabled) {
        background-color: var(--brand-color--bg);
        color: white;
      }

      .delete-button:hover:not(:disabled) svg path {
        stroke: white;
      }
      
      .delete-button:active:not(:disabled) {
        background-color: var(--brand-color--bg);
        color: var(--light);
        border-color: var(--brand-color--bg);
      }

      .device {
        margin: 0.75rem 0.5rem;
      }
      .device-list-wrapper {
        max-height: 225px;
      }
      .device-list-wrapper::-webkit-scrollbar {
        width: 6px;
        background-color: white;
      }
      .device-list-wrapper::-webkit-scrollbar-thumb {
        background: var(--brand-color--bg-shadow);
        border-radius: 12px;
        border: 2px solid var(--brand-color--bg-shadow);
      }

      .device-list-wrapper::-webkit-scrollbar-track {
        background: white;
      }

      @media (max-width: 576.95px) {
        .help-text {
          display: none;
        }
      }

      @media (max-height: 500px) {
        .help-text {
          display: none;
        }
      }
      `
    ];
  }

  // Startup
  connectedCallback() {
    super.connectedCallback();
  }

  // Cleanup
  disconnectedCallback() {
    super.disconnectedCallback();
  }

  loadingScreen() {
    return html`
      <div class="d-flex flex-column" style="height: 300px">
        <h3 class="mx-3 d-flex align-items-center justify-content-center">
          <span>Security Keys</span>
        </h3>
        <div class="d-flex justify-content-center flex-grow-1">
          <div class="d-flex align-items-center">
            <svg class="spin" height="48px" width="48px" version="1.1" id="_x32_" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"  viewBox="0 0 512 512"  xml:space="preserve">
              <style type="text/css">
                .st0{fill:#000000;}
              </style>
              <g>
                <path class="st0" d="M256,0c-23.357,0-42.297,18.932-42.297,42.288c0,23.358,18.94,42.288,42.297,42.288
                  c23.357,0,42.279-18.93,42.279-42.288C298.279,18.932,279.357,0,256,0z"/>
                <path class="st0" d="M256,427.424c-23.357,0-42.297,18.931-42.297,42.288C213.703,493.07,232.643,512,256,512
                  c23.357,0,42.279-18.93,42.279-42.288C298.279,446.355,279.357,427.424,256,427.424z"/>
                <path class="st0" d="M74.974,74.983c-16.52,16.511-16.52,43.286,0,59.806c16.52,16.52,43.287,16.52,59.806,0
                  c16.52-16.511,16.52-43.286,0-59.806C118.261,58.463,91.494,58.463,74.974,74.983z"/>
                <path class="st0" d="M377.203,377.211c-16.503,16.52-16.503,43.296,0,59.815c16.519,16.52,43.304,16.52,59.806,0
                  c16.52-16.51,16.52-43.295,0-59.815C420.489,360.692,393.722,360.7,377.203,377.211z"/>
                <path class="st0" d="M84.567,256c0.018-23.348-18.922-42.279-42.279-42.279c-23.357-0.009-42.297,18.932-42.279,42.288
                  c-0.018,23.348,18.904,42.279,42.279,42.279C65.645,298.288,84.567,279.358,84.567,256z"/>
                <path class="st0" d="M469.712,213.712c-23.357,0-42.279,18.941-42.297,42.288c0,23.358,18.94,42.288,42.297,42.297
                  c23.357,0,42.297-18.94,42.279-42.297C512.009,232.652,493.069,213.712,469.712,213.712z"/>
                <path class="st0" d="M74.991,377.22c-16.519,16.511-16.519,43.296,0,59.806c16.503,16.52,43.27,16.52,59.789,0
                  c16.52-16.519,16.52-43.295,0-59.815C118.278,360.692,91.511,360.692,74.991,377.22z"/>
                <path class="st0" d="M437.026,134.798c16.52-16.52,16.52-43.304,0-59.824c-16.519-16.511-43.304-16.52-59.823,0
                  c-16.52,16.52-16.503,43.295,0,59.815C393.722,151.309,420.507,151.309,437.026,134.798z"/>
              </g>
            </svg>
          </div>
        </div>
      </div>`;
  }

  createNewDevice() {
    return html`
    <form class="d-flex flex-column h-100" @submit="${e => { e.preventDefault(); this.error = null; this.registerDevice(); }}">
      <div class="mx-3 my-3">
        <div class="d-flex align-items-center justify-content-center">
          <h3 class="mx-3">Add a new device</h3>
        </div>
        <div>
          <fieldset class="mt-3">
            <label class="input-label" for="recipientField">Device Name:</label>
            <div class="mt-2">
              <div>
                <input class="form-control" type="text" name="deviceName" id="deviceName" placeholder="Keychain Hardware Device">
              </div>
            </div>
          </fieldset>
        </div>
      </div>

      <div class="d-flex flex-grow-1 justify-content-around">
        <div class="d-flex align-items-center">
          <button type="button" style="width: 75px; height: 88px" class="back-button btn btn-sm" @click="${() => { this.modalDeviceId = null; this.error = null; this.state = states.LIST; this.requestUpdate(); }}">
            <div class="d-flex flex-column justify-content-between align-items-center"> 
              <div style="height: 48px; width: 48px;" class="d-flex align-items-center justify-content-center">
                <svg height="32px" width="32px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#000000"><g>
                <path d="M6.04599,11.6767 C7.35323,9.47493 9.75524,8 12.5,8 C16.6421,8 20,11.3579 20,15.5 C20,16.0523 20.4477,16.5 21,16.5 C21.5523,16.5 22,16.0523 22,15.5 C22,10.2533 17.7467,6 12.5,6 C9.31864,6 6.50386,7.56337 4.78,9.96279 L4.24303,6.91751 C4.14713,6.37361 3.62847,6.01044 3.08458,6.10635 C2.54068,6.20225 2.17751,6.72091 2.27342,7.2648 L3.31531,13.1736 C3.36136,13.4348 3.50928,13.667 3.72654,13.8192 C4.0104,14.0179 4.38776,14.0542 4.70227,13.9445 L10.3826,12.9429 C10.9265,12.847 11.2897,12.3284 11.1938,11.7845 C11.0979,11.2406 10.5792,10.8774 10.0353,10.9733 L6.04599,11.6767 Z" stroke-width="0" fill="#09244B"></path></svg>
              </div>
              <div>Go back</div>
            </div>
          </button>
        </div>
        
        <div class="d-flex align-items-center">
          <button type="submit" style="width: 75px; height: 88px;" class="back-button btn btn-sm">
            <div class="d-flex flex-column justify-content-between align-items-center"> 
              <div style="height: 48px; width: 48px;" class="d-flex align-items-center justify-content-center">
                <svg style="height:32px; width=32px;" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns" fill="#000000"><g> <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage"> <g sketch:type="MSLayerGroup" transform="translate(-464.000000, -1087.000000)" fill="#000000"> <path d="M480,1117 C472.268,1117 466,1110.73 466,1103 C466,1095.27 472.268,1089 480,1089 C487.732,1089 494,1095.27 494,1103 C494,1110.73 487.732,1117 480,1117 L480,1117 Z M480,1087 C471.163,1087 464,1094.16 464,1103 C464,1111.84 471.163,1119 480,1119 C488.837,1119 496,1111.84 496,1103 C496,1094.16 488.837,1087 480,1087 L480,1087 Z M486,1102 L481,1102 L481,1097 C481,1096.45 480.553,1096 480,1096 C479.447,1096 479,1096.45 479,1097 L479,1102 L474,1102 C473.447,1102 473,1102.45 473,1103 C473,1103.55 473.447,1104 474,1104 L479,1104 L479,1109 C479,1109.55 479.447,1110 480,1110 C480.553,1110 481,1109.55 481,1109 L481,1104 L486,1104 C486.553,1104 487,1103.55 487,1103 C487,1102.45 486.553,1102 486,1102 L486,1102 Z" sketch:type="MSShapeGroup"> </path> </g> </g> </g></svg>
              </div>
              <div>Continue</div>
            </div>
          </button>
        </div>

      </div>

      ${this.error ? html`
      <br>
      <div class="text-danger" style="width: 100%; display: flex; justify-content: center">
        <span>${this.error}</span>
      </div>` : ''}

    </form>`;
  }

  removeDevice() {
    const device = this.devices.find(d => d.deviceId === this.modalDeviceId);
    return html`
    <div class="h-100 d-flex flex-column">
      <div class="mx-3">
        <h3 class="d-flex align-items-center justify-content-center">
          <span>Remove device</span>
        </h3>
        <span class="help-text">Do you want to remove the device <strong style="color: var(--brand-color--accent)">${device.name}</strong> from your account?
        <br><small>The removed device can be re-added at any time.</small></span>

        ${this.deviceDisplay(device)}
      </div>

      <div class="d-flex flex-grow-1 justify-content-around">
        <div class="d-flex align-items-center">
          <button type="button" style="width: 75px; height: 88px" class="back-button btn btn-sm" @click="${() => { this.modalDeviceId = null; this.error = null; this.state = states.LIST; this.requestUpdate(); }}">
            <div class="d-flex flex-column justify-content-between align-items-center"> 
              <div style="height: 48px; width: 48px;" class="d-flex align-items-center justify-content-center">
                <svg height="32px" width="32px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#000000"><g>
                <path d="M6.04599,11.6767 C7.35323,9.47493 9.75524,8 12.5,8 C16.6421,8 20,11.3579 20,15.5 C20,16.0523 20.4477,16.5 21,16.5 C21.5523,16.5 22,16.0523 22,15.5 C22,10.2533 17.7467,6 12.5,6 C9.31864,6 6.50386,7.56337 4.78,9.96279 L4.24303,6.91751 C4.14713,6.37361 3.62847,6.01044 3.08458,6.10635 C2.54068,6.20225 2.17751,6.72091 2.27342,7.2648 L3.31531,13.1736 C3.36136,13.4348 3.50928,13.667 3.72654,13.8192 C4.0104,14.0179 4.38776,14.0542 4.70227,13.9445 L10.3826,12.9429 C10.9265,12.847 11.2897,12.3284 11.1938,11.7845 C11.0979,11.2406 10.5792,10.8774 10.0353,10.9733 L6.04599,11.6767 Z" stroke-width="0" fill="#09244B"></path></svg>
              </div>
              <div>Go back</div>
            </div>
          </button>
        </div>
        
        <div class="d-flex align-items-center">
          <button type="button" style="width: 75px; height: 88px;" class="delete-button btn btn-sm" @click="${() => { this.deleteDevice(this.modalDeviceId); }}">
            <div class="d-flex flex-column justify-content-between align-items-center"> 
              <div style="height: 48px; width: 48px;" class="d-flex align-items-center justify-content-center">
                <svg height="32px" width="32px" viewBox="-2.4 -2.4 28.80 28.80" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g><path d="M4.99997 8H6.5M6.5 8V18C6.5 19.1046 7.39543 20 8.5 20H15.5C16.6046 20 17.5 19.1046 17.5 18V8M6.5 8H17.5M17.5 8H19M9 5H15M9.99997 11.5V16.5M14 11.5V16.5" stroke-linecap="round" stroke-linejoin="round"></path></g>
            </svg>
              </div>
              <div>Delete</div>
            </div>
          </button>
        </div>
      </div>
    </div>`;
  }

  deviceDisplay(device, displayTrash = false) {
    return html`
      <div class="device d-flex align-items-center justify-content-between p-3" style="border-color: var(--info); box-shadow: 2px 2px 10px 5px var(--brand-color--bg-shadow);">
        
        <div class="d-flex">
          <div class="d-flex align-items-center me-2">
            <svg fill="" style="height: 48px; width: 48px" xmlns="http://www.w3.org/2000/svg" viewBox="-10 20 70 10" enable-background="new 0 0 20 20" xml:space="preserve" stroke="" stroke-width="0.00052" transform="matrix(1, 0, 0, -1, 0, 0)rotate(270)"><g> <g> <g> <path d="M38.5,14.1h-37c-0.8,0-1.5,0.7-1.5,1.5v21c0,0.8,0.7,1.5,1.5,1.5h37c0.8,0,1.5-0.7,1.5-1.5v-21 C40,14.8,39.3,14.1,38.5,14.1z M21,32.2c-3.4,0-6.1-2.7-6.1-6.1S17.6,20,21,20s6.1,2.7,6.1,6.1S24.4,32.2,21,32.2z"></path> <circle cx="21" cy="26.1" r="1.2"></circle> </g> <path d="M50.5,18H36c-0.8,0-1.5,0.7-1.5,1.5v13c0,0.8,0.7,1.5,1.5,1.5h14.5c0.8,0,1.5-0.7,1.5-1.5v-13 C52,18.7,51.3,18,50.5,18z M47.1,22c0.6,0,1,0.4,1,1v1.9H40V22H47.1z M47.1,30H40v-2.7h8.1V29C48.1,29.6,47.7,30,47.1,30z"></path> </g> </g></svg>
          </div>
          <div>
            <div>${device.name}</div>
            <small style="color: var(--brand-color--accent);">${device.deviceId}</small>
          </div>
        </div>
        ${displayTrash && html`
          <div>
            <button type="button" class="delete-button p-0 btn btn-sm" @click="${() => { this.error = null; this.state = states.DELETE; this.modalDeviceId = device.deviceId; this.requestUpdate(); }}">
              <svg height="24px" width="24px" viewBox="-2.4 -2.4 28.80 28.80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="2.304"></g>
                <g><path d="M4.99997 8H6.5M6.5 8V18C6.5 19.1046 7.39543 20 8.5 20H15.5C16.6046 20 17.5 19.1046 17.5 18V8M6.5 8H17.5M17.5 8H19M9 5H15M9.99997 11.5V16.5M14 11.5V16.5" stroke-linecap="round" stroke-linejoin="round"></path></g>
              </svg>
            </button>
          </div>` || ''}
      </div>`;
  }

  listDisplay() {
    return html`
    <form class="d-flex flex-column" class="max-height: 500px;" @submit="${e => { e.preventDefault(); this.error = null; this.state = states.NEW; this.requestUpdate(); }}">
      <div class="mx-3">
        <h3 class="d-flex align-items-center justify-content-center">
          <span>Security Keys</span>
        </h3>
        <small class="help-text">These are your security keys. They can be used as multifactor devices for your account. To login, you will always need to have access to one of these.</small>
      </div>
      <div class="device-list-wrapper flex-grow-1" style="overflow-y: auto;">
        <div class="device-list">
          ${this.devices.map(d => this.deviceDisplay(d, true))}
        </div>
      </div>

      <div class="d-flex justify-content-center">
        <div>

          ${!this.devices.length && html`
            <div class="d-flex flex-grow-1 justify-content-around mt-3">
              <div class="d-flex align-items-center">
                <button type="submit" class="back-button btn btn-sm">
                  <div class="d-flex flex-column justify-content-around p-3">
                    <div class="mb-2">
                      <svg style="height:32px; width=32px;" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns" fill="#000000"><g> <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage"> <g sketch:type="MSLayerGroup" transform="translate(-464.000000, -1087.000000)" fill="#000000"> <path d="M480,1117 C472.268,1117 466,1110.73 466,1103 C466,1095.27 472.268,1089 480,1089 C487.732,1089 494,1095.27 494,1103 C494,1110.73 487.732,1117 480,1117 L480,1117 Z M480,1087 C471.163,1087 464,1094.16 464,1103 C464,1111.84 471.163,1119 480,1119 C488.837,1119 496,1111.84 496,1103 C496,1094.16 488.837,1087 480,1087 L480,1087 Z M486,1102 L481,1102 L481,1097 C481,1096.45 480.553,1096 480,1096 C479.447,1096 479,1096.45 479,1097 L479,1102 L474,1102 C473.447,1102 473,1102.45 473,1103 C473,1103.55 473.447,1104 474,1104 L479,1104 L479,1109 C479,1109.55 479.447,1110 480,1110 C480.553,1110 481,1109.55 481,1109 L481,1104 L486,1104 C486.553,1104 487,1103.55 487,1103 C487,1102.45 486.553,1102 486,1102 L486,1102 Z" sketch:type="MSShapeGroup"> </path> </g> </g> </g></svg>
                    </div>
                    <div>Add device</div>
                  </div>
                </button>
              </div>
            </div>`
          || html`
          <button type="submit" class="create-button btn btn-sm">
            <span class="d-flex align-items-baseline">
              <svg style="margin-right: 0.25rem; margin-top: 0.25rem; height:12px; width=12px;" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns" fill="#000000"><g> <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage"> <g sketch:type="MSLayerGroup" transform="translate(-464.000000, -1087.000000)" fill="#000000"> <path d="M480,1117 C472.268,1117 466,1110.73 466,1103 C466,1095.27 472.268,1089 480,1089 C487.732,1089 494,1095.27 494,1103 C494,1110.73 487.732,1117 480,1117 L480,1117 Z M480,1087 C471.163,1087 464,1094.16 464,1103 C464,1111.84 471.163,1119 480,1119 C488.837,1119 496,1111.84 496,1103 C496,1094.16 488.837,1087 480,1087 L480,1087 Z M486,1102 L481,1102 L481,1097 C481,1096.45 480.553,1096 480,1096 C479.447,1096 479,1096.45 479,1097 L479,1102 L474,1102 C473.447,1102 473,1102.45 473,1103 C473,1103.55 473.447,1104 474,1104 L479,1104 L479,1109 C479,1109.55 479.447,1110 480,1110 C480.553,1110 481,1109.55 481,1109 L481,1104 L486,1104 C486.553,1104 487,1103.55 487,1103 C487,1102.45 486.553,1102 486,1102 L486,1102 Z" sketch:type="MSShapeGroup"> </path> </g> </g> </g></svg>
              Add device
            </span>
          </button>`}
        </div>
      </div>
    

    </form>`;
  }

  getRender() {
    if (this.state === states.LOADING) {
      return this.loadingScreen();
    }

    if (this.state === states.NEW) {
      return this.createNewDevice();
    }

    if (this.state === states.DELETE) {
      return this.removeDevice();
    }

    return this.listDisplay();
  }

  render() {
    return html`
    <div class="deviceDisplay">
      <div class="mb-4">
        <div class="d-panel-header text-center">
          <slot name="brand">
            <img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiCgkgd2lkdGg9IjUxMnB4IiBoZWlnaHQ9IjUxMnB4IiB2aWV3Qm94PSIwIDAgNTEyIDUxMiIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNTEyIDUxMjsiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8c3R5bGUgdHlwZT0idGV4dC9jc3MiPgo8IVtDREFUQVsKCS5zdDB7ZmlsbDojRkJBRjBCO3N0cm9rZTojMUQyRjNCO3N0cm9rZS1taXRlcmxpbWl0OjEwO30KXV0+Cjwvc3R5bGU+CjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik0yNTYuMDksNDMuNzNjLTY2LjI3LDAtMTIwLDUzLjczLTEyMCwxMjBjMCwwLjAxLDAsMC4wMywwLDAuMDR2MzAzLjg2aDM4djBoMjYuMDl2LTAuMDUKCWMwLjM4LDAuMDIsMC43NSwwLjA2LDEuMTMsMC4wNmM5Ljk0LDAsMTgtOC4wNiwxOC0xOGMwLTkuOTQtOC4wNi0xOC0xOC0xOGMtMC4zOCwwLTAuNzUsMC4wMy0xLjEzLDAuMDZ2LTAuMDZoLTI2LjA5di00Mi44OWgzNS44NgoJdi0wLjA3YzAuNDcsMC4wNCwwLjk0LDAuMDcsMS40MiwwLjA3YzkuOTQsMCwxOC04LjA2LDE4LTE4YzAtOS45NC04LjA2LTE4LTE4LTE4Yy0wLjQ4LDAtMC45NSwwLjA0LTEuNDIsMC4wN3YtMC4wN2gtMzUuODZ2LTYxCgloNjYuOTd2LTM4aC02Ni45N3YtOTB2MGMwLTQ1LjI5LDM2LjcxLTgyLDgyLTgyczgyLDM2LjcxLDgyLDgydjB2OTBoLTY3LjAzdjM4aDY3LjAzdjQyaC0xOC45MWMtMTAuNDksMC0xOSw4LjUxLTE5LDE5CgljMCwxMC40OSw4LjUxLDE5LDE5LDE5aDE4LjkxaDIyLjI3aDE1Ljczdi0yMDhDMzc2LjA5LDk3LjQ1LDMyMi4zNyw0My43MywyNTYuMDksNDMuNzN6IE0zMTkuMTgsMzY0LjIzCgljLTYuMzUsMC0xMS41LTUuMTUtMTEuNS0xMS41YzAtNi4zNSw1LjE1LTExLjUsMTEuNS0xMS41czExLjUsNS4xNSwxMS41LDExLjVDMzMwLjY4LDM1OS4wOCwzMjUuNTMsMzY0LjIzLDMxOS4xOCwzNjQuMjN6Ii8+Cjwvc3ZnPgo=" style="height: 36px; border-radius: 10px;">
          </slot>
        </div>
      </div>

      <div style="height: min(80%, 450px);">
        ${this.getRender()}
      </div>
    </div>`;
  }

  attributeChangedCallback(name, oldVal, newVal) {
    super.attributeChangedCallback(name, oldVal, newVal);
  }
}

if (!customElements.get('authress-mfa-devices')) {
  customElements.define('authress-mfa-devices', MfaDevices);
}
