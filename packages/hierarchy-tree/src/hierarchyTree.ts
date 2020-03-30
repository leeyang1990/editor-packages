import * as React from "react";
import * as ReactDOM from "react-dom";
import { EventEmitter2 } from "eventemitter2";
import Tree from "./tree";
import uuidV4 from "uuid/v4";

export class Config {
  autoDeselect?: boolean;
  draggable?: boolean;
  editable?: boolean;
  search?:any;
}
export default class HierarchyTree extends EventEmitter2 {
  config: Config;
  selected: Array<TreeNode> = [];
  _nodes: Array<TreeNode> = [];
  target: HTMLElement;
  batching: number = 0;
  lastCtrlNode: TreeNode;
  ref: HTMLElement;
  type: string = "tree";
  edittingNode: TreeNode;
  private _focused: boolean;
  private beforeSearchExtends:Array<TreeNode>;
  /**
   * 右键逻辑初始标记
   */
  contextInit: boolean = false;
  constructor(config: Config, target: HTMLElement) {
    super();
    this.config = {
      autoDeselect: true,
      draggable: true,
      editable: true,
      search:{}
    };
    this.config = Object.assign(this.config, config);
    this.target = target;
    // this.reload(data);
    // this.render();

    this.on("changes.applied", () => {
      this.render();
    });
  }

  public render() {
    ReactDOM.render(
      React.createElement(Tree, {
        tree: this,
        nodes: this._nodes,
        onClick: this.onClick.bind(this),
        setRef: this.setRef.bind(this),
        onBlur: this.onBlur.bind(this),
        onFocus: this.onFocus.bind(this)
      }),
      this.target
    );
  }
  public setRef(ref: HTMLElement) {
    this.ref = ref;
  }
  public node(id: string): TreeNode {
    return expandNodes(this._nodes).find(e => e.id === id);
  }
  public nodes(ids: Array<string>): TreeNode[] {
    return expandNodes(this._nodes).filter(e => ids.indexOf(e.id));
  }
  public map(fn: (node: TreeNode) => any) {
    return expandNodes(this._nodes).map(node => {
      return fn(node);
    });
  }
  public filter(fn: (node: TreeNode) => any) {
    return expandNodes(this._nodes).filter(node => {
      return fn(node);
    });
  }

  public setConfig(config: any) { }
  public reload(data: any = undefined) {
    if (data) {
      this._nodes = this.load(data);
    }
    this.render();
  }
  public load(data: Array<any>, root: TreeNode = undefined): Array<TreeNode> {
    try {
      if (!Array.isArray(data)) {
        data = [new TreeNode(data, this, root)];
        return data;
      }
      return data.map(e => {
        return new TreeNode(e, this, root);
      });
    } catch (error) {
      this.emit("data.loaderror", error);
      return [];
    }
  }
  public removeAll() {
    this.selected = [];
    this._nodes = [];
    this.batching = 0;
    this.lastCtrlNode = undefined;
    this.edittingNode = undefined;
  }
  batch() {
    if (this.batching < 0) {
      this.batching = 0;
    }
    this.batching++;
  }
  end() {
    this.batching--;
    if (this.batching === 0) {
      this.emit("changes.applied");
    }
  }
  disableDeselection() {
    this.config.autoDeselect = false;
  }
  enableDeselection() {
    this.config.autoDeselect = true;
  }
  select(node: TreeNode) {
    if (this.selected.indexOf(node) === -1) {
      this.selected.push(node);
    }
  }
  deselect(node: TreeNode) {
    const index = this.selected.indexOf(node);
    if (index !== -1) {
      this.selected.splice(index, 1);
    }
  }
  /**
   * 选中列表，复选，不会反选已选中
   * @param ids 
   */
  @applyTree()
  selects(ids: string[]) {
    this.config.autoDeselect = false;
    const nodes = ids.map(id => this.node(id));
    for (const node of nodes) {
      if (node) {
        node.select();
      }
    }
    this.config.autoDeselect = true;
  }
  @applyTree()
  deselects(ids: string[]) {
    this.nodes(ids).map(e => e.deselect());
  }
  clearSelection() {
    this.batch();
    //重置右键状态
    this.contextInit = false;
    //清除其他选中状态
    const nodes = this.map(n => {
      n.deselect();
      return n;
    });
    this.lastCtrlNode = undefined;
    this.end();
    return nodes;
  }
  lastSelectedNode() {
    return this.selected.length > 0
      ? this.selected[this.selected.length - 1]
      : null;
  }

  shiftSelect(node: TreeNode) {
    this.batch();
    const nodes = expandNodes(this._nodes);
    const lastSelectedNode = this.lastSelectedNode();

    if (!this.lastCtrlNode) {
      this.lastCtrlNode = lastSelectedNode;
    }
    if (this.lastCtrlNode) {
      //判断当前选择节点在哪个选区中
      const resizeContent = this.searchConnected(this.lastCtrlNode, nodes);
      if (resizeContent.length > 0) {
        for (const iterator of resizeContent) {
          iterator.deselect();
        }
      }
      this.selectBetween(nodes, this.lastCtrlNode, node);
    } else {
      node.select();
    }

    this.end();
    return this;
  }
  ctrlSelectOrDeselect(node: TreeNode) {
    this.lastCtrlNode = node;
  }
  /**
   * 返回node的相邻可见且选中的节点
   *
   * @param node
   * @param nodes 树的完整展开序列
   */
  searchConnected(node: TreeNode, nodes: Array<TreeNode>) {
    const resizeContent = [];
    let previous = node.previousVisibleNode(nodes);
    let next = node.nextVisibleNode(nodes);
    while (previous && previous.selected()) {
      resizeContent.push(previous);
      previous = previous.previousVisibleNode(nodes);
    }
    while (next && next.selected()) {
      resizeContent.push(next);
      next = next.nextVisibleNode(nodes);
    }
    return resizeContent;
  }
  selectBetween(nodes: Array<TreeNode>, fromNode: TreeNode, toNode: TreeNode) {
    //带方向的选中
    const from = nodes.indexOf(fromNode);
    const to = nodes.indexOf(toNode);
    const start = from < to ? from : to;
    const end = from < to ? to : from;
    for (let index = start; index <= end; index++) {
      const node = nodes[index];
      if (!node.selected() && node.visible()) {
        node.select();
      }
    }
  }
  onClick(event) {
    this.clearSelection();
  }
  focused() {
    return this._focused;
  }
  focus() {
    this.ref.focus();
  }
  @applyTree()
  onFocus() {
    this.emit("tree.focus", this);
    this._focused = true;
  }
  blur() {
    this.ref.blur();
  }
  @applyTree()
  onBlur() {
    this.emit("tree.blur", this);
    this._focused = false;
  }

  getIndexedSelected() {
    const all = expandNodes(this._nodes);
    return this.selected.concat().sort((a, b) => all.indexOf(a) - all.indexOf(b));
  }
  @applyTree()
  expanded() {
    const all = expandNodes(this._nodes);
    return all.filter(e => e.expanded());
  }
  @applyTree()
  expands(ids: string[]) {
    const nodes = ids.map(id => this.node(id));
    for (const node of nodes) {
      if (node) {
        node.expand();
      }
    }
  }

  /**
   * 提交选中，反选列表外的，选中列表中未选中的
   * @param ids 
   */
  @applyTree()
  commitSelection(ids: string[]) {
    const selected = this.selected.map(e => e.id);
    const deselects = selected.filter(x => !ids.includes(x));
    const selects = ids.filter(x => !selected.includes(x));
    deselects.map(e => this.node(e).deselect());
    selects.map(e => this.node(e).select());
  }
  @applyTree()
  clearSearch() {
    if(this.beforeSearchExtends){
      this.map((e)=>{e.show();e.dismatch();})
      this.map(e=>e.collapse());
      this.beforeSearchExtends.map(e=>{e.expand()})
    }
    this.beforeSearchExtends = undefined;
    return this._nodes;
  }
  @applyTree()
  search(query: string | RegExp | Function): Promise<TreeNode[]> {

    // Don't search if query empty
    if (!query || (query === "")) {
      return Promise.resolve(this.clearSearch());
    }
    if(!this.beforeSearchExtends){
        this.beforeSearchExtends = this.filter(e=>e.expanded());
    }
    let { matcher, matchProcessor }:{matcher:Function,matchProcessor:Function} = this.config.search;

    this.map(e=>{
      e.hide();
      e.dismatch();
    })
    // Query nodes for any matching the query
    matcher = (matcher instanceof Function) ? matcher : (matchQuery:string | RegExp | Function, resolve) => {
        // Convery the query into a usable predicate
        if (typeof(matchQuery) === "string") {
            matchQuery = new RegExp(matchQuery, 'i');
        }

        let predicate;
        if (matchQuery instanceof RegExp) {
            predicate = (node:TreeNode) => {if(matchQuery instanceof RegExp){return matchQuery.test(node.text)}};
        }
        else {
            predicate = matchQuery;
        }
        // Recurse down and find all matches
        const matches = this.filter((node)=>predicate(node));
        resolve(matches);
    };
    // Process all matching nodes.
    matchProcessor = (typeof matchProcessor ==="function") ? matchProcessor : matches => {
        matches.forEach((node:TreeNode) => {
            node.show();
            node.match();
            if(node.hasParent()){
              node.parent.expand();
            }
            
        });
    };
    // Wrap the search matcher with a promise since it could require async requests
    return new Promise((resolve, reject) => {
        // Execute the matcher and pipe results to the processor
        matcher(query, matches => {
            this.batch();
            matchProcessor(matches);
            this.end();
            resolve(matches);
        }, reject);
    });
  }
}
/**
 * 展开树的完整的自上而下的序列
 *
 * @param nodes 未展开的对象
 */
function expandNodes(nodes: Array<TreeNode>): Array<TreeNode> {
  let arr = [];
  for (const iterator of nodes) {
    arr.push(iterator);
    if (iterator.hasChildren()) {
      arr = arr.concat(expandNodes(iterator.children));
    }
  }
  return arr;
}
function applyTree() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value;
    descriptor.value = function () {
      this.batch();
      const re = method.apply(this, arguments);
      this.end();
      return re;
    };
  };
}
function applyChanges() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value;
    descriptor.value = function () {
      this.tree.batch();
      const re = method.apply(this, arguments);
      this.tree.end();
      return re;
    };
  };
}
export class TreeNode {
  id?: string;
  text: string;
  ref: any;
  itree: {
    a?: {
      attributes?: any
    },
    icon?: string,
    icon_expand?: string,
    li?: {
      attributes?: any
    },
  } = {}

  tree: HierarchyTree;
  children?: Array<TreeNode>;
  parent: TreeNode;

  dragOverTag: string;

  editable: boolean = true;
  willEdit: boolean = false;

  rawData: any;

  private _expanded: boolean = false;
  private _selected: boolean = false;
  private _dragTargeted: boolean = false;
  private _editing: boolean = false;
  private _hidden:boolean = false;
  // private _removed:boolean = false;
  private _matched:boolean = false;

  constructor(node: any, tree: HierarchyTree, parent: TreeNode) {
    this.id = uuidV4();
    this.parent = parent;
    this.tree = tree;
    for (const key in node) {
      if (node.hasOwnProperty(key)) {
        const element = node[key];
        if (key === "children") {
          this[key] = element.map((e: any) => {
            return new TreeNode(e, tree, this);
          });
        } else {
          this[key] = element;
        }
      }
    }
  }

  render() {
    this.tree.emit("changes.applied");
  }

  dragOvered() {
    return this._dragTargeted;
  }
  @applyChanges()
  dragOver(value) {
    if (!value) {
      this.dragOverTag = undefined;
    }
    this._dragTargeted = value;
    this.tree.emit("node.dragover", this.dragOverTag);
  }

  expanded() {
    return this._expanded;
  }
  collapsed() {
    return !this._expanded;
  }

  @applyChanges()
  expand() {
    if (this.expanded()) {
      return;
    }
    this._expanded = true;
    this.tree.emit("node.expanded", this);
    //递归展开
    if (this.getParent() && !this.getParent().expanded()) {
      this.getParent().expand();
    }
  }
  @applyChanges()
  collapse() {
    if (this.collapsed()) {
      return;
    }
    this._expanded = false;
    this.tree.emit("node.collapsed", this);
  }

  toggleExpand() {
    this.expanded() ? this.collapse() : this.expand();
  }
  selected() {
    return this._selected;
  }
  @applyChanges()
  select() {
    const selected = this.selected()
    //是否清除状态
    if (this.tree.config.autoDeselect) {
      this.tree.clearSelection();
    }
    this._selected = true;
    this.tree.select(this);

    //递归展开
    if (this.getParent() && !this.getParent().expanded()) {
      this.getParent().expand();
    }
    //根据当前状态确定是否发送事件，若当前已经被选中，则不会再次派发选中事件
    if (!selected) {
      this.tree.emit("node.selected", this);
    }

  }
  @applyChanges()
  deselect() {
    if (this.selected()) {
      this._selected = false;
      this.willEdit = false;
      this.tree.deselect(this);
      this.tree.emit("node.deselected", this);
    }

  }
  @applyChanges()
  setText(value: string) {
    this.text = value;
  }

  editing() {
    return this._editing;
  }
  @applyChanges()
  edit(
    state: boolean,
    oldValue: string = undefined,
    newValue: string = undefined
  ) {
    this._editing = state;
    if (state) {
      this.tree.edittingNode = this;
      this.tree.emit("node.editing", this, this.text);
    } else {
      this.tree.edittingNode = null;
      this.tree.emit("node.edited", this, oldValue, newValue);
    }
  }
  getParent() {
    return this.parent;
  }
  hasParent() {
    return this.parent !== undefined;
  }
  getChildren() {
    return this.children;
  }
  hasChildren() {
    return this.children && this.children.length > 0;
  }
  addChildren(data: any) {
    const nodes = this.tree.load(data, this);
    this.addNodes(nodes);
  }
  @applyChanges()
  addNodes(nodes: Array<TreeNode>) {
    this.insertNodes(nodes, 0);
  }
  @applyChanges()
  remove() {
    if (!this.hasParent()) {
      const index = this.tree._nodes.indexOf(this);
      if (index !== -1) {
        this.tree._nodes.splice(index, 1);
      }
    } else {
      this.getParent().children.splice(
        this.getParent().children.indexOf(this),
        1
      );
      this.parent = null;
    }
    this.tree.emit("node.removed", this);
  }
  @applyChanges()
  insertNodes(nodes: Array<TreeNode>, direction: number) {
    const children = this.hasParent()
      ? this.getParent().children
      : this.tree._nodes;

    if (direction === -1) {
      //above
      const index = children.indexOf(this);
      children.splice(index, 0, ...nodes);
      nodes.forEach(
        e => (e.parent = this.hasParent() ? this.getParent() : undefined)
      );
    } else if (direction === 0) {
      //inner
      for (const node of nodes) {
        node.parent = this;
      }
      this.children = this.children ? this.children.concat(nodes) : nodes;
    } else if (direction === 1) {
      //below
      const index = children.indexOf(this);
      children.splice(index + 1, 0, ...nodes);
      nodes.forEach(
        e => (e.parent = this.hasParent() ? this.getParent() : undefined)
      );
    }

    for (const node of nodes) {
      this.tree.emit("node.added", node);
    }
  }
  visible() {
    //当前“可见”的条件为“向上逐层展开”
    let isVisible = true;
    if (this.hidden()) {
        isVisible = false;
    }
    else if (this.hasParent()) {
      if (this.getParent().collapsed()) {
        isVisible = false;
      } else {
        isVisible = this.getParent().visible();
      }
    } else {
      isVisible = true;
    }

    return isVisible;
  }
  hidden(){
    return this._hidden;
  }
  @applyChanges()
  hide(){
    this._hidden = true;
  }
  @applyChanges()
  show(){
    this._hidden = false;
    if(this.hasParent()){
      this.parent.show();
    }
  }
  matched(){
    return this._matched;
  }
  @applyChanges()
  match(){
    this._matched = true;
  }
  @applyChanges()
  dismatch(){
    this._matched = false;
  }
  nextVisibleNode(expandnodes: Array<TreeNode> = undefined) {
    //垂直展开所有节点
    //TODO:复杂度更低的解法

    const nodes = expandnodes ? expandnodes : expandNodes(this.tree._nodes);
    const i = nodes.findIndex(e => e.id === this.id);
    const content = nodes.slice(i + 1);
    const next: TreeNode = content.find(e => e.visible() === true);
    return next;
  }
  previousVisibleNode(expandnodes: Array<TreeNode> = undefined) {
    let previous: TreeNode;
    //垂直展开所有节点
    //TODO:复杂度更低的解法
    const nodes = expandnodes ? expandnodes : expandNodes(this.tree._nodes);
    const i = nodes.findIndex(e => e.id === this.id);
    if (i <= 0) {
      //自身已移除或者已经是顶部，无上一个相邻节点
      return undefined;
    }
    const content = nodes.slice(0, i);

    for (let index = i - 1; index >= 0; index--) {
      const element = content[index];
      if (element && element.visible() === true) {
        previous = element;
        break;
      }
    }

    return previous;
  }
}
