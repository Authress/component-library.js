import { LitElement, css, html } from 'lit';

import Styles from '../bootstrap';
import encryptionManager from './encryptionManager.js';

function SetTheme() {
  const defaultColors = [
    `--primary: ${getComputedStyle(this).getPropertyValue('--primary').trim() || '#1D2F3B'}`,
    `--dark: ${getComputedStyle(this).getPropertyValue('--dark').trim() || '#000515'}`,
    `--light: ${getComputedStyle(this).getPropertyValue('--light').trim() || '#FFFFFF'}`,
    `--gray: ${getComputedStyle(this).getPropertyValue('--gray').trim() || '#465865'}`,
    `--info: ${getComputedStyle(this).getPropertyValue('--info').trim() || '#FFFFFF'}`,
    '',
  ];

  return html`
    <style>   
      :host {
        ${defaultColors.join(';\n')}
      }
      .hidden {
        visibility: hidden !important;
      }
      .btn-outline-primary {
        color: var(--primary) !important;
        border-color: var(--primary) !important;
      }

      .btn-outline-primary {
        color: var(--primary) !important;
        border-color: var(--primary) !important;
      }
      .btn-outline-primary:hover {
        background-color: var(--primary) !important;
        color: var(--light) !important;
      }

      .form-check-radio.b-form-check-lg, .input-group-lg .form-check-radio {
        font-size: 1rem !important;
        line-height: 1 !important;
      }

      .form-check-radio.b-form-check-lg .form-check-label::before, .input-group-lg .form-check-radio .form-check-label::before {
        top: 0.05rem !important;
      }

      .form-check-radio.b-form-check-lg .form-check-label::after, .input-group-lg .form-check-radio .form-check-label::after {
        top: 0.05rem !important;
      }

      .form-check-input, .form-check-label {
        cursor: pointer;
      }
      .form-check-radio .form-check-label::before {
        background-color: var(--light);
        border: $primary solid 2px;
      }

      .form-check-input:checked[type="radio"] {
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3e%3cpath fill='none' stroke='%23fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='3' d='m6 10 3 3 6-6'/%3e%3c/svg%3e") !important;
      }

      .form-check-input:checked {
        color: var(--light) !important;
        border-color: var(--primary) !important;
        background-color: var(--primary) !important;
      }

      .form-check-radio {
        .form-check-label {
          @extend h5;
        }

      .form-check-input:checked, .form-check-input:active:not(:disabled) {
        ~ .form-check-label {
          &::before {
            color: var(--light);
            border-color: var(--primary);
            background-color: var(--primary);
          }
          &::after {
            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'%3e%3cpath fill='%23fff' d='M6.564.75l-3.59 3.612-1.538-1.55L0 4.26 2.974 7.25 8 2.193z'/%3e%3c/svg%3e") !important;
          }
        }

        &:active:hover, &:active:not(:checked) ~ .form-check-label::before {
          color: var(--light);
          border-color: var(--primary);
          background-color: var(--light);
        }

        &:focus ~ .form-check-label::before {
          box-shadow: none;
        }
      }
    }

    .form-check-input:focus {
      box-shadow: none !important;
      border-color: rgba(0, 0, 0, 0.25) !important;
    }
    </style>`;
}

async function handleClick(event) {
  event.preventDefault();

  this.loading = true;
  const radios = this.shadowRoot.querySelectorAll('input[name="lifetime"]');

  let lifetime = 'P7D';
  for (let i = 0; i < radios.length; i++) {
    if (radios[i].checked) {
      lifetime = radios[i].value;
    }
  }

  const secret = this.shadowRoot.getElementById('secret').value;
  const passphrase = this.shadowRoot.getElementById('passphrase').value;
  const includePassphrase = this.shadowRoot.getElementById('includePassphrase').checked || !passphrase;

  const result = await encryptionManager.generateLink(secret, passphrase, includePassphrase, lifetime);
  if (!result) {
    return;
  }

  this.shareUrl = result;
  this.loading = false;
  this.showCopiedToClipBoard = false;

  this.requestUpdate();
}

function resetUi(event) {
  event.preventDefault();
  this.shareUrl = null;
  this.requestUpdate();
}

async function decodeSecret(event) {
  if (event) {
    event.preventDefault();
  }
  const passphrase = this.passphrase || this.shadowRoot.getElementById('passphrase').value;
  const decryptedSecret = await encryptionManager.decodeSecret(this.secretId, passphrase);
  if (decryptedSecret) {
    this.passphrase = passphrase;
    this.decryptedSecret = decryptedSecret;
  } else {
    this.decryptedSecret = 'NOT_FOUND';
  }
  this.requestUpdate();
}

function copyToClipboard(copyData) {
  let data = copyData?.trim().replace(/\s{8}/g, '  ');
  try {
    // Convert to 2 spaces in all JSON text
    data = JSON.stringify(JSON.parse(data), null, 2).trim();
  } catch (error) {
    // Ignore non JSON text;
  }
  
  const textArea = document.createElement('textarea');
  textArea.value = data;
  textArea.style.position = 'fixed'; // avoid scrolling to bottom
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    this.showCopiedToClipBoard = true;
    this.requestUpdate();
    setTimeout(() => {
      this.showCopiedToClipBoard = false;
      this.requestUpdate();
    }, 5000);
  } catch (err) {
    console.error('Unable to copy', err); // eslint-disable-line no-console
  }
  document.body.removeChild(textArea);
}

export default class VanishingKeys extends LitElement {
  constructor() {
    super();
    this.shareUrl = null;
    this.loading = false;

    const hashParams = new URLSearchParams(window.location.hash.split('?')[1]);
    const queryParams = new URLSearchParams(window.location.search);
    const secretId = queryParams.get('secretId') || hashParams.get('secretId');
    const passphrase = queryParams.get('passphrase') || hashParams.get('passphrase');
    if (secretId) {
      this.secretId = secretId;
      this.passphrase = passphrase;
      this.requestUpdate();
    }

    if (secretId && passphrase) {
      decodeSecret.call(this, null, secretId, passphrase);
    }
  }

  static get properties() {
    return {
      loading: { type: Boolean },
      shareUrl: { type: String },
      showResolveSecret: { type: Boolean }
    };
  }

  static finalizeStyles() {
    return [
      Styles,
      css`
      body {
        padding-top: 0px;
        padding-bottom: 10px;
        font-family: georgia,serif;
      }
      
      .d-panel {
        height: 100%;
        margin-top: 1rem;
        padding: 2rem 3rem;
      }
      .nav a.active, .footerNav a.active {
        font-weight: bolder;
      }
      
      #logo {
        padding: 0px;
        margin-top: 10px;
      }
      
      #banner {
        width: 100%;
        background-color: #f0f0f0;
        margin: 0px;
        padding: 0px;
        margin-bottom: 0px;
        border-bottom: 4px solid red; /* dd4a22, d22000, b04420 */
      }
      
      #banner .broadcast {
        text-align: center;
        color: #000;
        font-weight: bolder;
      }
      
      #banner .broadcast a {
        text-decoration: underline;
      }
      
      #createSecret {
        text-align: left;
      }
      
      #createSecret textarea, #createSecret input {
        background-color: #f9f9f9;
        padding: 6px !important;
      }
      
      .btn-custom {
        -webkit-font-smoothing: antialiased;
        background-color: #dd4a22!important;
        background-repeat: repeat-x;
        background-image: none;
        color: #fff!important;
        border-color: #b04420 #b04420 hsl(15,69%,41%);
        text-shadow: 0 -1px 0 rgba(0,0,0,0.00);
        font-weight: bold;
        font-size: 20px;
      }
      .btn-custom:hover {
        background-color: #d22000 !important;
        text-shadow: 1px 1px 0 #740500;
      }
      
      #footer {
      
        text-align: center;
        font-size: 80%;
        line-height: 80%;
        padding: 0px;
        color: #999;
      }
      
      #footer a {
        color: #000;
      }
      
      #footer p {
        margin: 0px;
        padding: 4px;
      }
      
      #footer .intro {
        color: #000; float: left; padding-left: 8px; font-style: italic;
      }
      
      
      #info a {
        text-decoration: underline;
      }
      
      hr.clear {background:#fff;color:#fff;clear:both;float:none;width:100%;height:.1em;border:none;margin:4px;}
      
      .tagline { width: 100%; text-align: center; font-style: italic; color: #999; margin-top: 20px; }
      
      .lighter { color: #999; }
      
      .release {text-decoration: none; color: #dddddd; }
      
      a {
        color: #000;
      }
      
      a.keepgoing {
        font-size: 120%;
        font-weight: bolder;
        padding: 10px;
      }
      
      .private .hint {
        font-style: italic;
        color: #999;
        font-size: 16px;
        text-align: center;
      }
      
      #faq {
        margin-top: 60px;
        color: #444;
      }
      
      .nav li.primary {line-height: 26px; font-size: 20px;}
      .nav li.secondary {font-size:16px; line-height: 16px}
      .nav li.alt {font-size:24px; line-height: 24px}
      
      .inputform li.primary {line-height: 26px; font-size: 20px;}
      .inputform li.secondary {font-size:16px; line-height: 16px}
      .inputform li.alt {font-size:24px; line-height: 24px}
      
      .inputform li {list-style-type: none;}
      
      .nav li.or {
        color: #999;
        font-size: 16px;
        line-height: 16px;
        margin-top: 10px;
        margin-left: 10px;
      }
      .nav em { font-style: normal; text-decoration: underline; }
      
      
      div.private{font-size: 18px; line-height: 18px; margin-top: 20px;}
      .shared{ margin-top: 20px;}
      #generate .secret input {width: 620px; font-size: 16px; line-height: 16px; padding: 6px; margin: 6px 0px 6px 0px;}
      .private .secret input, .private .secret textarea { background-color: #eee; color: #666; padding: 10px; width: 100%;}
      .private .secret input[disabled] { background-color: #eee; color: #fff;}
      .shared .secret input, .shared .secret textarea {
        border: 8px solid #eee; font-size: 14px; line-height: 14px; background-color: #fafafa; color: #000; -padding: 10px; width: 100%; margin-top: 20px
      }
      .uri input {width: 620px; font-size: 16px; line-height: 16px; padding: 6px; border: 0px; background-color: #ff0;}
      .uri input.private {background-color: #eee;}
      .uri p {padding: 6px; font-size: 80%; margin: 0px; color: #999;}
      .passphrase { margin-bottom: 30px; }
      .passphrase input {width: 320px; font-size: 16px; line-height: 16px; padding: 6px; border: 0px; background-color: #eee; color: #000;}
      
      .secret {margin-bottom: 20px}
      .uri{margin-bottom: 10px}
      .pretext {
        line-height: 24px;
        font-size: 24px;
      }
      .passphrase . text {
        line-height: 18px;
        font-size: 18px;
      }
      
      
      #brandedlogo {
        height: 80px;
        width: 600px;
        margin: 10px 0px;
        background: #ffffff;
        background-repeat: no-repeat;
      }
      
      .dotted{border-top:1px dotted #666;}
      .nounderline {
        text-decoration: none !important;
      }
      .underline {
        text-decoration: underline;
      }
      .strikethrough {
        text-decoration: line-through;
      }
      .smaller { font-size: 85%; }
      .larger { font-size: 120%; }
      .centre { text-align: center }
      .italic { font-style: italic }
      .socialicon {
        padding-right: 8px;
      }
      
      .hilite {background:#ff0;}
      .hilite2 {background:#6ff;}
      
      
      .err, .msg { font-weight: bold; padding: 8px; line-height: 32px; width: 100%; }
      .err { background-color: red; color: #fff }
      .msg { background-color: #ff0; }
      .warning-text { color: red;}
      
      .lightest {
        color: #ccc;
      }
      
      
      .text-input {
        padding-bottom: 6px;
      }
      .chars-display {
        position: relative; display: block; float: right; margin-top: -24px; margin-right: 24px;
      }
      
      .address { margin-left: 150px; font-size: 24px; line-height: 24px; }
      
      
      #primaryTabs {
        background: transparent;
        border: none;
        font-family: georgia;
      }
      #primaryTabs .ui-widget-header {
        background: transparent;
        border: none;
        border-bottom: 1px solid #c0c0c0;
      }
      #primaryTabs .ui-state-default {
        background: transparent;
        border: none;
      }
      #primaryTabs .ui-state-active {
        background: transparent url(/img/uiTabsArrow.png) no-repeat bottom center;
        border: none;
      }
      #primaryTabs .ui-state-default a {
        color: #000;
      }
      
      #primaryTabs .ui-state-active a {
        color: #999;
      }
      
      .alert a {
        text-decoration: underline;
      }`
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

  inputDisplay() {
    return html`
        <div class="d-flex justify-content-center w-100">
          <div>
            <div style="text-align: center">
              <span>Paste a secret, credential, api key, or private message below.</span>
              <br>
              <small>And then share it securely with anyone. The secret will only be visible once and then is burned.</small>
            </div>
            <br>
            <form @submit="${(e) => { handleClick.call(this, e); }}">
              <h4 class="title">Secret:</h4>  
              <div class="text-input fs-exclude" data-hj-suppress data-sl="mask">
                <textarea id="secret" maxlength="10240" style="width: 100%; border-radius: 5px; padding: 0.5rem;" rows="4" name="secret" autocomplete="off"
                  placeholder="Secret content goes here..."></textarea>
              </div>

              <br>

              <div>
                <h4 class="title">Privacy Options:</h4>
                <div class="input-group">
                  <span class="input-group-text" id="passphrase-label">Passphrase</span>
                  <input id="passphrase" type="text" class="form-control fs-exclude" data-hj-suppress data-sl="mask" autocomplete="off" placeholder="A difficult to guess passphrase" aria-label="Passphrase" aria-describedby="passphrase-label">
                </div>
                <div class="mt-1"><small>The passphrase is used to encrypt the secret. The secret is encrypted on this page and never stored.</small></div>


                <fieldset class="mt-3">
                  <label class="input-label" for="recipientField">Lifetime:</label>
                  <div class="mt-2 ms-3">
                    <div class="form-check">
                      <input class="form-check-input" type="radio" name="lifetime" id="P7D" value="P7D" checked>
                      <label class="form-check-label" for="P7D">
                        <small>7 Days</small>
                      </label>
                    </div>
                    <div class="form-check">
                      <input class="form-check-input" type="radio" name="lifetime" id="PT24H" value="PT24H">
                      <label class="form-check-label" for="PT24H">
                        <small>1 Day</small>
                      </label>
                    </div>
                    <div class="form-check">
                      <input class="form-check-input" type="radio" name="lifetime" id="PT10M" value="PT10M">
                      <label class="form-check-label" for="PT10M">
                        <small>10 Minutes</small>
                      </label>
                    </div>
                  </div>
                </fieldset>
              </div>

              <hr class="w-100">
              <div class="d-flex justify-content-center">
                <div>
                  <div class="form-check d-flex align-items-center justify-content-center">
                    <input id="includePassphrase" class="form-check-input me-2 mt-0" type="checkbox" value="" id="includePassphrase" checked>
                    <label class="form-check-label" for="includePassphrase">
                      <small>Include passphrase with link</small>
                    </label>
                  </div>
                  <br>
                  <button type="submit" class="d-flex justify-content-center align-items-center btn btn-outline-primary" style="width: 235px; height: 38px">
                    ${this.loading ? html`
                    <svg height="16px" width="16px" version="1.1" id="_x32_" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
                       viewBox="0 0 512 512"  xml:space="preserve">
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
                    </svg>` : 'Generate one time secret link'}
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      </div>
    `;
  }

  secretGeneratedDisplay() {
    return html`
        <div class="d-flex justify-content-center w-100">
          <div>
            <div style="text-align: center">
              <span>Paste a secret, credential, api key, or private message below.</span>
              <br>
              <small>And then share it securely with anyone. The secret will only be visible once and then is burned.</small>
            </div>
            <br>
            <div>
              <h4 class="title">Share this link:</h4>
              <div class="input-group mb-3" style="cursor: pointer;" @click='${(e) => { copyToClipboard.call(this, this.shareUrl, e); }}'>
                <input style="cursor: pointer;"
                  disabled type="text" class="form-control text-input fs-exclude" data-hj-suppress data-sl="mask" aria-label="Secret share link" aria-describedby="secret-share-link" value="${this.shareUrl}">
                <span class="input-group-text" id="secret-share-link">
                  <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 8V7C10 6.05719 10 5.58579 10.2929 5.29289C10.5858 5 11.0572 5 12 5H17C17.9428 5 18.4142 5 18.7071 5.29289C19 5.58579 19 6.05719 19 7V12C19 12.9428 19 13.4142 18.7071 13.7071C18.4142 14 17.9428 14 17 14H16M7 19H12C12.9428 19 13.4142 19 13.7071 18.7071C14 18.4142 14 17.9428 14 17V12C14 11.0572 14 10.5858 13.7071 10.2929C13.4142 10 12.9428 10 12 10H7C6.05719 10 5.58579 10 5.29289 10.2929C5 10.5858 5 11.0572 5 12V17C5 17.9428 5 18.4142 5.29289 18.7071C5.58579 19 6.05719 19 7 19Z" stroke="#464455" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </span>
              </div>

              <div class="d-flex justify-content-center text-success">
                <small id="copied-text" class="${this.showCopiedToClipBoard ? '' : 'hidden'}">Share link copied to clipboard!</small>
              </div>

              <hr class="w-100">
              <div class="d-flex justify-content-center">
                <div>
                  <button type="submit" class="create btn btn-outline-primary me-2" @click="${(e) => { resetUi.call(this, e); }}">
                    Create another secret
                  </button>
                  <button type="submit" class="create btn btn-primary" @click="${(e) => { copyToClipboard.call(this, this.shareUrl, e); }}">
                    Copy secret link
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      </div>
    `;
  }

  resolveSecretDisplay() {
    return html`
        <div class="d-flex justify-content-center w-100">
          <div>
            <div style="text-align: center">
              <span>Paste a secret, credential, api key, or private message below.</span>
              <br>
              <small>And then share it securely with anyone. The secret will only be visible once and then is burned.</small>
            </div>
            <br>
            <form @submit="${(e) => { decodeSecret.call(this, e); }}">
              <div>
                <h4 class="title">Enter Passphrase:</h4>
                <div class="input-group">
                  <span class="input-group-text" id="passphrase-label">Passphrase</span>
                  ${this.decryptedSecret
    // eslint-disable-next-line indent
                  ? html`<input id="passphrase" type="text" class="form-control fs-exclude" data-hj-suppress data-sl="mask" autocomplete="off" disabled value=${[...Array(32)].join('•')}>`
    // eslint-disable-next-line indent
                  : html`
                  <input id="passphrase" type="text" class="form-control fs-exclude" data-hj-suppress data-sl="mask" autocomplete="off" placeholder="Enter the passphrase for this secret" aria-label="Passphrase" aria-describedby="passphrase-label">
                  <button class="btn btn-outline-secondary" type="submit">Decode</button>`}
                </div>
                <div class="mt-1"><small>The passphrase is used to decrypt the secret.</small></div>
              </div>

              <hr>

              <h4 class="title">Shared Secret:</h4>  
              ${!this.decryptedSecret
    // eslint-disable-next-line indent
              ? html`<div class="text-input">
              <textarea id="secret" disabled maxlength="10240" style="width: 100%; border-radius: 5px; padding: 0.5rem;" rows="4" name="secret" autocomplete="off"
              >${[...Array(32)].join('•')}</textarea>
            </div>`
    // eslint-disable-next-line indent
              : (this.decryptedSecret === 'NOT_FOUND'
      ? html`<small class="text-danger">This secret is no longer available. It may have expired or has already been used.<small>`
      : html`
              <div class="input-group mb-3 fs-exclude" data-hj-suppress data-sl="mask" style="cursor: pointer;" @click='${(e) => { copyToClipboard.call(this, this.decryptedSecret, e); }}'>
                <textarea id="secret" class="form-control" disabled maxlength="10240" style="cursor: pointer; border-radius: 5px; padding: 0.5rem;" rows="4" name="secret" autocomplete="off"
                >${this.decryptedSecret}</textarea>
                <span class="input-group-text" id="secret-share-link" style="cursor: pointer">
                  <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 8V7C10 6.05719 10 5.58579 10.2929 5.29289C10.5858 5 11.0572 5 12 5H17C17.9428 5 18.4142 5 18.7071 5.29289C19 5.58579 19 6.05719 19 7V12C19 12.9428 19 13.4142 18.7071 13.7071C18.4142 14 17.9428 14 17 14H16M7 19H12C12.9428 19 13.4142 19 13.7071 18.7071C14 18.4142 14 17.9428 14 17V12C14 11.0572 14 10.5858 13.7071 10.2929C13.4142 10 12.9428 10 12 10H7C6.05719 10 5.58579 10 5.29289 10.2929C5 10.5858 5 11.0572 5 12V17C5 17.9428 5 18.4142 5.29289 18.7071C5.58579 19 6.05719 19 7 19Z" stroke="#464455" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </span>
              </div>
              
              <div class="d-flex justify-content-center text-success">
                <small id="copied-text" class="${this.showCopiedToClipBoard ? '' : 'hidden'}">Secret copied to clipboard!</small>
              </div>
              
              <br>

              <div class="d-flex justify-content-center">
                <div>
                  <button type="submit" class="create btn btn-primary" @click="${(e) => { copyToClipboard.call(this, this.decryptedSecret, e); }}">
                    Copy Secret
                  </button>
                </div>
              </div>
              `)}
            </form>
          </div>
        </div>
      </div>
    `;
  }

  getRender() {
    if (this.shareUrl) {
      return this.secretGeneratedDisplay();
    }

    if (this.secretId) {
      return this.resolveSecretDisplay();
    }

    return this.inputDisplay();
  }

  render() {
    return html`
      ${SetTheme.call(this)}
      <div class="d-panel">
        <div class="d-panel-header">
          <h3 class="d-flex align-items-center justify-content-center">
            <strong>Authress Vanishing Keys</strong>
          </h3>
        </div>
        ${this.getRender()}
      </div>

      <div class="footer mt-auto py-5 bg-light">
        <div class="d-flex justify-content-center">
          <small>Secured by <a href="https://authress.io" class="text-highlight">Authress</a> -
            100% open source on <a class="text-highlight" href="https://github.com/Authress/vanishing-keys" target="_blank">GitHub</a>.</small>
        </div>
      </div>
    `;
  }

  attributeChangedCallback(name, oldVal, newVal) {
    super.attributeChangedCallback(name, oldVal, newVal);
  }
}

if (!customElements.get('authress-vanishing-keys')) {
  customElements.define('authress-vanishing-keys', VanishingKeys);
}
