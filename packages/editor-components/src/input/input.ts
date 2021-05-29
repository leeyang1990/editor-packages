import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('e-input')
export class EInput extends LitElement {
  @property()
  version = 'STARTING';

  render() {
    return html`
    <p>Welcome to the Lit tutorial!</p>
    <p>This is the ${this.version} code.</p>
    `;
  }
}
 