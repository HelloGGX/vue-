let data = { price: { old: 10, new: 20 }, quality: 10 }
let total = 0
let totalFn = () => {
    total = data.price.new * data.quality
    return total
}
const arrayProto = Array.prototype;
const arrayMethods = Object.create(arrayProto);
const hasProto = '_proto_' in {};
const arrayKeys = Object.getOwnPropertyNames(arrayMethods);//返回在给定对象上找到的自身属性对应的字符串数组。
['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'].forEach(function (method) {
    const original = arrayProto[method]
    Object.defineProperty(arrayMethods, method, {
        value: function mutator(...args) { //当使用push方法时，实际上调用的是mutator函数，相当于Array.prototype.push.apply(this,args)
            return original.apply(this, args)
        },
        enumerable: true,
        writable: true,
        configurable: true
    })
});
class Dep {
    constructor() {
        this.subscriber = []
    }
    addDep(target) {
        this.subscriber.push(target)
    }
    depend() {
        if (Dep.target && !this.subscriber.includes(Dep.target)) {
            this.addDep(Dep.target)
        }
    }
    notify() {
        const subs = this.subscriber.slice()
        subs.forEach(sub => sub.update())
    }
}
Dep.target = null
function defineReactive(data, key, val) {
    let childOb = observer(val)
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
function protoAugment(target,src,keys) { 
    target._proto_ = src
}
function copyAugment(target, src, keys) { 
    keys.forEach(key => { 
        def(target, key, src[key])
    })
}
class Observer {
    constructor(data) {
        this.data = data
        this.dep = new Dep()
        if (Array.isArray(data)) {
            const augment = hasProto
                ? protoAugment
                : copyAugment
            augment(data,arrayMethods,arrayKeys)
            // data._proto_ = arrayMethods //关于data._proto_的作用①__proto__和constructor属性是对象所独有的；② prototype属性是函数所独有的。
        } else {
            this.walk(this.data)
         }
    }
    walk(data) {
        Object.keys(data).forEach(key => {
            defineReactive(data, key, data[key])
        })
    }
}
class Watcher {
    constructor(vm, expOrFn, cb) {
        this.vm = vm
        if (typeof expOrFn === 'function') {
            this.getter = expOrFn
        }
        this.value = this.get()
        this.cb = cb
    }
    get() {
        Dep.target = this
        let val = this.getter.call(this.vm, this.vm)
        Dep.target = null
        return val
    }
    update() {
        const val = this.value
        this.value = this.get()
        this.cb.call(this.vm, this.value, val)
    }
}
new Observer(data)
new Watcher(window, totalFn, (newVal, oldVal) => {
    console.log('监听到了数据的变动')
})


console.log(total)
data.price.new = 10
console.log(total)






