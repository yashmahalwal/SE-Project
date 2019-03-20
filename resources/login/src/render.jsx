import React from "react";
import ReactDOM from "react-dom";

window.onload = () => {
    // Step 1, make the node root in the DOM
    let node = document.createElement("main");
    node.setAttribute("id", "root");
    document.querySelector("body").append(node);

    // Use react
    ReactDOM.render(<h1>hi</h1>, node);
}