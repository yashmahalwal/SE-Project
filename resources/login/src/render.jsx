import React from "react";
import ReactDOM from "react-dom";

// To prevent default action
function prevent(event) {
    event.preventDefault();
}

class Peek extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            icon: "fa-eye"
        }

        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        this.setState((state, props) => {
            if (state.icon === "fa-eye")
                return ({ icon: "fa-eye-slash" });
            else
                return ({ icon: "fa-eye" });
        }, () => {
            this.props.handleClick();
        });
    }

    render() {
        return (
            <div className="icon is-small is-right" onClick={this.handleClick}>
                <i className={`fas peek ${this.state.icon} ${this.props.disabled ? " disabled" : ""}`}></i>
            </div>
        );
    }
}

class Input extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            type: this.props.type
        }

        this.renderPeek = this.renderPeek.bind(this);
        this.toggleType = this.toggleType.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.renderInput = this.renderInput.bind(this);
        this.focusOut = this.focusOut.bind(this);
    }

    handleChange(event) {
        let value = event.target.value;
        let callback1 = (condition = "", message = "default") => {
            this.props.handler(this.props.name + "Condition", condition, () => callback2(message));
        }
        let callback2 = (message) => {
            this.props.handler(this.props.name + "Message", message, null);
        }

        if (!value) {
            this.props.handler(this.props.name, value, callback1("danger", "empty"));
            return;
        }

        // If a RegEx is defined
        if (this.props.regex) {
            // If the value violates that RegEx
            if (!this.props.regex.test(value)) {
                callback1("danger", "regex");
            }
            else
                this.props.handler(this.props.name, value, callback1);
        } else
            this.props.handler(this.props.name, value, callback1);
    }

    renderPeek() {
        if (this.props.peek == true) {
            return (
                <Peek handleClick={this.toggleType} disabled={this.props.disabled} />
            );
        } else
            return null;
    }

    toggleType() {
        if (this.state.type === "text") {
            this.setState({ type: "password" });
        } else if (this.state.type === "password") {
            this.setState({ type: "text" });
        }
    }

    renderInput() {
        let handler = (this.props.type === "password" ? prevent : () => { })
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
                    <label className="label">{this.props.title}</label>
                </div>
                <div className="field-body">
                    <div className="field">
                        <div className={"control has-icons-left has-icons-right" + (this.props.loading ? " is-loading" : "")}>
                            {this.renderInput()}
                            <div className="icon is-small is-left">
                                <i className={`fas ${this.props.icon}`}></i>
                            </div>
                            {this.renderPeek()}
                        </div>
                        <p className={`help is-unselectable ${this.props.condition === "" ? "" : (" is-" + this.props.condition)}`}>
                            {this.props.messages[this.props.currentMessage]}&nbsp;
                        </p>
                    </div>
                </div>
            </div>

        );
    }
}

class Notification extends React.Component {
    constructor(props) {
        super(props);

    }

    render() {
        return (
            <div className={`notification-holder ${this.props.hidden ? "hidden" : ""}`}>
                <div className="overlay" onClick={this.props.close}></div>
                <div className="notification has-text-centered">
                    <button className="delete" onClick={this.props.close}></button>
                    {this.props.message}
                </div>
            </div>
        );
    }
}

class Panel extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            username: "",
            password: "",
            usernameCondition: "",
            usernameMessage: "default",
            passwordCondition: "",
            loading: false,
            notification: false,
            notificationMessage: "",
            passwordMessage: "default"
        }

        this.setValue = this.setValue.bind(this);
        this.submitForm = this.submitForm.bind(this);
        this.openNotification = this.openNotification.bind(this);
        this.closeNotification = this.closeNotification.bind(this);
    }

    openNotification(message = "") {
        this.setState({ notification: true, notificationMessage: message });
    }

    closeNotification() {
        this.setState({ notification: false });
    }

    setValue(field, value, callback) {
        this.setState({
            [field]: value
        }, () => {
            if (callback)
                callback();
        });
    }

    /* Very specific function for form submission */
    submitForm(event) {
        // If the username is empty or the username RegEx fails
        if (!this.state.username || !this.props.userRegex.test(this.state.username)) {
            this.openNotification("Invalid username. Please ensure that the username is filled correctly and submit again.");
            return;
        }

        // If the password is empty
        if (!this.state.password) {
            this.openNotification("The password cannot be left empty.");
            return;
        }

        // If the fields are valid
        this.setState({
            loading: true,
            usernameCondition: "",
            passwordCondition: "",
            usernameMessage: "default",
            passwordMessage: "default"
        }, () => { alert("Submitting the responses") });

    }

    /* Can be optimised */
    render() {
        return (
            <div>
                <Notification hidden={!this.state.notification} message={this.state.notificationMessage} close={this.closeNotification} />
                <div className="panel hover-effects">
                    <div className="holder">
                        <h1 className="title has-text-weight-light is-size-2-mobile is-size-1-tablet has-text-centered is-unselectable">Log In</h1>
                        <div>
                            <Input title="Username" name="username" loading={this.state.userLoading} placeholder="Enter your username" type="text"
                                condition={this.state.usernameCondition} disabled={this.state.loading} value={this.state.username}
                                peek={false} icon="fa-user" messages={{ default: "", error: "There was an error", regex: "Invalid Username", empty: "Username cannot be empty" }} currentMessage={this.state.usernameMessage}
                                handler={this.setValue} regex={this.props.userRegex} />
                            <Input title="Password" name="password" placeholder="Enter your password" type="password"
                                condition={this.state.passwordCondition} disabled={this.state.loading}
                                value={this.state.password} peek={true} icon="fa-lock" messages={{ default: "", error: "There was an error", empty: "Password cannot be empty" }} currentMessage={this.state.passwordMessage} handler={this.setValue} />
                        </div>
                        <div className="level">
                            <div className="level-left">
                                <div className="level-item">
                                    <a href={`${this.state.loading ? "#" : "path.html"}`} className="help">New user?&nbsp;&nbsp;Register here</a>
                                </div>
                            </div>
                            <div className="level-right">
                                <div className="level-item">
                                    <a href={`${this.state.loading ? "#" : "path.html"}`} className="help">Continue without logging in</a>
                                </div>
                            </div>
                        </div>
                        <div className="buttons is-centered">
                            <a className={`button is-link${this.state.loading ? " is-loading" : ""}`} onClick={this.submitForm} >Submit</a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

class App extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="app">
                <Panel userRegex={this.props.userRegex} />
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
    ReactDOM.render(<App userRegex={/^\w+$/} />, node);

}