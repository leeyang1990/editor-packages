import React, { Component } from "react";
import Node from "./node";
import { TreeNode } from ".";
import classNames from "classnames";
import tree from "./tree";

const NodeList: React.FC<any> = props => {
  const treenode: TreeNode = props.treenode;

  function list() {
    let children = null;
    if (treenode.hasChildren()) {
      children = treenode.children.map(e => {
        return List(e);
      });
    }
    return (<ol style={{ listStyle: "none", paddingLeft: "20px", margin: "0px" }}>
    {children}
  </ol>);
  }

  function node() {
    return <Node treenode={treenode}></Node>;
  }

  function getAttributes() {
    const attributes: any = Object.assign({}, treenode.itree.li ? treenode.itree.li.attributes : null);
    attributes["data-uid"] = treenode.id;
    const className = {
      selected: treenode.selected(),
      expanded: treenode.expanded(),
      collapsed: !treenode.expanded(),
      editting: treenode.editing(),
      matched:treenode.matched(),
      hidden:treenode.hidden(),
      focused: treenode.selected() && treenode.tree.focused()
    };

    //这里可能会加一个方法用来初始化其他的节点的属性比如 dragable selectable


    attributes.className = classNames(className, attributes.className, attributes.class);

    return attributes;
  }

  const attributes = getAttributes();
  return (
    <li
      {...attributes}
      style={{ listStyle: "none" }}
      ref={node => (treenode.ref = node)}
    >
      {node()}
      <div className="wholerow" />
      {list()}
    </li>
  );
};
const List = (treenode: TreeNode) => {
  return <NodeList treenode={treenode} key={treenode.id} />;
};
export default List;
