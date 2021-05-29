import EventEmitter = require('eventemitter3');
class EventDispatch {
    EE = new EventEmitter<symbol>();
    events={};
    eventGroups={};
    orgnize(name: string){
        let sb = Symbol(name);
        let e:Event = {
            key:sb,
            name:name,
            fn:undefined,
            context:undefined 
        }
        this.events[sb] = e;
        if(!this.eventGroups[name]){
            this.eventGroups[name] = []
        }
        this.eventGroups[name].push(e)
        return e;
    }
    on(name: string, fn: (arg: EventArgs|any) => void, context: any) {
        let e = this.orgnize(name);
        e.fn = fn;
        e.context = context;
        this.EE.on(e.key,fn,context)
        return e.key;
    }
    once(name: string, fn: (arg: EventArgs|any) => void, context: any) {
        let e = this.orgnize(name);
        e.fn = fn;
        e.context = context;
        this.EE.once(e.key,fn,context)
        return e.key;
    }
    off(key: string | symbol) {
        if (typeof (key) === 'symbol') {
            let event = this.events[key];
            let idx = this.eventGroups[event.name].indexOf(event);
            this.eventGroups[event.name].splice(idx,1);
            this.EE.off(event.key)
            delete this.events[key];
        } else {
            let events = this.eventGroups[key]
            this.eventGroups[key] = [];
            for (const iterator of events) {
                this.EE.off(iterator.key)
                delete this.events[iterator]
            }
        }
    }
    dispose(context: any, match:()=>boolean=undefined) {
        let keys = Reflect.ownKeys(this.events);
        let clear = []
        for (const iterator of keys) {
            let ele = this.events[iterator]
            if (ele.context === context) {
                if(match){
                    if(match()){
                        clear.push(iterator);
                    }
                }else{
                    clear.push(iterator);
                }
            }
        }
        for (const iterator of clear) {
            this.off(iterator.key)
        }
    }
    emit(name: string, data?: any, sender?: any) {
        let events = this.eventGroups[name];
        for (const iterator of events) {
            this.EE.emit(iterator.key,{
                name:name,
                sender:sender,
                data:data
            })
        }
    }
    
}
export interface EventArgs{
    key:symbol|string;
    sender:any;
    data:any;
}
export interface Event{
    key:symbol;
    name:string;
    fn:(arg: EventArgs|any) => void,
    context:any;
}
//TODO
export function On(name: string) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const method = descriptor.value;
        EventDispatcher.on(name, method, target);
        descriptor.value = function () {
            const result = method.apply(this, arguments);
            return result;
        };
    };
}
//TOOD
export const Off = <T extends new (...args: any[]) => any>(constructor: T) => {
    return class extends constructor {
        public _disposers: Function[];
        public _dispose() {
            const __disposer = this._disposers;
            if (__disposer.length) {
                __disposer.splice(0).forEach((x) => x());
            }
        }
    }
}
export const Dispose = function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    descriptor.value = function () {
        EventDispatcher.dispose(this);
        const result = method.apply(this, arguments);
        return result;
    };
};
export const cocosEventDispatcher = () => {
    return function <T extends new (...args: any[]) => any>(constructor: T) {
        return class extends constructor {
            public onLoad() {
                if (super.onLoad && super.onLoad() === false) {
                    return;
                }
            }
            private dispose() {
                super.dispose && super.dispose();
            }
            public onDestroy() {
                this.dispose();
                EventDispatcher.dispose(this,()=>{
                    return !this.node.isValid
                })
                if (super.onDestroy) {
                    super.onDestroy();
                }
            }

        }
    }
}
export const EventDispatcher = new EventDispatch()
