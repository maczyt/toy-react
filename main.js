import { createElement, render, Component } from 'react'

class MyComponent extends Component {
  render() {
    return (
      <div>
        My Component
        { this.children }
      </div>
    )
  }
}

render(<MyComponent id="a" class="c">
  <div>abc</div>
  <div></div>
  <div></div>
</MyComponent>, document.body)