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

        <p>{ this.state.a.toString() }</p>
        <button onclick={() => { this.state.a ++; this.rerender() }}>ADD</button>
      </div>
    )
  }
}


render(<MyComponent id="a" class="c">
  <div>abc</div>
  <div></div>
  <div></div>
</MyComponent>, document.body)