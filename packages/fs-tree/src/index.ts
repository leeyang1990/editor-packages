import HierarchyTree, { TreeNode } from "hierarchy-tree";
// import "hierarchy-tree/dist/hierarchy-tree.css";

export class FsTree {
	tree!: HierarchyTree;
	$root!: HTMLDivElement;
	nodeClick!: Function;
	nodeDblclick!: Function;
	constructor() {}
	initTree() {
		this.$root = document.createElement("div");
		this.$root.style.width = "100%";
		this.$root.style.height = "100%";
		this.$root.style.position = "relative";
		this.$root.className = "tree-container";
		this.$root.addEventListener("click", e => {
			if (e.target !== this.$root) {
				return;
			}
			console.log("container.click");
			// this.tree.clearSelection();
		});

		this.tree = new HierarchyTree({ draggable: false, editable: false }, this.$root);
		this.attachEvent();
	}

	async reLoadTree(treeObj: any) {
		this.tree.reload(treeObj);
	}
	attachEvent() {
		this.tree.on("node.click", (event: any, node: TreeNode) => {
			if (node.hasChildren()) {
				node.toggleExpand();
			} else {
				if (this.nodeClick) {
					this.nodeClick(node.id);
				}
			}
		});
		this.tree.on("node.dblclick", (event: any, node: TreeNode) => {
			if (!node.hasChildren()) {
				if (this.nodeDblclick) {
					this.nodeDblclick(node.id);
				}
			}
		});
	}
}
import dirTree from "directory-tree";
import { getIconForFile } from "vscode-icons-js";
const iconsRoot = "./../static/resources/icons/";
const iconArray: string[] = [];
export async function DirTree(dir: string, svgRoot: string) {
	let tempIconArray: string[] = ["default_folder", "default_folder_opened"];
	const tree = dirTree(
		dir,
		{},
		(item: any, PATH: any, stats: any) => {
			(item as any).id = item.path;
			(item as any).text = item.name;
			//iconsRoot+icon
			let iconFile = getIconForFile(item.path);
			let iconName = iconFile!.split(".")[0];
			if (iconArray.indexOf(iconName) === -1) {
				tempIconArray.push(iconName);
			}
			// let styleElem = document.head.appendChild(document.createElement("style"));
			// styleElem.innerHTML = `.node .icon-${iconName}::before {background-image: url(${iconsRoot + iconFile});}`;
			(item as any).itree = { icon: `icon-${iconName}`, icon_expand: `icon-${iconName}` };
		},
		(item: any, PATH: any, stats: any) => {
			(item as any).id = item.path;
			(item as any).text = item.name;
			(item as any).itree = {
				icon: "icon-default_folder",
				icon_expand: "icon-default_folder_opened"
			};
		}
	);

	(tree as any).id = tree.path;
	(tree as any).text = tree.name;
	(tree as any).itree = {
		icon: "icon-default_folder",
		icon_expand: "icon-default_folder_opened"
	};

	let styleElem = document.head.appendChild(document.createElement("style"));
    let innerHtml = "";
    
	for (let index = 0; index < tempIconArray.length; index++) {
		const element = tempIconArray[index];
		innerHtml += `.node .icon-${element}::before {background-image: url(${svgRoot + element}.svg);}`;
	}
	styleElem.innerHTML = innerHtml;
	return tree;
}
