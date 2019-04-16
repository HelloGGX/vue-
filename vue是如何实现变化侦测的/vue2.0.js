class Dep { 
    constructor(){ 
        this.subscriber = []//订阅者数组
    }
    depend() { 
        if (target && !this.subscriber.includes(target)) { 
            this.subscriber.push(target)
        }
    }
    notify() { 
        let subs = this.subscriber.slice()
        subs.forEach(sub => sub())
    }
}
let target = null

let watcher = (fun) => { 
    target = fun
    target()
    target = null
}
let data = { price: 5, quality: 10 }
let total = 0
Object.keys(data).forEach(key => {
    let val = data[key]
    const dep = new Dep()
    Object.defineProperty(data, key, {
        get() {
            dep.depend()
            return val
        },
        set(newVal) {
            val = newVal
            dep.notify()
        }
    })
})


watcher(() => { 
    total = data.price * data.quality
})

console.log(total)
data.price = 10

console.log(total)
