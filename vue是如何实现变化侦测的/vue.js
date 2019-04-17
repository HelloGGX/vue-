let data= {price:5,quality:10}
let total =0
var setTotal = function (){
    total = data.price * data.quality
}

class Dep { 
    constructor(){
        this.subscribers= [] 
    }
    addDep(target){
        this.subscribers.push(target)
    }
    depend(){
        if (Dep.target && !this.subscribers.includes(Dep.target)){
            this.addDep(Dep.target)
        }
    }
    notify(){
        const arr = this.subscribers.slice()
        arr.forEach(t=> t())
    }
}
Dep.target = null
const dep = new Dep()
let value = data.price

Object.defineProperty(data, 'price',{
    configurable:true,
    enumerable:true,
    get(){
        dep.depend()
        return value
    },
    set(newVal){
        value = newVal
        dep.notify()
    }
})

Dep.target = setTotal
setTotal()
Dep.target  = null

console.log(total)
data.price = 10

console.log(total)
// function defineReactive(data,key ,val){
//     const dep = new Dep()
//     Object.defineProperty(data,key,{
//         configurable: true,
//         enumerable: true,
//         get() {
//             dep.depend()
//             return par
//         },
//         set(newVal) {
//             par = newVal
//             dep.notify()
//         }
//     })
// }
// Object.keys(data).forEach(key=>{
//     const dep = new Dep()
//     let par = data[key]
//     Object.defineProperty(data,key,{
//         configurable:true,
//         enumerable:true,
//         get(){
//             dep.depend()
//             return par
//         },
//         set(newVal){
//             par = newVal
//             dep.notify()
//         }
//     })
// })
// Dep.target = null

// function watch(fun){
//     Dep.target = fun
//     fun()
//     Dep.target = null
// }

// watch(()=>{
//     total =  data.price * data.quality
// })
// console.log(total)
// data.price = 10
// console.log(total)