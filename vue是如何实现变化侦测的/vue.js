class Dep {
    constructor() {
        this.subscribers = []
    }
    depend() {
        if (target && !this.subscribers.includes(target)) {
            this.subscribers.push(target)
        }
    }
    notify() {
        this.subscribers.forEach(sub => sub())
    }
}
let data = { price: 5, quantity: 2 }
let total = 0
let target = null //匿名函数

Object.keys(data).forEach(key => {
    let internalValue = data[key]
    const dep = new Dep()
    Object.defineProperty(data, key, {
        get() { //访问属性的时候，记住属性所在匿名函数
            console.log(`${key}被访问了`)
            dep.depend()
            return internalValue
        },
        set(newVal) { //更新属性的时候，运行保存的匿名函数
            console.log(`我被改变了,改变后${newVal}`)
            internalValue = newVal
            dep.notify()
        }
    })
})

// record = () => { storage.push(target) } //记录函数的方法
// replay = () => { storage.forEach(run => run()) }//运行函数的方法
function watcher(myFunc) { 
    target = myFunc
    target()
    target = null
}
watcher(() => { 
    total = data.price * data.quantity
})
watcher(() => { 
    salePrice = data.price * 0.9
})
console.log(`total is ${total}`)
console.log(`total is ${salePrice}`)

data.price = 20
console.log(`total is ${total}`)
console.log(`total is ${salePrice}`)

data.quantity = 3
console.log(`total is ${total}`)
console.log(`total is ${salePrice}`)





data.price
data.price = 20





