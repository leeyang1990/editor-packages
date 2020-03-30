import React, { Component } from "react";
import NodeList from "./nodeList";
import { TreeNode } from "./hierarchyTree";
import * as KeyCode from './utils/keycode';
const tree: React.FC<any> = props =>{
  function nodes() {
    const nodes: Array<TreeNode> = props.nodes;
    return nodes.map(e => {
      return NodeList(e);
    });
  }
  function onKeyDown(event) {
    event.stopPropagation();
    if ([KeyCode.ArrowUp, KeyCode.ArrowRight, KeyCode.ArrowDown, KeyCode.ArrowLeft].indexOf(event.key) < 0) {
      return;
    }

    const selectedNode = props.tree.lastSelectedNode()
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

  return (
    <div className="hierarchy-tree"
      tabIndex={0}
      onKeyDown={onKeyDown.bind(this)}
      onClick={props.onClick}
      onFocus={props.onFocus}
      onBlur={props.onBlur}
      ref={elem => props.setRef(elem)}>
      <ol onClick={e => e.stopPropagation()} style={{ listStyle: "none", paddingLeft: "20px", margin: "0px", position: "relative" }}>{nodes()}</ol>
      {props.children}
    </div>
  );
  
}

export default tree