import GoldenLayout = require('golden-layout');
import { LitElement, html, css, customElement, property } from 'lit-element';
import "golden-layout/src/css/goldenlayout-base.css";
import "golden-layout/src/css/goldenlayout-dark-theme.css";
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
			:host{
				width: 100%;
				height: 100%;
			}
		`;
	}
	firstUpdated(){
		var config = {
			content: [{
			  type: 'column',
			  content: [
				  {
				  type:'component',
				  componentName: 'example',
				  componentState: { text: 'Component 1' }
				  },
				{
				  type:'component',
				  componentName: 'example',
				  componentState: { text: 'Component 2' }
				  },
				{
				  type:'component',
				  componentName: 'example',
				  componentState: { text: 'Component 3' }
				  }
			  ]
			}]
		  };
		  console.log(this.shadowRoot!.querySelector('.content') )
		  let root = document.getElementById('root');
		//   var myLayout = new GoldenLayout( config,this.shadowRoot!.querySelector('.content') );
		  var myLayout = new GoldenLayout( config,root );
		  
		  myLayout.registerComponent( 'example', function( container:any, state:any ){
			// container.getElement().html( '<h2>' + state.text + '</h2>');
		  });
		  
		  myLayout.init();
	}
    // Implement `render` to define a template for your element.
    render() {
        return html`<div class="content">playground</div>`
    }
}