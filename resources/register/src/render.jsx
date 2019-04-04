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
        let callback1 = (condition = "", message = "default", callback3 = this.props.coupling) => {
            this.props.handler(this.props.name + "Condition", condition, () => callback2(message, callback3));
        }
        // Set the message for the component
        let callback2 = (message, callback3 = null) => {
            this.props.handler(this.props.name + "Message", message, callback3);
        }

        // If there is no value, set the state to daner with empty error
        if (!value) {
            if (!this.props.optional)
                this.props.handler(this.props.name, value, callback1("danger", "empty"));
            else
                this.props.handler(this.props.name, value, callback1);
            // Reset the couple if it exists
            return;
        }


        // If a RegEx is defined
        if (this.props.regex)
            // If the value violates that RegEx
            // Uses short circuiting for better performance
            if (this.props.preventRegex && !this.props.regex.test(value)) {
                // If regex prevents change, just show the error
                callback1("danger", "regex", null);
                return;
            }

        // If flow is here, either regex is not defined
        // Or the regex test was passed with preventRegex set to false
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
        // Set the state of component: appropriate condition and message
        let callback1 = (condition = "", message = "default", callback3 = this.props.coupling) => {
            this.props.handler(this.props.name + "Condition", condition, () => callback2(message, callback3));
        }
        // Set the message for the component
        let callback2 = (message, callback3 = null) => {
            this.props.handler(this.props.name + "Message", message, callback3);
        }


        // The field is empty,
        if (!this.props.value) {
            // If the field is not empty
            if (!this.props.optional)
                this.props.handler(this.props.name, this.props.value, callback1("danger", "empty"));
            return;
        }


        // If a regex is given
        if (this.props.regex)
            // If the value of the field passes the regex test
            if (this.props.regex.test(this.props.value))
                this.props.handler(this.props.name, this.props.value, callback1);
            else
                // Show the error
                this.props.handler(this.props.name, this.props.value, callback1("danger", "regex"));

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

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            name: "",
            nameCondition: "",
            nameMessage: "default",
            email: "",
            emailCondition: "",
            emailMessage: "default",
            username: "",
            usernameCondition: "",
            usernameMessage: "default",
            userLoading: false,
            password: "",
            passwordCondition: "",
            passwordMessage: "default",
            repassword: "",
            repasswordCondition: "",
            repasswordMessage: "default"
        }
        this.setValue = this.setValue.bind(this);
        this.couplePasswords = this.couplePasswords.bind(this);
    }

    setValue(field, value, callback) {
        this.setState({
            [field]: value
        }, () => {
            if (callback)
                callback();
        });
    }

    /* Very specific function to couple the password fields */
    couplePasswords(callback) {
        let pass = this.state.password, repass = this.state.repassword;
        // If the repassword field goes empty, do nothing
        if (!repass) return;
        /* Core logic */
        if (pass === repass)
            this.setState({ repasswordCondition: "success", repasswordMessage: "matchSuccess" });
        else
            this.setState({ repasswordCondition: "danger", repasswordMessage: "matchFailure" });


    }

    render() {
        return (
            <div className="app hero is-fullheight">
                <div className="hero-body">
                    <form className="box">
                        <h1 className="title has-text-weight-light is-size-2-mobile is-size-1-tablet has-text-centered is-unselectable">Sign Up</h1>
                        <Input title="Name" name="name" placeholder="What do people call you?" type="text"
                            condition={this.state.nameCondition} disabled={false} value={this.state.name}
                            peek={false} icon="fa-info-circle" messages={{ default: "", error: "There was an error", regex: "", empty: "Name cannot be empty" }} currentMessage={this.state.nameMessage}
                            handler={this.setValue} optional={false} />
                        <Input title="Username" name="username" loading={this.state.userLoading} placeholder="This is how people see you." type="text"
                            condition={this.state.usernameCondition} disabled={false} value={this.state.username}
                            peek={false} icon="fa-user" messages={{ default: "Only alphanumeric and underscore characters allowed", error: "There was an error", regex: "Only alphanumeric and underscore characters allowed", empty: "Username cannot be empty" }} currentMessage={this.state.usernameMessage}
                            handler={this.setValue} regex={this.props.userRegex} preventRegex={true} optional={false} />
                        <Input title="Email" name="email" placeholder="We'll reach you here." type="text"
                            condition={this.state.emailCondition} disabled={false} value={this.state.email}
                            peek={false} icon="fa-envelope" messages={{ default: "", error: "There was an error", regex: "The email is invalid", empty: "Email cannot be empty" }} currentMessage={this.state.emailMessage}
                            handler={this.setValue} regex={this.props.emailRegex} optional={false} />
                        <Input title="Password" name="password" placeholder="Make it hard to crack." type="password"
                            condition={this.state.passwordCondition} disabled={false} value={this.state.password}
                            peek={true} icon="fa-lock" messages={{ default: "Only alphabets and numbers allowed", error: "There was an error", regex: "The password is invalid", empty: "Password cannot be empty" }} currentMessage={this.state.passwordMessage}
                            handler={this.setValue} optional={false} regex={this.props.passwordRegex} preventRegex={true} coupling={this.couplePasswords} couple="repassword" coupleValue={this.state.repassword} />
                        <Input title="Re-enter Password" name="repassword" placeholder="Do you remember it?" type="password"
                            condition={this.state.repasswordCondition} disabled={false} value={this.state.repassword}
                            peek={false} icon="fa-check-double" messages={{ default: "", error: "There was an error", regex: "Invalid characters", empty: "This field cannot be empty", matchSuccess: "The passwords match", matchFailure: "The passwords do not match" }} currentMessage={this.state.repasswordMessage}
                            handler={this.setValue} optional={false} regex={this.props.passwordRegex} preventRegex={true} coupling={this.couplePasswords} couple="password" coupleValue={this.state.password} />
                        <div className="buttons is-centered">
                            <div className="button is-link">Submit</div>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

}


window.onload = (event) => {
    let node = document.createElement("main");
    node.id = "root";
    document.querySelector("body").prepend(node);

    ReactDOM.render(<App userRegex={/^\w+$/} passwordRegex={/^[A-Za-z0-9]+$/}
        emailRegex={/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/} />, node);
}