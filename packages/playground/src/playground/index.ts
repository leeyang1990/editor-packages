import { LitElement, html, css, customElement, property } from 'lit-element';

@customElement('e-playground')
class Index extends LitElement {

    // @property({type : propType}) propName = propValue

    static get styles() {
		return css`
			.content {
				width: 100%;
				height: 100%;
				align-items: center;
				justify-content: center;
				display: flex;
			}
		`;
	}

    // Implement `render` to define a template for your element.
    render() {
        return html`<div class="content">playground</div>`
    }
}