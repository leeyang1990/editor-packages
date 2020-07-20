import React from "react";
import ReactDOM from "react-dom";
import HierarchyTree from "../src";
import "./../index.less"
class App extends React.Component<any> {
  tree: HierarchyTree;
  constructor(props: any) {
    super(props);
    // return;
    const data = [
      {
        text: "Main Camera",
        id: "Main Camera",
        itree: { icon: "icon-folder", icon_expand: "icon-folder-open" }
      },
      {
        text: "Directinal Light",
        id: "Directinal Light",
        itree: { icon: "icon-folder", icon_expand: "icon-folder-open" },
        type: "mycomponent",
        children: [
          {
            text: "Cube",
            id: "Cube",
            children: [
              { text: "Cube1", id: "Cube1" },
              { text: "Cube2", id: "Cube2" }
            ]
          },
          {
            text: "Cube3",
            children: [{ text: "Cube11" }, { text: "Cube22" }]
          }
        ]
      }
    ];
    const container = document.createElement("div");
    container.style.backgroundColor = "#252526";
    container.style.resize = "vertical";
    container.style.overflow = "auto";
    container.style.position = "relative";
    container.style.height = "300px";
    container.addEventListener("click", e => {
      if (e.target !== container) {
        return;
      }
      console.log("container.click");
      this.tree.clearSelection();
    });

    const root = document.getElementById("root");
    root.appendChild(container);
    this.tree = new HierarchyTree({}, container);
    this.tree.reload(data);

    //事件列表
    this.tree.on("changes.applied", (event, node) => {
      console.log("render");
    });
    this.tree.on("node.edited", (node,oldValue,newValue) => {
      // console.log("node.removed" + node.text);
      console.log(oldValue)
      console.log(newValue)
    });


    const data1 = [
      { text: "Main Camera", id: "Main Camera" },
      {
        text: "Directinal Light",
        id: "Directinal Light",
        itree: { icon: "icon-folder", icon_expand: "icon-folder-open" },
        accept: ["mycomponent"],
        children: [
          {
            text: "Cube",
            id: "Cube",
            children: [
              { text: "Cube1", id: "Cube1" },
              { text: "Cube2", id: "Cube2" }
            ]
          },
          {
            text: "Cube3",
            children: [{ text: "Cube11" }, { text: "Cube22" }]
          }
        ]
      }
    ];
    const container1 = document.createElement("div");
    container1.style.backgroundColor = "#474747";
    container1.style.resize = "vertical";
    container1.style.overflow = "auto";
    container1.style.position = "relative";
    container1.style.height = "300px";
    root.appendChild(container1);
    const tree1 = new HierarchyTree({}, container1);
    tree1.type = "123";
    tree1.reload(data1);
  }
  testBtn(event) {
    const data = {
      text: "Cube3",
      children: [{ text: "Cube11" }, { text: "Cube22" }]
    };
    this.tree.node("Cube1").addChildren(data);
  }
  handleChange(event){
    console.log(event.target.value)
    this.tree.search(event.target.value)
  }
  render() {
    return (
      <div>
        <button onClick={this.testBtn.bind(this)} />
        <div
          draggable={true}
          onDragStart={e => {}}
          onDragEnd={e => {}}
          style={{ backgroundColor: "red", width: "50px", height: "20px" }}
          onFocus={() => {
            console.log("onf ");
          }}
        >
          123321
        </div>
        <div
          style={{ backgroundColor: "blue", width: "50px", height: "20px" }}
          onDragOver={e => {
            e.stopPropagation();
            const isMycomponent = e.dataTransfer.types.includes("treetype");
            if (isMycomponent) {
              e.preventDefault();
            }
          }}
        ></div>
        <input onChange={this.handleChange.bind(this)}/>
        hierarchy-tree
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("root"));
