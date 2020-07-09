import React, { Component } from "react";
import NodeList from "./nodeList";
import { TreeNode } from ".";
import * as KeyCode from './utils/keycode';

export default class tree extends Component<any> {
  constructor(props) {
    super(props);
  }
  nodes() {
    const nodes: Array<TreeNode> = this.props.nodes;
    return nodes.map(e => {
      return NodeList(e);
    });
  }
  onKeyDown(event) {
    event.stopPropagation();
    if ([KeyCode.ArrowUp, KeyCode.ArrowRight, KeyCode.ArrowDown, KeyCode.ArrowLeft].indexOf(event.key) < 0) {
      return;
    }

    const selectedNode = this.props.tree.lastSelectedNode()
    if (selectedNode) {
      event.preventDefault()

      switch (event.which) {
        case KeyCode.ArrowDown:
          const next = selectedNode.nextVisibleNode()
          next && next.select()
          break;
        case KeyCode.ArrowLeft:
          selectedNode.collapse()
          break;
        case KeyCode.ArrowRight:
          selectedNode.expand()
          break;
        case KeyCode.ArrowUp:
          const pre = selectedNode.previousVisibleNode()
          pre && pre.select()
          break;
        default:
      }
    }
  }
  render() {
    return (
      <div className="hierarchy-tree"
        tabIndex={0}
        onKeyDown={this.onKeyDown.bind(this)}
        onClick={this.props.onClick}
        onFocus={this.props.onFocus}
        onBlur={this.props.onBlur}
        ref={elem => this.props.setRef(elem)}>
        <ol onClick={e => e.stopPropagation()} style={{ listStyle: "none", paddingLeft: "20px", margin: "0px", position: "relative" }}>{this.nodes()}</ol>
        {this.props.children}
      </div>
    );
  }
}
