
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

class ElementWrapper {
  constructor(type) {
    this.root = document.createElement(type)
  }

  /**
   * @param {string} name 
   * @param {string} value 
   */
  setAttribute(name, value) {
    if (name.match(/^on([\s\S]+)$/)) {
      this.root.addEventListener(RegExp.$1.toLowerCase(), value)
    } else {
      if (name === 'className') {
        name = 'class'
      }
      this.root.setAttribute(name, value)
    }
  }

  appendChild(component) {
    let range = new Range()
    range.setStart(this.root, this.root.childNodes.length)
    range.setEnd(this.root, this.root.childNodes.length)
    component[RENDER_TO_DOM](range)
  }

  /**
   * @param {Range} range 
   */
  [RENDER_TO_DOM](range) {
    // range.deleteContents()
    range.insertNode(this.root)
  }
}

class TextWrapper {
  constructor(content) {
    this.root = document.createTextNode(content)
  }

  /**
   * @param {Range} range 
   */
  [RENDER_TO_DOM](range) {
    // range.deleteContents()
    range.insertNode(this.root)
  }
}

export class Component {
  constructor() {
    this.props = Object.create(null)
    this.children = []
    this._root = null
    this._range = null
    this.state = {}
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