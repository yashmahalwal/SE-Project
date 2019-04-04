import React from "react";
import ReactDOM from "react-dom";

// To prevent default action
function prevent(event) {
    event.preventDefault();
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

// The panel that hold all the components
// The core part of the app
class Panel extends React.Component {
    constructor(props) {
        super(props);

        // The state variables
        this.state = {
            // Username stored
            username: "",
            // Password stored
            password: "",
            // Condition: "danger", "", "success": state of the input component
            // Message: the message to be displayed with the input component
            usernameCondition: "",
            usernameMessage: "default",
            passwordCondition: "",
            passwordMessage: "default",
            // If the app is loading
            loading: false,
            // If the notification is to be shown
            notification: false,
            // The message for the notification
            notificationMessage: ""
        }

        // To change the state and then perform necessary actions via a callback 
        this.setValue = this.setValue.bind(this);
        // A very specific function to submit the form
        this.submitForm = this.submitForm.bind(this);
        // Functions to show and hide the notifications
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
        // If the username is empty
        if (!this.state.username) {
            this.openNotification("The username cannot be left empty.");
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
        }, () => {
            // Submit to backend here, via AJAX
            alert("Submitting the responses")
        });

    }

    /* Can be optimised */
    render() {
        return (
            <section>
                {/* Notification component */}
                <Notification hidden={!this.state.notification} message={this.state.notificationMessage} close={this.closeNotification} />
                {/* The panel itself */}
                <div className="panel hover-effects">
                    {/* The holder that holds the components */}
                    <article className="holder">
                        {/* Holder title */}
                        <h1 className="title has-text-weight-light is-size-2-mobile is-size-1-tablet has-text-centered is-unselectable">Log In</h1>
                        <form id="LogIn">
                            {/* The  username and password input components*/}
                            <Input title="Username" name="username" loading={this.state.userLoading} placeholder="Enter your username" type="text"
                                condition={this.state.usernameCondition} disabled={this.state.loading} value={this.state.username}
                                peek={false} icon="fa-user" messages={{ default: "", error: "There was an error", regex: "Invalid Username", empty: "Username cannot be empty" }} currentMessage={this.state.usernameMessage}
                                handler={this.setValue} regex={this.props.userRegex} />
                            <Input title="Password" name="password" placeholder="Enter your password" type="password"
                                condition={this.state.passwordCondition} disabled={this.state.loading}
                                value={this.state.password} peek={true} icon="fa-lock" messages={{ default: "", error: "There was an error", empty: "Password cannot be empty" }} currentMessage={this.state.passwordMessage} handler={this.setValue} />
                        </form>
                        {/* The navigation links for other pages */}
                        <nav className="level">
                            {/* Disable the links if the app is in loading state */}
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
                        </nav>
                        {/* Button list with centering */}
                        {/* Can add more buttons in future */}
                        <div className="buttons is-centered">
                            {/* The submit button */}
                            <button className={`button is-link${this.state.loading ? " is-loading" : ""}`} onClick={this.submitForm} >Submit</button>
                        </div>
                    </article>
                </div>
            </section>
        );
    }
}

// The overall app
class App extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            // The app
            <div className="app">
                {/* The panel that holds all the page's components */}
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
    // Render the app. The Regular Epxression for the username field is given
    ReactDOM.render(<App userRegex={/^\w+$/} />, node);

}