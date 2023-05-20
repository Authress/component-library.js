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
}

export default class VanishingKeys extends LitElement {
  constructor() {
    super();
    // this.loading = true;
  }

  static get properties() {
    return {};
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

  render() {
    return html`
      ${SetTheme.call(this)}
      <div class="d-panel">
        <div class="d-panel-header">
          <h3 class="d-flex align-items-center justify-content-center">
            <strong>Authress Vanishing Keys</strong>
          </h3>
        </div>
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
                  placeholder="Secret content goes here...">
                </textarea>
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
                  <button type="submit" class="create btn btn-outline-primary">
                    Generate one time secret link
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      </div>

      <div class="footer mt-auto pt-5 bg-light">
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
