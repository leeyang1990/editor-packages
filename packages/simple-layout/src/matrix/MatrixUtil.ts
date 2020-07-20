import { Matrix } from "./Matrix";
import { Point } from "./Point";
export class MatrixUtil {
	public static degree: number = 180 / Math.PI;
	public static radian: number = Math.PI / 180;

	/**将一个标签的本地坐标转换为相对于body的坐标 */
	public static localToGlobal(target: HTMLElement, p: Point): Point {
		const matrix: Matrix = this.getMatrixToWindow(target);
		const tmpP: Point = matrix.transformPoint(p.x, p.y);
		return tmpP;
	}
	/**将相对于窗口的坐标转换为目标标签的本地坐标*/
	public static globalToLocal(target: HTMLElement, p: Point): Point {
		const matrix: Matrix = this.getMatrixToWindow(target);
		matrix.invert();
		const tmpP: Point = matrix.transformPoint(p.x, p.y);
		return tmpP;
	}
	/**获取一个标签相对于窗口的变换矩阵 */
	public static getMatrixToWindow(target: HTMLElement): Matrix {
		const matrix: Matrix = this.getMatrix(target);
		while (target.parentElement) {
			if (target.parentElement.scrollTop !== 0 || target.parentElement.scrollLeft !== 0) {
				const appendMatrix: Matrix = new Matrix(1, 0, 0, 1,
					-target.parentElement.scrollLeft,
					-target.parentElement.scrollTop);
				matrix.concat(appendMatrix);
			}
			if (target.parentElement === target.offsetParent) {
				matrix.concat(this.getMatrix(target.parentElement));
			}
			target = target.parentElement;
		}
		return matrix;
	}
	//样式矩阵信息缓存
	private static cssMatrixCache: any = {};
	/** 获取一个标签的矩阵信息*/
	public static getMatrix(target: HTMLElement): Matrix {
		const targetMatrix: Matrix = new Matrix();
		//提取样式里面的矩阵信息
		let cssMatrixList: Matrix[] = [];
		if (this.cssMatrixCache[target.style.transform]) {
			cssMatrixList = this.cssMatrixCache[target.style.transform];
		}
		else {
			this.checkCssTransform(target, (tag: string, values: any[]) => {
				const tmpMatrix: Matrix = this.makeMatrix(tag, values);
				cssMatrixList.push(tmpMatrix);

			});
			this.cssMatrixCache[target.style.transform] = cssMatrixList;
		}
		//连接样式矩阵矩阵
		for (let i: number = cssMatrixList.length - 1; i >= 0; i--) {
			targetMatrix.concat(cssMatrixList[i]);
		}
		//追加一个位移矩阵
		const translateMatrix: Matrix = new Matrix(1, 0, 0, 1, target.offsetLeft, target.offsetTop);
		targetMatrix.concat(translateMatrix);
		return targetMatrix;
	}
	private static checkCssTransform(target: HTMLElement, callback: Function): void {
		//提取样式里面的矩阵信息
		let transformStr: string = target.style.transform;
		if (transformStr) {
			transformStr = transformStr.toLowerCase();
			let index: number = 0;
			let startIndex: number = -1;
			let tmpMatrixOperateTag!: string;
			let serchMode: string = "key";//key||value;
			while (index < transformStr.length) {
				const char: string = transformStr.charAt(index);
				if (char !== ' ') {
					b: switch (serchMode) {
						case "key":
							if (char === '(') {
								const matrixKey: string = transformStr.substring(startIndex, index);
								tmpMatrixOperateTag = this.keyToTag(matrixKey);
								serchMode = 'value';
								continue;
							}
							else if (startIndex === -1) {
								startIndex = index;
							}
							break b;
						case "value":
							if (char === '(') {
								startIndex = index;
							}
							else if (char === ')') {
								const valueString: string = transformStr.substring(startIndex + 1, index);
								// valueString = valueString.substring(1, valueString.length - 1);
								const values: any[] = valueString.split(',');
								if (tmpMatrixOperateTag) {
									callback(tmpMatrixOperateTag, values);
								}
								(tmpMatrixOperateTag as any) = undefined;
								serchMode = 'key';
							}
							break b;
					}
				}
				index++;
			}
		}
	}
	private static keyToTag(key: string): string {
		key = key.trim();
		//......
		return key;
	}
	private static transformValues(args: any[]): void {
		for (let i: number = 0; i < args.length; i++) {
			if (args[i].indexOf('px') !== -1) {
				args[i] = args[i].substring(0, args[i].indexOf('px') - 1);
			}
			if (args[i].indexOf('deg') !== -1) {
				args[i] = args[i].substring(0, args[i].indexOf('deg') - 1);
			}
			args[i] = Number(args[i].toString().trim());
		}
	}
	private static makeMatrix(tag: string, args: any[]): Matrix {
		this.transformValues(args);
		const matrix: Matrix = new Matrix();
		switch (tag) {
			case 'matrix':
				matrix.a = args[0]; matrix.b = args[1];
				matrix.c = args[2]; matrix.d = args[3];
				matrix.tx = args[4]; matrix.ty = args[5];
				break;
			case 'translate':
				matrix.translate(args[0], args[1]);
				break;
			case 'translatex':
				matrix.translate(args[0], 0);
				break;
			case 'translatey':
				matrix.translate(0, args[0]);
				break;
			case 'scale':
				matrix.scale(args[0], args[1]);
				break;
			case 'scalex':
				matrix.scale(args[0], 1);
				break;
			case 'scaley':
				matrix.scale(1, args[0]);
				break;
			case 'rotate':
				matrix.rotate(args[0]);
				break;
		}
		return matrix;
	}
}