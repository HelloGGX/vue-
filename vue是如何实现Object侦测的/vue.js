let data = { price: {old:10,new:20}, quality: 10 }
let total = 0
let totalFn = () => {
    total = data.price.new * data.quality
    return total
}
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
        subs.forEach(sub=>sub.update())
    }
}
Dep.target = null
function defineReactive(data, key, val) {
    if (typeof val === 'object') { 
        new Observer(val)
    }
    const dep = new Dep()
    Object.defineProperty(data, key, {
        configurable: true,
        enumerable: true,
        get() {
          dep.depend()
          return val    
        },
        set(newVal) {
            if (val===newVal) { 
                return
            }
            val = newVal
            dep.notify()
        }
    })
}
class Observer { 
    constructor(data) { 
        this.data = data
        if (!Array.isArray(data)) { 
            this.walk(this.data)
        }
    }
    walk(data) { 
        Object.keys(data).forEach(key => { 
            defineReactive(data,key,data[key])
        })
    }
}
class Watcher { 
    constructor(vm,expOrFn,cb) { 
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
        Dep.target = undefined
        return val
    }
    update() {
        const val = this.value
        this.value = this.get()
        this.cb.call(this.vm, this.value, val)
    }
}
new Observer(data)
debugger
new Watcher(window, totalFn, (newVal,oldVal) => { 
    console.log('监听到了数据的变动')
})

console.log(total)
data.price.new = 10
console.log(total)


