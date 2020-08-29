
const RENDER_TO_DOM = Symbol('render to dom')

const deepmerge = (oldState, newState) => {
  for (let p in newState) {
    if (oldState[p] !== null && typeof oldState[p] === 'object') {
      deepmerge(oldState[p], newState[p])
    } else {
      oldState[p] = newState[p]
    }
  }
}

export class Component {
  constructor(type) {
    this.type = type
    this.props = Object.create(null)
    this.children = []
    this._root = null
    this._range = null
    this.state = {}
  }

  get vdom() {
    return this.render().vdom
  }

  setAttribute(name, value) {
    this.props[name] = value
  }

  appendChild(component) {
    this.children.push(component)
  }

  /**
   * @param {Range} range 
   */
  [RENDER_TO_DOM](range) {
    this._range = range
    this.render()[RENDER_TO_DOM](range)
  }

  setState(newState) {
    deepmerge(this.state, newState)
    this.rerender()
  }

  rerender() {
    this._range.deleteContents()
    this[RENDER_TO_DOM](this._range)
  }
}

class ElementWrapper extends Component {
  constructor(type) {
    super(type)
  }

  get vdom() {
    return this
  }

  /**
   * @param {Range} range 
   */
  [RENDER_TO_DOM](range) {
    // range.deleteContents()
    let root = document.createElement(this.type)

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

    for (let child of this.children) {
      let childRange = new Range()
      childRange.setStart(root, root.childNodes.length)
      childRange.setEnd(root, root.childNodes.length)
      child[RENDER_TO_DOM](childRange)
    }

    range.insertNode(root)
  }
}

class TextWrapper extends Component {
  constructor(content) {
    super(content)
    this.content = content
    this.root = document.createTextNode(content)
  }

  get vdom() {
    return this
  }

  /**
   * @param {Range} range 
   */
  [RENDER_TO_DOM](range) {
    // range.deleteContents()
    range.insertNode(this.root)
  }
}



export function createElement(type, attributes, ...children) {
  let e
  if (typeof type === 'string') {
    e = new ElementWrapper(type)
  } else {
    e = new type
  }

  for (let p in attributes) {
    e.setAttribute(p, attributes[p])
  }

  const insertChildren = (children) => {
    for (let child of children) {
      if (typeof child === 'string') {
        child = new TextWrapper(child)
      }
      if (child === null) continue
      if (Array.isArray(child)) {
        insertChildren(child)
      } else {
        e.appendChild(child)
      }
    }
  }
  insertChildren(children)
  return e
}

export function render(component, target) {
  let range = new Range()
  range.setStart(target, 0)
  range.setEnd(target, target.childNodes.length)
  range.deleteContents()
  component[RENDER_TO_DOM](range)
}