import React, { Component } from "react";
import ReactDOM from "react-dom";
import HierarchyTree from "@editor-packages/hierarchy-tree";
import "@editor-packages/hierarchy-tree/dist/hierarchy-tree.css";
class App extends Component {
  tree: HierarchyTree;
  constructor() {
    super();
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
    // container.addEventListener("click", e => {
    //   if (e.target !== container) {
    //     return;
    //   }
    //   console.log("container.click");
    //   this.tree.clearSelection();
    // });

    const root = document.getElementById("root");
    console.log(root)
    root.appendChild(container);
    this.tree = new HierarchyTree({}, container);
    this.tree.reload(data);

    // var animation = lottie.loadAnimation({
    //   container: document.getElementById("root"), // Required
    //   path: "./data.json", // Required
    //   renderer: "html", // Required
    //   loop: true, // Optional
    //   autoplay: true, // Optional
    //   name: "Hello World" // Name for future reference. Optional.
    // });
    console.log(123)
  }
  render() {
    return <div> 123</div>;
  }
}
ReactDOM.render(<App />, document.getElementById("root"));
