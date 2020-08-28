import { createElement, render, Component } from 'react'

class MyComponent extends Component {
  constructor() {
    super()
    this.state = {
      a: 1,
    }
  }
  render() {
    return (
      <div>
        <h1>My Component</h1>
        <span>{ this.state.a.toString() }</span>
        { this.children }
      </div>
    )
  }
}

console.log(<MyComponent id="a" class="c">
<div>abc</div>
<div></div>
<div></div>
</MyComponent>)
render(<MyComponent id="a" class="c">
  <div>abc</div>
  <div></div>
  <div></div>
</MyComponent>, document.body)