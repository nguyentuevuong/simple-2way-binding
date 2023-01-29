export interface VueOptions {
    el: string;
    data?: Record<string, any>;
    methods?: Record<string, Function>;
}

export class Vue {
    el: HTMLElement | null;
    data: Record<string, any>;
    methods: Record<string, Function>;
    dep: Dep = new Dep();;

    constructor(options: VueOptions) {
        this.data = options.data ?? {};
        this.methods = options.methods ?? {};
        this.el = document.querySelector(options.el)
        this.dep = new Dep()

        this.Observer(this.data)

        if (this.el) {
            this.Compile(this.el)
        }
    }

    // Oservable
    Observer(obj: Record<string, any>) {
        if (!obj || typeof obj !== 'object') {
            return
        }

        for (const key in obj) {
            let value = obj[key];

            Object.defineProperty(obj, key, {
                get: () => {
                    return value
                },
                set: (newValue) => {
                    value = newValue

                    // TODO 通知订阅者
                    this.dep.notify()
                }
            })
        }
    }

    // 编译
    Compile(el: HTMLElement) {
        const nodes: Array<HTMLElement> = el.children as any;

        [...nodes].forEach((node) => {
            if (node.hasAttribute('v-bind:text')) {
                let attrVal: string | null = node.getAttribute('v-bind:text');

                if (attrVal) {

                    this.dep.addSub(new Watcher(node, this, attrVal, 'innerHTML'))
                }
            }

            if (node.hasAttribute('v-model')) {
                let attrVal: string | null = node.getAttribute('v-model')

                if (attrVal) {
                    this.dep.addSub(new Watcher(node, this, attrVal, 'value'))

                    node.addEventListener('input', ({ target }: any) => {
                        if (attrVal) {
                            this.data[attrVal] = target.value;
                        }
                    });
                }
            }

            if (node.hasAttribute('v-on:click')) {
                const func: string | null = node.getAttribute('v-on:click');

                if (func) {
                    node.addEventListener('click', () => {
                        this.methods[func].apply(this);
                    });
                }
            }

            if (node.hasChildNodes()) {
                this.Compile(node);
            }
        });
    }
}

// 订阅者
class Watcher {
    el: HTMLElement & Record<string, any>;
    vm: Vue;
    exp: string;
    attr: string;

    constructor(el: HTMLElement, vm: Vue, exp: string, attr: string) {
        this.el = el
        this.vm = vm
        this.exp = exp
        this.attr = attr

        this.update()
    }

    update() {
        if (this.el && this.attr) {
            this.el[this.attr] = this.vm.data[this.exp] // 更新视图
        }
    }
}

// 收集订阅者
class Dep {
    subs: Array<Watcher>;

    constructor() {
        this.subs = [];
    }

    addSub(sub: Watcher) {
        this.subs.push(sub);
    }

    notify() {
        this.subs.forEach((sub) => {
            sub.update()
        });
    }
}