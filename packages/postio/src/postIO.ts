import EventEmitter = require("eventemitter3");
const prefix = "postIO-"
export class Parent {
    event: EventEmitter;
    fn: any;
    children: Child[] = [];

    constructor() {
        this.fn = this.interceptors.bind(this)
        window.addEventListener('message', this.fn, false);
        this.event = new EventEmitter()
    }
    interceptors(e:any) {
        let data = e.data
        let childwindow = e.source
        if(childwindow === window){
            // console.log('local message',data)
            return;
        }
        let idx = this.children.findIndex(e => e.window === childwindow)
        let child:Child;
        if (idx == -1) {
            child = new Child(childwindow);
            this.children.push(child);
            //连接到子页面
            this.event.emit('connection', child)
        }else{
            child = this.children[idx]
        }
        child.event.emit("message",data)
        if (data && data.type && data.type.startsWith(prefix)) {
            child.event.emit(data.type.replace(prefix,""),...data.data)
        } 
        
    }

    on(name:string, fn:any, context?:any) {
        this.event.on(name, fn, context)
    }

}
export class Child {
    event: EventEmitter;
    window: Window;
    fn: any;
    constructor(__window: Window) {
        this.event = new EventEmitter()
        this.window = __window
        if (__window == window) {
            this.window  = parent;
            this.fn = this.interceptors.bind(this)
            window.addEventListener('message', this.fn, false);
        }
    }
    interceptors(e:any) {
        let data = e.data
        let parentwindow = e.source
        if (parentwindow == window.parent) {
          
            this.event.emit("message",data)
            if (data && data.type && data.type.startsWith(prefix)) {
                this.event.emit(data.type.replace(prefix,""),...data.data)
            } 
        }
    }
    emit(name: string, ...args: any) {
        let type = prefix+(name?name:"untitled")
        this.window.postMessage(
            {
                type: type,
                data: args
            },
             "*");
    }
    send(name: string, ...args: any) {
        this.emit(name, args)
    }
    on(name: string, fn:any, context?:any) {
        this.event.on(name, fn, context)
    }
    off(name:string){
        this.event.off(name)
    }
}
enum MessageType {
    CONNECTION = "connection",//父页面注册了一个子页面的消息，
    MESSAGE = "message",//子页面消息转发，不可靠，包含野消息
}