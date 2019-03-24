import React from "react";
import ReactDOM from "react-dom";

class Panel extends React.Component {
    render() {
        return (
            <div className="panel hover-effects">
                <h1 className="title has-text-weight-light is-size-2-mobile is-size-1-tablet has-text-centered is-unselectable">Log In</h1>
            </div>
        );
    }
}

class App extends React.Component {
    render() {
        return (
            <div className="app">
                <Panel />
            </div>
        );
    }
}

window.onload = () => {
    // Step 1, make the node root in the DOM
    let node = document.createElement("main");
    node.setAttribute("id", "root");
    document.querySelector("body").prepend(node);

    // Use react
    ReactDOM.render(<App />, node);
}