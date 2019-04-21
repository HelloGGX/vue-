let originArrayMethods = [
    'push',
    'pop',
    'shift',
    'unshift',
    'splice',
    'sort',
    'reverse'
]

const arrayProto = Array.prototype
const arrayMethods = Object.create(arrayProto)
const arrayKeys = Object.getOwnPropertyNames(arrayMethods)

function def(obj, key, val, enumerable) {
    Object.defineProperty(obj, key, {
        value: val,
        enumerable: !!enumerable,
        writable: true,
        configurable: true
    });
}

originArrayMethods.forEach(method => { 
    def(arrayMethods, method, function mutator(...args) {
        const original = arrayProto[method]
        const result = original.apply(this, args)
        const ob = this._ob_
        let inserted
        switch (method) {
            case 'push':
            case 'unshift':
                inserted = args
                break;
            case 'splice':
                inserted = args.slice(2)
                break;
        }
        if (inserted) { 
            ob.observeArray(inserted)
        }
        ob.dep.notify()
        return result
        
    },true)
})
const hasProto = '_proto_' in {}
function protoAugment(target,src) { 
    target._proto_ = src
}
function copyAugment(target,src,keys) { 
    keys.forEach(key => { 
        def(target,key,src[key])
    })
}
function isObject(value) { 
    return typeof value === 'object'
}
function hasOwn(obj,key) { 
    return Object.prototype.hasOwnProperty.call(obj,key)
}
const bailRE = /[^\w.$]/
function parsePath(path) {
    if (bailRE.test(path)) { 
        return
    }
    const segments = path.split('.')
    return function (obj) { 
        for (let i = 0; i < segments.length;i++) { 
            if (!obj) { 
                return
            }
            obj = obj[segments[i]]
        }
        return obj
    }
}
let uid = 0;
class Dep {
    constructor() {
        this.id = uid++
        this.subs = [] //订阅者数组
    }
    addSub(sub) {
        this.subs.push(sub);
    }
    depend() {
        if (Dep.target) {
            Dep.target.addDep(this)
        }
    }
    notify() {
        const subs = this.subs.slice()
        subs.forEach(sub => sub.update())
    }
}
Dep.target = null;
function observe(value) { 
    if (!isObject(value)) { 
        return
    }
    let ob
    if (hasOwn(value, '_ob_') && value._ob_ instanceof Observer) {
        ob = this._ob_
    } else { 
        ob = new Observer(value)
    }
    return ob
}
class Observer { //观察者
    constructor(value) {
        this.value = value
        this.dep = new Dep() //这里存放数组的依赖
        def(value,'_ob_',this)
        if (Array.isArray(value)) {
            if (hasProto) { //把拦截器身上的方法设置到需要响应的数组身上来拦截Array.prototype上的原生方法
                protoAugment(value, arrayMethods)
            } else {
                copyAugment(value, arrayMethods, arrayKeys)
            }
            this.observeArray(value)
        } else {
            this.walk(value)
        }
    }
    observeArray(value) { 
        value.forEach(val => { 
            observe(val)
        })
    }
    walk(obj) {
        Object.keys(obj).forEach(key => {
            defineReactive(obj, key, obj[key])
        })
    }
}
function defineReactive(data, key, val) {
    let childOb = observe(val)
    const dep = new Dep()
    Object.defineProperty(data, key, {
        configurable: true,
        enumerable: true,
        get() {
            dep.depend()
            if (childOb) { 
                childOb.dep.depend()
            }
            return val
        },
        set(newVal) {
            if (val === newVal) {
                return
            }
            val = newVal
            dep.notify()
        }
    })
}
class Watcher { //中介
    constructor(vm, expOrFn, cb) {//vm只是vue的实例
        this.vm = vm
        this.deps = []
        this.depIds = new Set()
        if (typeof expOrFn === 'function') {
            this.getter = expOrFn; //当expOrFn是个函数
        } else { 
            this.getter = parsePath(expOrFn)//当expOrFn是个属性访问路径（如：a.b.c）
        }
        this.cb = cb
        this.value = this.get()
    }
    get() {
        Dep.target = this
        let value = this.getter.call(this.vm, this.vm)
        Dep.target = undefined
        return value
    }
    addDep(dep) { 
        const id = dep.id
        if (!this.depIds.has(id)) { 
            this.depIds.add(id)
            this.deps.push(dep)
            dep.addSub(this)
        }
    }
    update() {
        const oldVal = this.value
        this.value = this.get()
        this.cb.call(this.vm, this.value, oldVal)
    }
}


let data = { price: {data:7}, quality: [10] }
let total = 0
const updateComponent = () => {
    total = data.price.data * data.quality[0]
    return total
}

new Observer(data)
new Watcher(window, updateComponent, (newVal, oldVal) => {
    console.log(newVal)
    console.log(oldVal)
});

console.log(total)
data.price.data = 12
console.log(total)
// data.quality.splice(0,1,100)
// console.log(total)
