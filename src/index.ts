const RENDER_TO_DOM = Symbol('RENDER_TO_DOM')

export function createElement(type, props, ...children) {
  // 1. create
  let e
  if (typeof type === 'string') {
    e = new ElementWrapper(type)
  } else {
    // 组件
    e = new type
  }

  // 2. set props
  for (let p in props) {
    e.setAttribute(p, props[p])
  }

  // 3. append child
  children = children['flat']()
  for (let child of children) {
    if (child === null) continue
    if (typeof child !== 'object') {
      e.children.push(new TextWrapper(child))
    } else {
      e.children.push(child)
    }
  }

  return e
}


export function render(component: Component, parentElement: Node) {
  // 清除 parentElement 的子内容
  const range = new Range
  range.selectNodeContents(parentElement)
  component[RENDER_TO_DOM](range)
}

export class Component {
  _range: Range
  _vdom: Component
  _vchildren: Array<Component>
  state: object
  type: string
  props: object
  children: Array<Component>
  constructor(type?) {
    this.type = type
    this._range = null
    this._vdom = null
    this.props = Object.create(null)
    this.children = []
  }
  get vdom(): Component {
    return this.render().vdom
  }
  setAttribute(name, value) {
    this.props[name] = value
  }
  appendChild(child) {
    this.children.push(child)
  }
  [RENDER_TO_DOM](range: Range) {
    this._range = range
    this._vdom = this.vdom
    this._vdom[RENDER_TO_DOM](range)
  }
  private update() {
    const isSameNode = (oldNode: Component, newNode: Component) => {
      if (oldNode.type !== newNode.type) return false
      for (let name in newNode.props) {
        if (newNode.props[name] !== oldNode.props[name]) {
          return false
        }
      }
      if (Object.keys(oldNode.props).length !== Object.keys(newNode.props).length) return false
      if (newNode.type === '#text') {
        if (newNode['content'] !== oldNode['content']) return false
      }
      return true
    }
    const update = (oldNode: Component, newNode: Component) => {
      if (!isSameNode(oldNode, newNode)) {
        if (!oldNode._range) debugger
        newNode[RENDER_TO_DOM](oldNode._range)
        return
      }
      newNode._range = oldNode._range
      const [newChildren, oldChildren] = [newNode._vchildren, oldNode._vchildren]
      if (!newChildren || !newChildren.length) return
      let tailRange = oldChildren[oldChildren.length - 1]._range
      for (let i = 0; i < newChildren.length; i ++) {
        let newChild = newChildren[i]
        let oldChild = oldChildren[i]
        if (i < oldChildren.length) {
          update(oldChild, newChild)
        } else {
          let range = new Range()
          range.setStart(tailRange.endContainer, tailRange.endOffset)
          range.setEnd(tailRange.endContainer, tailRange.endOffset)
          newChild[RENDER_TO_DOM](range)
          tailRange = range
        }
      }
    }
    let vdom = this.vdom
    update(this._vdom, vdom)
    this._vdom = vdom
  }
  render(): Component {
    return null
  }
  setState(newState) {
    deepmerge(this.state, newState)
    // trigger update
    this.update()
  }
}

/**
 * 元素节点包裹类
 */
class ElementWrapper extends Component {
  constructor(type) {
    super(type)
  }
  get vdom() {
    this._vchildren = this.children.map(child => child.vdom)
    return this
  }

  [RENDER_TO_DOM](range: Range): void {
    this._range = range
    // 组件所处的 range 范围
    const root = document.createElement(this.type)

    for (let name in this.props) {
      let value = this.props[name]
      if (name.match(/^on([\s\S]+)$/)) {
        root.addEventListener(RegExp.$1.toLowerCase(), value)
      } else {
        if (name === 'className') {
          name = 'class'
        }
        root.setAttribute(name, value)
      }
    }
    if (!this._vchildren) {
      this._vchildren = this.children.map(child => child.vdom)
    }
    for (let child of this._vchildren) {
      const childRange = new Range()
      childRange.setStart(root, root.childNodes.length)
      childRange.setEnd(root, root.childNodes.length)
      child[RENDER_TO_DOM](childRange)
    }
    replaceContents(range, root)
  } 
}

/**
 * 文本节点包裹类
 */
class TextWrapper extends Component {
  content: string | number
  constructor(content) {
    super(content)
    this.type = '#text'
    this.content = content
  }
  get vdom() {
    return this
  }

  [RENDER_TO_DOM](range: Range): void {
    this._range = range
    const node = document.createTextNode(this.content.toString())
    replaceContents(range, node)
  } 
}

/**
 * 用 node 节点替换 range 范围内的节点
 * @param range 
 * @param node 
 */
function replaceContents(range: Range, node: Node) {
  // 1. 插入到头部
  range.insertNode(node)
  // 2. 设置 start offset
  range.setStartAfter(node)
  // 3. 清除其它内容
  range.deleteContents()
  // 4. 设置回正常的 offset
  range.setStartBefore(node)
  range.setEndAfter(node)
}

/**
 * 深度 merge
 * @param oldState 
 * @param newState 
 */
function deepmerge(oldState, newState): void {
  for (let p in newState) {
    if (
      typeof oldState[p] === 'object' 
      && oldState[p] !== null
    ) {
      deepmerge(oldState[p], newState[p])
    } else {
      oldState[p] = newState[p]
    }
  }
}