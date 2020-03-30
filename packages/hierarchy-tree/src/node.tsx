import React, { MouseEvent, useRef, useState,useEffect } from "react";
import HierarchyTree, { TreeNode } from "./hierarchyTree";
import classNames from "classnames";
import EditForm from "./editFrom";
const Node: React.FC<any> = props => {
  const treenode: TreeNode = props.treenode;
  const tree: HierarchyTree = treenode.tree;
  const touchCountRef = useRef(0);
  const [overed, setOvered] = useState(false);
  const [dragInsertTimer,setDragInsertTimer] = useState(undefined);
  const [clickTimer,setClickTimer] = useState(undefined);
  useEffect(() => {
    return () => {
      if(clickTimer){
        clearTimeout(clickTimer);
      }
      if(dragInsertTimer){
        clearTimeout(dragInsertTimer);
      }
    }
  }, [])
  function onExpand(event) {
    event.stopPropagation();
    if (treenode.hasChildren()) {
      treenode.toggleExpand();
    }
  }
  function toggle() {
    const className = "toggle icon";
    return (
      <a
        onClick={onExpand}
        className={`${className} ${treenode.hasChildren() &&
          (treenode.expanded() ? "icon-expend" : "icon-collapse")}`}
      ></a>
    );
  }
  function onMouseDown(event: MouseEvent<HTMLElement>) {
    if (event.button !== 0) {
      return;
    }

    const node: TreeNode = treenode;
    const tree = node.tree;
    event.stopPropagation();

    //开启多选
    if (event.metaKey || event.ctrlKey || event.shiftKey) {
      tree.disableDeselection();
    }
    //记录ctrl操作
    if (event.metaKey || event.ctrlKey) {
      tree.ctrlSelectOrDeselect(node);
    }

    if (event.shiftKey) {
      //区间选择
      tree.shiftSelect(node);
    } else if (node.selected()) {
      if (event.ctrlKey || event.metaKey) {
        node.deselect();
      } else {
        //当选择节点已选中，准备editting
        if (tree.selected.length === 1 && tree.focused()) {
          node.willEdit = true;
        }
        // node.select();
        //将在click中处理后续逻辑
        //1.
        //当前节点已被选中，但此时并不是复选状态，所以要反选其他，即同步选中状态为仅当前
        // tree.commitSelection([treenode.id])
        //2.
        //准备拖拽
      }
    } else {
      node.select();
    }
    if (touchCountRef.current === 1) {
      node.willEdit = false;
      touchCountRef.current = 0;
      treenode.tree.emit("node.dblmousedown", event, treenode);
    }
  }
  function onMouseUp(event) {
    event.stopPropagation();
  }

  function onClick(event: MouseEvent<HTMLElement>) {
    event.stopPropagation();
    const node: TreeNode = treenode;
    const tree = node.tree;
    touchCountRef.current += 1;

    if (
      tree.selected.length !== 1 &&
      node.selected() &&
      tree.config.autoDeselect
    ) {
      tree.commitSelection([treenode.id]);
    }

    tree.contextInit = false;
    setClickTimer(setTimeout(() => {
      //取消延迟操作，因为当前树已经失去焦点
      if (!tree.focused()) {
        touchCountRef.current = 0;
        return;
      }
      if (touchCountRef.current === 1) {
        if (node.willEdit) {
          node.edit(true);
          node.willEdit = false;
        }
      } else if (touchCountRef.current === 0) {
        //事件已响应
      }
      touchCountRef.current = 0;
    }, 400));
    

    tree.enableDeselection();
    node.tree.emit("node.click", event, node);
  }

  function onDoubleClick(event) {
    treenode.tree.emit("node.dblclick", event, treenode);
  }

  function onContextMenu(event) {
    if (!tree.contextInit && !treenode.selected()) {
      treenode.select();
    }
    tree.contextInit = true;
    treenode.tree.emit("node.contextmenu", event, treenode);
  }
  function getTargetDirection(event, elem) {
    if (!event || !elem) {
      return "";
    }
    const clientY = event.clientY;
    const toggleRect = elem.querySelector("a").getBoundingClientRect();

    const yThresholdForAbove = toggleRect.top + toggleRect.height / 3;
    const yThresholdForBelow = toggleRect.bottom - toggleRect.height / 3;

    let dir = "insert";

    if (clientY <= yThresholdForAbove) {
      dir = "above";
    } else if (clientY >= yThresholdForBelow) {
      dir = "below";
    }

    return dir;
  }

  function getAttributes() {
    const attributes: any = Object.assign(
      {},
      treenode.itree.a ? treenode.itree.a.attributes : null
    );
    attributes.className = classNames(
      attributes.class,
      attributes.className,
      "title icon",
      treenode.itree.icon
        ? treenode.expanded() && treenode.hasChildren()
          ? treenode.itree.icon_expand
            ? treenode.itree.icon_expand
            : "icon-entity"
          : treenode.itree.icon
        : "icon-entity",
      treenode.dragOverTag
    );
    attributes.onMouseDown = onMouseDown;
    attributes.onMouseUp = onMouseUp;
    attributes.onDoubleClick = onDoubleClick;
    attributes.onClick = onClick;
    attributes.onContextMenu = onContextMenu;

    if (treenode.tree.config.draggable && !treenode.editing()) {
      attributes.draggable = true;
      attributes.onDragEnd = onDragEnd;
      attributes.onDragEnter = onDragEnter;
      attributes.onDragLeave = onDragLeave;
      attributes.onDragStart = onDragStart;
      attributes.onDragExit = onDragExit;
      attributes.onDragOver = onDragOver;
      attributes.onDrop = onDrop;
    }
    return attributes;
  }
  function onDragEnd(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }
  function onDragExit(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }
  function onDragEnter(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }
  function onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    setOvered(false);
  }
  function onDragStart(event: DragEvent) {
    // event.preventDefault();
    event.stopPropagation();

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.dropEffect = "move";
    event.dataTransfer.setData("treetype", treenode.tree.type);
    event.dataTransfer.setData("nodeId", treenode.id);
    tree.emit("node.draged", event, treenode);
  }
  function onDragOver(event: DragEvent) {
    setOvered(true);
    event.preventDefault();
    event.stopPropagation();
    let tag = undefined;
    if (overed) {
      tag = getTargetDirection(event, treenode.ref);
      if (treenode.dragOverTag !== tag) {
        treenode.dragOverTag = tag;
        treenode.dragOver(true);
      }
      if(tag === "insert"&&!dragInsertTimer){
        setDragInsertTimer(setTimeout(() => {
          treenode.expand();
        }, 1000))
      }
    } else {
      if (treenode.dragOvered()) {
        treenode.dragOver(false);
      }
    }
    if(!tag||tag!=="insert"){
      clearDragInsertTimer();
    }

  }
  function clearDragInsertTimer(){
    if(dragInsertTimer){
      clearTimeout(dragInsertTimer);
      setDragInsertTimer(undefined);
    }
  }
  function onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const treetype = event.dataTransfer.getData("treetype");
    const nodeId = event.dataTransfer.getData("nodeId");
    setOvered(false);
    const targetNode = treenode;
    const dragOverTag = treenode.dragOverTag;
    let dir = 0;
    if (dragOverTag === "above") {
      dir = -1;
    } else if (dragOverTag === "insert") {
      dir = 0;
    } else if (dragOverTag === "below") {
      dir = 1;
    }

    const ordered = tree.getIndexedSelected();
    if (ordered.length === 1 && ordered[0] === targetNode) {
      tree.enableDeselection();
      if (!treetype || treetype !== tree.type) {
        //可能是外部组件或者其他tree
        tree.emit(
          "node.droped",
          event,
          treenode.tree.node(nodeId),
          targetNode,
          dir
        );
      }
      return;
    }
    //如果列表包含目标节点，则将该节点从列表中移除，以免结构丢失
    if (ordered.indexOf(targetNode) !== -1) {
      ordered.splice(ordered.indexOf(targetNode), 1);
    }

    ordered.forEach(e => e.remove());
    targetNode.insertNodes(ordered, dir);

    ordered.forEach(e => {
      if (e.getParent()) {
        e.getParent().expand();
      }
    });

    tree.enableDeselection();
    tree.emit(
      "node.droped",
      event,
      treenode.tree.node(nodeId),
      targetNode,
      dir
    );
  }

  const attributes = getAttributes();
  return (
    <div className={classNames("node", overed ? "drag-targeting" : "")}>
      {toggle()}
      <a {...attributes} ref={node => {}}>
        {!treenode.editing() ? treenode.text : <EditForm treenode={treenode} />}
        {}
      </a>
    </div>
  );
};
export default Node;
