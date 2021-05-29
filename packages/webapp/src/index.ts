import { LitElement, html, css } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import 'editor-components/lib/input'
let src = "/Users/liyang/Desktop/imonkeyeditor/iCreator/build/web-mobile/index.html"
import "./../index.css";
import {Child,Parent} from 'postio'
@customElement('my-element')
class MyElement extends LitElement {
  @property()
  version = 'STARTING';
  static styles = css`
  p {
    color: green;
  }
  button{
    width:20px;
    height:20px;
  }
`;
  @query('#serviceFrameSend')
  _frame?: HTMLIFrameElement;
  child:Child;
  constructor(){
    super();

    let io = new Parent();
    io.on('connection',(child:Child)=>{

      this.child = child;
      
      child.on("salutations", (elem1, elem2, elem3) => {
        console.log('收到子页面的消息salutations')
      },this);
    },this)
  }
  btnclick() {
    this.child.emit("greetings", "Hey!", { "ms": "jane" });
  }
  render() {

    return html`
    <!-- <iframe id="serviceFrameSend" src="./runtime/?env=pm" width="100%" height="100%" frameborder="0"></iframe> -->
    <iframe id="serviceFrameSend" src="http://liyang.xueersi.com:7456/?env=pm" width="100%" height="100%" frameborder="0"></iframe>
    <button @click=${this.btnclick}></button>
    `;
  }
}
