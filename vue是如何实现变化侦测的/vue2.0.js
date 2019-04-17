
class Dep{
    constructor(){
       this.subscriber=[] //订阅者数组
       
    }
    depend(){
        if (Dep.target && !this.subscriber.includes(Dep.target)){
            this.subscriber.push(Dep.target)
        }
    }
    notify(){
        const subs = this.subscriber.slice()
        subs.forEach(sub => sub.update())
    }
}
Dep.target = null;
class Observer { //观察者
    constructor(value) {
        this.value = value
        if(!Array.isArray(value)){
            this.walk(value)
        }
    }
    walk(obj) {
        Object.keys(obj).forEach(key=>{
            defineReactive(obj,key,obj[key])
        })
    }
}
function defineReactive(data,key,val){
    if(typeof val === 'object'){
        new Observer(val)
    }
    const dep = new Dep()
    Object.defineProperty(data,key,{
        configurable:true,
        enumerable:true,
        get(){
            dep.depend()
            return val
        },
        set(newVal){
            if(val===newVal){
                return
            }
            val = newVal
            dep.notify()
        }
    })
}

class Watcher{ //中介
    constructor(vm,expOrFn,cb){//vm只是vue的实例
        this.vm = vm
        if (typeof expOrFn === 'function') {
            this.getter = expOrFn;
        }
        this.cb = cb
        this.value = this.get()
    }
    get(){
        Dep.target = this
        let value = this.getter.call(this.vm,this.vm)
        Dep.target = undefined
        return value
    }
    update(){
        const oldVal = this.value
        this.value = this.get()
        this.cb.call(this.vm, this.value, oldVal)
    }
}


let data = { price: 5, quality: 10 }
let total = 0
const updateComponent = () => { 
    total = data.price * data.quality 
    return total
}

new Observer(data)
new Watcher(window, updateComponent,  (newVal,oldVal)=>{
    console.log(newVal)
    console.log(oldVal)
});

console.log(total)
data.price = 12
console.log(total)
data.quality = 13
console.log(total)
