import React from "react";
import ReactDOM from "react-dom";


// To prevent default action
function prevent(event) {
    event.preventDefault();
}

function ajax(url, callbackSuccess, callbackError, method = "GET") {
    let xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.send();

    xhr.onreadystatechange = () => {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            if (xhr.status != 404) {
                let json = JSON.parse(xhr.responseText);
                callbackSuccess(json);
            } else {
                callbackError();
            }
        }
    }
    xhr.onerror = callbackError;
}
// The eye icon to peek visibility of the passoword
class Peek extends React.Component {
    constructor(props) {
        super(props);
        // Maintain the icon as the state, default is eye
        this.state = {
            icon: "fa-eye"
        }

        // The function to handle click event
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        this.setState((state, props) => {
            // Toggle the icon b/w eye and eye slash
            if (state.icon === "fa-eye")
                return ({ icon: "fa-eye-slash" });
            else
                return ({ icon: "fa-eye" });
        }, () => {
            // Then, do the designated operations, given by props.handleClick
            this.props.handleClick();
        });
    }

    render() {
        return (
            // Icon holder and the icon
            <div className="icon is-small is-right" onClick={this.handleClick}>
                {/* Setting the icon with the state. Also, disable the icon if the props say so */}
                <i className={`fas peek ${this.state.icon} ${this.props.disabled ? " disabled" : ""}`}></i>
            </div>
        );
    }
}

// The input component
class Input extends React.Component {
    constructor(props) {
        super(props);

        // The type is maintained in the state so as to 
        // Allow toggle for the password field
        this.state = {
            type: this.props.type
        }

        // If peek icon is to be rendered
        this.renderPeek = this.renderPeek.bind(this);
        // Function to toggle between the text and password types
        this.toggleType = this.toggleType.bind(this);
        // Function to handle change
        this.handleChange = this.handleChange.bind(this);
        // Function to render the required input type
        this.renderInput = this.renderInput.bind(this);
        // When an input loses focus
        this.focusOut = this.focusOut.bind(this);
    }

    handleChange(event) {
        // Get the new value
        let value = event.target.value;
        // Set the state of component: appropriate condition and message
        let callback1 = (condition = "", message = "default") => {
            this.props.handler(this.props.name + "Condition", condition, () => callback2(message));
        }
        // Set the message for the component
        let callback2 = (message) => {
            this.props.handler(this.props.name + "Message", message, null);
        }

        // If there is no value, set the state to daner with empty error
        if (!value) {
            this.props.handler(this.props.name, value, callback1("danger", "empty"));
            return;
        }

        // If a RegEx is defined
        if (this.props.regex) {
            // If the value violates that RegEx
            if (!this.props.regex.test(value)) {
                // Do not update the value of the field.
                // But show the regex error
                callback1("danger", "regex");
            }
            else
                // Simply set the value and set the state of component to default
                this.props.handler(this.props.name, value, callback1);
        } else
            // Simply set the value and set the state of component to default
            this.props.handler(this.props.name, value, callback1);
    }

    renderPeek() {
        // If the props.peek is true, render the peek. Else, render nothing
        if (this.props.peek == true) {
            return (
                <Peek handleClick={this.toggleType} disabled={this.props.disabled} />
            );
        } else
            return null;
    }

    toggleType() {
        // Toggle the state between the type text and password
        if (this.state.type === "text") {
            this.setState({ type: "password" });
        } else if (this.state.type === "password") {
            this.setState({ type: "text" });
        }
    }

    renderInput() {
        // If the type is password, prevent cut, copy, paste
        let handler = (this.props.type === "password" ? prevent : () => { })
        // If the input is disabled, add the attribute
        // onBlur, when the component loses focus, set the state of 
        // Input element again. That is to remove any invalid errors that might still be showing
        if (this.props.disabled)
            return (
                <input disabled onBlur={this.focusOut} onCopy={handler} className={`input${this.props.condition === "" ? "" : (" is-" + this.props.condition)}`} type={this.state.type}
                    placeholder={this.props.placeholder} name={this.props.name} value={this.props.value} onChange={this.handleChange} />
            );
        else
            return (
                <input onBlur={this.focusOut} onCut={handler} onCopy={handler} onPaste={handler} className={`input${this.props.condition === "" ? "" : (" is-" + this.props.condition)}`} type={this.state.type}
                    placeholder={this.props.placeholder} name={this.props.name} value={this.props.value} onChange={this.handleChange} />
            );
    }

    focusOut(event) {
        // The field is empty, do nothing
        if (!this.props.value)
            return;
        let callback1 = (condition = "", message = "default") => {
            this.props.handler(this.props.name + "Condition", condition, () => callback2(message));
        }
        let callback2 = (message) => {
            this.props.handler(this.props.name + "Message", message, null);
        }
        // If a regex is given
        if (this.props.regex)
            // If the value of the field passes the regex test
            if (this.props.regex.test(this.props.value))
                this.props.handler(this.props.name, this.props.value, callback1);

    }

    render() {
        return (
            <div className="field is-horizontal">
                <div className="field-label is-normal">
                    {/* Title of the field */}
                    <label className="label">{this.props.title}</label>
                </div>
                <div className="field-body">
                    <div className="field">
                        {/* The input element itself: is set to loading is props say so */}
                        <div className={"control has-icons-left has-icons-right" + (this.props.loading ? " is-loading" : "")}>
                            {/* Render input as needed */}
                            {this.renderInput()}
                            {/* The icon on the left is as said by props */}
                            <div className="icon is-small is-left">
                                <i className={`fas ${this.props.icon}`}></i>
                            </div>
                            {/* Render peek as needed */}
                            {this.renderPeek()}
                        </div>
                        {/* The message with input */}
                        <p className={`help is-unselectable ${this.props.condition === "" ? "" : (" is-" + this.props.condition)}`}>
                            {this.props.messages[this.props.currentMessage]}&nbsp;
                        </p>
                    </div>
                </div>
            </div>

        );
    }
}

// The notification component
class Notification extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            // The holder for notification. Has .hidden class if the props say so
            <div className={`notification-holder ${this.props.hidden ? "hidden" : ""}`}>
                {/* props.close is the function to close the notification */}
                <div className="overlay" onClick={this.props.close}></div>
                <div className="notification has-text-centered">
                    <button className="delete" onClick={this.props.close}></button>
                    {/* The notification content */}
                    {this.props.message}
                </div>
            </div>
        );
    }
}

class MenuInfo extends React.Component {
    render() {
        return (<div className="info has-text-centered">
            <h1 className="has-text-weight-bold is-size-3">{this.props.title ? this.props.title : "Welcome"}</h1>
            <h3 className="is-size-5">{this.props.subtitle ? this.props.subtitle : <span><a href="">Sign In</a> to do more</span>}</h3>
        </div>);
    }
}

class MenuItem extends React.Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this)
    }

    handleClick() {
        this.props.activateFunction(this.props.value);
    }

    render() {
        return (
            <li>
                <a className={this.props.active ? "is-active" : ""} onClick={this.handleClick}>
                    <span className="icon"><i className={this.props.icon ? `fas fa-${this.props.icon}` : ""}></i></span>&nbsp;&nbsp;{this.props.title}</a>
            </li>
        );
    }
}

class Menu extends React.Component {
    constructor(props) {
        super(props);
        this.renderItems = this.renderItems.bind(this);
    }

    renderItems() {
        return (
            this.props.itemList.map(item => (
                <MenuItem title={item.title} icon={item.icon} active={item.value == this.props.active ? true : false} key={item.value} value={item.value} activateFunction={this.props.activateFunction} />
            ))
        );
    }

    render() {
        return (
            <nav className="menu">
                <MenuInfo title={this.props.title} subtitle={this.props.subtitle} />
                <div>
                    <h5 className="menu-label">Dashboard</h5>
                    <ul className="menu-list">
                        {this.renderItems()}
                    </ul>
                </div>
            </nav>
        );
    }
}

class Preloader extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className={`preloader-overlay ${this.props.active ? "is-active" : ""}`}>
                <div className="spinner">
                    <div className="double-bounce1"></div>
                    <div className="double-bounce2"></div>
                </div>
            </div>
        );
    }

}

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            active: this.props.active,
            loading: false,
            notification: false,
            notificationMessage: "",
            trending: [],
        }
        this.setActive = this.setActive.bind(this);
        this.renderContent = this.renderContent.bind(this);
        this.closeNotification = this.closeNotification.bind(this);
    }

    /* Specific function */
    setActive(value) {
        if (!value)
            return;

        let callback = (value, data) => {
            console.log(value, data);
            switch (value) {
                case "trending":
                    this.setState({ trending: data.articles });
                    break;
            }
        }

        // First, set the active value
        this.setState({
            active: value
        }, () => {
            // Now, enable loading
            if (value != "search")
                this.setState({ loading: true }, () => {
                    // Get data from server
                    ajax(`http://127.0.0.1:3000/article/${value}`, (data) => {
                        this.setState({ loading: false }, () => {
                            callback(value, data);
                        });
                    }, () => {
                        this.setState({ loading: false, notification: true, notificationMessage: "There was an error processing your request" });
                    });
                });
        });
    }

    closeNotification() {
        this.setState({ notification: false });
    }

    componentDidMount() {
        this.setActive("trending");
    }

    /* Specific function */
    renderContent() {
        switch (this.state.active) {
            case "trending":
                return (
                    <section>
                        <h1 className="title has-text-centered">Trending Articles</h1>
                        {this.state.trending.map(item => (
                            <article className="media box" key={item.id}>
                                <figure className="media-left">
                                    <p className="image is-64x64">
                                        <img src="https://bulma.io/images/placeholders/128x128.png" />
                                    </p>
                                </figure>
                                <div className="media-content">
                                    <div className="content">
                                        <p>
                                            <strong>{item.title}</strong> <small>@johnsmith</small> <small>31m</small>
                                            <br />
                                            {item.content}
                                        </p>
                                    </div>
                                    <nav className="level is-mobile">
                                        <div className="level-left">
                                            <a className="level-item">
                                                <span className="icon is-small"><i className="fas fa-reply"></i></span>
                                            </a>
                                            <a className="level-item">
                                                <span className="icon is-small"><i className="fas fa-retweet"></i></span>
                                            </a>
                                            <a className="level-item">
                                                <span className="icon is-small"><i className="fas fa-heart"></i></span>
                                            </a>
                                        </div>
                                    </nav>
                                </div>
                                <div className="media-right">
                                    <button className="delete"></button>
                                </div>
                            </article>
                        ))}
                    </section>
                );
            case "search":
                return (<h1 className="title">Search</h1>);
        }
    }


    render() {
        return (
            <div className="app">
                <Notification message={this.state.notificationMessage} hidden={!this.state.notification} close={this.closeNotification} />
                <Preloader active={this.state.loading} />
                <Menu itemList={[{ title: "Trending", icon: "chart-line", value: "trending" }, { title: "Search", icon: "search", value: "search" }]}
                    active={this.state.active} activateFunction={this.setActive}
                />
                <div className="my-content">
                    {this.renderContent()}
                </div>
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
    // Render the app. The Regular Epxression for the username field is given
    ReactDOM.render(<App active="trending" />, node);

}