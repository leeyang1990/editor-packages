import { MatrixUtil } from "./matrix/MatrixUtil";
import { Point } from "./matrix/Point";
import { Rectangle } from "./matrix/Rectangle";

export class Layout {
	config: any;
	childrenBoxArray: Box[] = [];
	constructor() {
		this.$root = document.createElement("div");
		this.$root.style.width = "100%";
		this.$root.style.height = "100%";
		this.$root.style.display = "flex";
		this.$root.className = "simple-layout-root"

		window.addEventListener("resize",()=>{
			if(this.childrenBoxArray.length>0){
				this.childrenBoxArray[0].onDeepResize()
			}
		})
	}
	add(box: Box) {
		this.childrenBoxArray.push(box);
		this.childrenBoxArray = [...this.childrenBoxArray];
		this.addBox(box);
	}

	private addBox(box: Box) {
		let length = this.childrenBoxArray.length;
		if (length === 1) {
			box.leader = this.$root;
			box.fillLeader();
		} else {
			let lastBox = this.childrenBoxArray[this.childrenBoxArray.length - 2];
			//step1 修正当前的leader
			lastBox.type = box.type;
			box.leader = lastBox.shadow;
			lastBox.shadowBox = box;
			box.fillLeader();
			lastBox.updateLeaderStyle();
			lastBox.updateItems();
		}
	}
	public static createHorizontalBox(size: number) {
		let box = new Box();
		box.type = "h";
		box.size = size;
		return box;
	}

	$root!: HTMLDivElement;

	public static createVerticalBox(size: number) {
		let box = new Box();
		box.type = "v";
		box.size = size;
		return box;
	}
}
export class Box {
	root!: HTMLDivElement;
	shadow!: HTMLDivElement;
	shadowBox!: Box;
	line!: HTMLDivElement;
	type: "h" | "v" = "h";
	size: number = 0;
	minSize: number = 150;
	lineSize: number = 3;
	lineColor: string = "black";
	//resize的容器，其中包含了两个子容器和一个resize线
	leader!: HTMLDivElement;
	onresize!: Function;
	mouseDownPosition: { x: number; y: number } = { x: 0, y: 0 };
	mouseDownSize: { width: string; height: string } = {
		width: "100%",
		height: "100%"
	};
	bindedLineMoveEvent: any;
	constructor() {
		this.init();
	}
	init() {
		this.root = document.createElement("div");
		this.root.style.width = "100%";
		this.root.style.height = "100%";
		this.root.className = "first";
		this.line = document.createElement("div");
		this.line.style.backgroundColor = this.lineColor;
		this.line.style.width = "0px";
		this.line.style.height = "0px";
		this.line.addEventListener("mousedown", this.onLineMouseDown.bind(this));
		// this.line.draggable = true;
		// this.line.addEventListener("drag", (event:DragEvent)=>{
		// 	event.preventDefault()
		// }));

		this.shadow = document.createElement("div");
		this.shadow.style.width = "0px";
		this.shadow.style.height = "0px";
		this.shadow.style.display = "flex";
	}
	fillLeader() {
		// console.log(this.leader);
		this.leader.append(this.root);
		this.leader.append(this.line);
		this.leader.append(this.shadow);
	}
	updateLeaderStyle() {
		if (this.type === "h") {
			this.leader.style.flexDirection = "row";
		} else if (this.type === "v") {
			this.leader.style.flexDirection = "column";
		}
	}
	updateItems() {
		if (this.type === "h") {
			this.root.style.width = `${this.size}px`;
			// this.root.style.minWidth = `${this.minSize}px`;
			// this.root.style.maxWidth = `calc(100% - ${this.minSize}px)`;
			this.line.style.width = `${this.lineSize}px`;
			this.line.style.height = "100%";
			this.line.style.cursor = "col-resize";
			this.shadow.style.width = `calc(100% - ${this.size - this.lineSize}px)`;
			// this.shadow.style.minWidth = `${this.minSize}px`;
			this.shadow.style.height = "100%";
		} else if (this.type === "v") {
			this.root.style.height = `${this.size}px`;
			// this.root.style.minHeight = `${this.minSize}px`;
			// this.root.style.maxHeight = `calc(100% - ${this.minSize}px)`;
			this.line.style.height = `${this.lineSize}px`;
			this.line.style.width = "100%";
			this.line.style.cursor = "row-resize";
			this.shadow.style.height = `calc(100% - ${this.size - this.lineSize}px)`;
			// this.shadow.style.minHeight = `${this.minSize}px`;
			this.shadow.style.width = "100%";
		}

		if (!this.bindedLineMoveEvent) {
			this.bindedLineMoveEvent = this.onLineMove.bind(this);
		}
		// this.leader.addEventListener("mouseup",this.onLineMouseUp.bind(this));
	}
	onLineMouseDown(event: MouseEvent) {
		window.addEventListener("mousemove", this.bindedLineMoveEvent);
		const cancel = () => {
			window.removeEventListener("mousemove", this.bindedLineMoveEvent);
			window.removeEventListener("mouseup", cancel);
		};
		window.addEventListener("mouseup", cancel);
		this.mouseDownPosition = { x: event.screenX, y: event.screenY };
		this.mouseDownSize = {
			width: this.root.style.width,
			height: this.root.style.height
		};
	}
	onLineMouseUp(event: MouseEvent) {}
	onLineMove(event: MouseEvent) {
		let currentPostion = { x: event.screenX, y: event.screenY };
		let off = {
			x: this.mouseDownPosition.x - currentPostion.x,
			y: this.mouseDownPosition.y - currentPostion.y
		};
		if (this.type === "h") {
			if (parseFloat(this.mouseDownSize.width) - off.x < this.minSize) {
				return;
			}
			this.root.style.width = `${parseFloat(this.mouseDownSize.width) - off.x}px`;
			this.shadow.style.width = `calc(100% - ${parseFloat(this.mouseDownSize.width) - off.x}px)`;

			// this.onDeepResize([width, height]);
			this.onDeepResize();
			// if (this.onresize) {
			// 	this.onresize(parseFloat(this.mouseDownSize.width) - off.x);
			// }
		} else if (this.type === "v") {
			if (parseFloat(this.mouseDownSize.height) - off.y < this.minSize) {
				return;
			}
			this.root.style.height = `${parseFloat(this.mouseDownSize.height) - off.y}px`;
			this.shadow.style.height = `calc(100% - ${parseFloat(this.mouseDownSize.height) - off.y + this.lineSize}px)`;
			this.onDeepResize();

			// if (this.onresize) {
			// 	this.onresize(parseFloat(this.mouseDownSize.height) - off.y);
			// }
		}
	}
	onDeepResize() {
		let width = 0;
		let height = 0;
		if(this.type === "h"){
			 width = parseFloat(this.root.style.width);
		 height = this.root.getBoundingClientRect().height;
		}else{
			height = parseFloat(this.root.style.height);
			width = this.root.getBoundingClientRect().width;
		}
		let size = [width,height];
		if (this.onresize) {
			this.onresize(size);
		}
		if (this.shadowBox) {
			this.shadowBox.onDeepResize();
		}
	}
	public get rect() {
        const p = MatrixUtil.localToGlobal(this.root, new Point());
        const width = this.root.offsetWidth;
        const height = this.root.offsetHeight;
        return new Rectangle(p.x, p.y, width, height);
    }
}

const defaultConfig = [];
