import React from "react";
import ReactDOM from "react-dom";
import $ from "jquery/src/core";
import 'jquery/src/ajax';
import 'jquery/src/ajax/xhr';

// To prevent default action
function prevent(event) {
    event.preventDefault();
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
            <h3 className="is-size-5">{this.props.subtitle ? this.props.subtitle : <span><a href="/">Sign In</a> to do more</span>}</h3>
        </div>);
    }
}

class MenuItem extends React.Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this)
    }

    handleClick(event) {
        this.props.activateFunction(this.props.value);
        this.props.menuToggle(event, false);
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
        this.state = {
            mobileActive: false
        }
        this.renderItems = this.renderItems.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }

    renderItems() {
        return (
            this.props.itemList.map(item => (
                <MenuItem title={item.title} icon={item.icon} active={item.value == this.props.active ? true : false} key={item.value} value={item.value} activateFunction={this.props.activateFunction} menuToggle={this.handleClick} />
            ))
        );
    }

    handleClick(event, value = null) {
        if (!value)
            value = !this.state.mobileActive;
        this.setState({ mobileActive: value });
    }

    render() {
        return (
            <div>
                <div className={`button is-link menu-button is-hidden-tablet ${this.state.mobileActive ? "hidden" : ""}`} onClick={this.handleClick}>
                    <span className="icon"><i className="fas fa-bars"></i></span>
                </div>
                <div className={`menu-holder ${this.state.mobileActive ? "is-active" : ""}`}>
                    <div className="menu-overlay" onClick={this.handleClick}>
                    </div>
                    <nav className="menu">
                        <MenuInfo title={this.props.title} subtitle={this.props.subtitle} />
                        <div>
                            <h5 className="menu-label">Dashboard</h5>
                            <ul className="menu-list">
                                {this.renderItems()}
                                <li><a href="/logout" className={this.props.userLogged ? "" : "is-hidden"}><span className="icon"><i className="fas fa-sign-out-alt"></i></span>&nbsp;&nbsp;Log Out</a></li>
                            </ul>
                        </div>
                    </nav>
                </div>
            </div>
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

/* Change to update state with votes */
class Article extends React.Component {
    constructor(props) {
        super(props);
        this.date = new Date(Date.parse(this.props.item.dateOfSub));
        var dd = String(this.date.getDate()).padStart(2, '0');
        var mm = String(this.date.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = this.date.getFullYear();

        this.date = mm + '/' + dd + '/' + yyyy;

        this.state = {
            upvotes: 0,
            downvotes: 0,
            status: "",
            error: "",
            loading: false
        }
        this.updateVote = this.updateVote.bind(this);
        this.makeUpvote = this.makeUpvote.bind(this);
        this.makeDownVote = this.makeDownVote.bind(this);
    }

    updateVote() {
        this.setState({ loading: true }, () => {

            $.get("/article", { field: "getVotes", id: this.props.item.id }).done((data) => {
                if (!data.sql) {
                    this.setState({ error: 'The votes could not be loaded' });
                    return;
                }
                let status = "";

                if (data.downvotes > data.upvotes)
                    status = "invalid";
                else if (data.downvotes < data.upvotes)
                    status = "valid";
                this.setState({ upvotes: data.upvotes, downvotes: data.downvotes, error: "", status: status });
            }).fail(() => {
                this.setState({ error: 'The server failed to respond' });
            }).always(() => this.setState({ loading: false }));
        });
    }

    componentDidMount() {
        this.updateVote();
    }

    makeUpvote() {
        this.setState({ loading: true }, () => {

            $.get("/article", { field: "makeVote", id: this.props.item.id, type: 'upvote' }).done((data) => {
                if (!data.sql) {
                    this.setState({ error: 'The vote could not made' });
                    return;
                }
            }).fail(() => {
                this.setState({ error: 'The server failed to respond' });
            }).always(this.updateVote);
        });
    }

    makeDownVote() {
        this.setState({ loading: true }, () => {

            $.get("/article", { field: "makeVote", id: this.props.item.id }).done((data) => {
                if (!data.sql) {
                    this.setState({ error: 'The votes could not be loaded' });
                    return;
                }
            }).fail(() => {
                this.setState({ error: 'The server failed to respond' });
            }).always(this.updateVote);
        });
    }

    render() {
        return (
            <article className="media box" key={this.props.item.id}>
                <div className="media-content">
                    <div className="content">
                        <p>
                            <strong>{this.props.item.title}</strong> <small>@{this.props.item.author}</small>&nbsp;&nbsp;<small>{this.date}</small>
                            <br />
                            {this.props.item.description}

                        </p>
                        <a target="_blank" href={this.props.item.link}>{this.state.error}&nbsp;</a>
                    </div>
                    <nav className="level is-mobile">
                        <div className="level-left">
                            <a onClick={this.makeUpvote} className={`level-item ${(!this.props.userLogged || this.state.loading) ? "disabled" : ""}`}>
                                <span className="icon is-small"><i className="fas fa-thumbs-up"></i></span>&nbsp;{this.state.upvotes}
                            </a>
                            <a onClick={this.makeDownVote} className={`level-item ${(!this.props.userLogged || this.state.loading) ? "disabled" : ""}`}>
                                <span className="icon is-small"><i className="fas fa-thumbs-down"></i></span>&nbsp;{this.state.downvotes}
                            </a>
                            <div className={`button is-small ${this.state.loading ? 'is-loading' : ""} is-white`}></div>
                            <span className={`level-item is-unselectable tag is-${this.state.status == 'valid' ? "success" : (this.state.status == 'invalid' ? "danger" : "dark")}`}>{this.state.status == 'valid' ? "True" : (this.state.status == 'invalid' ? "Fake" : "Not Determined")}</span>
                        </div>
                    </nav>
                </div>
            </article>
        );
    }
}

class SubmitArticle extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            title: "",
            message: "",
            titleState: "",
            titleMsg: "",
            messageState: "",
            messageMsg: ""
        }
        this.handleChange = this.handleChange.bind(this);
        this.submitArticle = this.submitArticle.bind(this);
    }

    handleChange(event) {
        let value = event.target.value;
        let name = event.target.name;

        this.setState({ [name]: value, [name + "Msg"]: "", [name + "State"]: "" });
    }

    submitArticle(event) {
        prevent(event);
        let err = false;
        if (!this.state.title) {
            this.setState({ titleMsg: "The title cannot be empty", titleState: "danger" });
            err = true;
        }
        if (!this.state.message) {
            this.setState({ messageMsg: "The description cannot be empty", messageState: "danger" });
            err = true;
        }

        if (err) return;

        this.props.setState({ loading: true }, () => {

            $.post("/submitArticle", { title: this.state.title, description: this.state.message }).done(data => {
                if (!data.sql) {
                    this.props.setState({ notification: true, notificationMessage: "The article could not be submitted. Please try again later." })
                    return;
                }

                this.props.setState({ notification: true, notificationMessage: "Your article was submitted." }, () => this.setState({ title: "", message: "" }));

            }).fail(err => this.props.setState({ notification: true, notificationMessage: "There was an error connecting to the server" })).always(() => this.props.setState({ loading: false }));
        });
    }

    render() {
        return (
            <form className="submitForm" onSubmit={prevent}>
                <div className="field">
                    <label className="label">Title</label>
                    <div className="control">
                        <input className={`input ${this.state.titleState ? ("is-" + this.state.titleState) : ""}`} name="title" type="text" onChange={this.handleChange} value={this.state.title} placeholder="Title is used to find the article" />
                    </div>
                    <p className={`help ${this.state.messageState ? ("is-" + this.state.messageState) : ""}`}>{this.state.titleMsg}&nbsp;</p>
                </div>


                <div className="field">
                    <label className="label">Brief Description</label>
                    <div className="control">
                        <textarea className={`textarea ${this.state.messageState ? ("is-" + this.state.messageState) : ""}`} maxLength="250" onChange={this.handleChange} value={this.state.message} name="message" placeholder="Describe the outline of the article"></textarea>
                    </div>
                    <p className={`help ${this.state.messageState ? ("is-" + this.state.messageState) : ""}`}>{this.state.messageMsg ? this.state.messageMsg : (`${250 - this.state.message.length} characters left`)}</p>
                </div>

                <div className="buttons is-centered">
                    <div className="control">
                        <a className="button is-link" onClick={this.submitArticle}>Submit</a>
                    </div>
                </div>
            </form>

        );
    }
}

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: null,
            votes: null,
            active: this.props.active,
            loading: false,
            notification: false,
            notificationMessage: "",
            trending: [],
            searchText: "",
            searchState: "",
            searchMessage: "",
            search: []
        }
        this.setActive = this.setActive.bind(this);
        this.renderContent = this.renderContent.bind(this);
        this.closeNotification = this.closeNotification.bind(this);
        this.handleSearchChange = this.handleSearchChange.bind(this);
        this.submitSearch = this.submitSearch.bind(this);
        this.setParent = this.setParent.bind(this);
    }

    /* Specific function */
    setActive(value) {
        if (!value)
            return;

        let callback = (value, data) => {
            if (!data.articles) {
                this.setState({ trending: [], notification: true, notificationMessage: "There are no trending articles" });
                return;
            }
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
            if (value == "trending")
                this.setState({ loading: true }, () => {
                    // Get data from server
                    $.get("/article", { field: value }).done(data => callback(value, data)).fail(() => { this.setState({ notification: true, notificationMessage: "There was an error processing your request" }) }).always(() => { this.setState({ loading: false }) });
                });
        });
    }

    setParent(state, callback) {
        if (callback)
            this.setState(state, callback);
        else
            this.setState(state);
    }

    closeNotification() {
        this.setState({ notification: false });
    }

    /* Specific function */
    handleSearchChange(event) {
        this.setState({ searchText: event.target.value, searchState: "", searchMessage: "" });
    }

    /* Specific function */
    submitSearch() {
        if (!this.state.searchText) {
            this.setState({
                searchState: "danger",
                searchMessage: "Please enter the title"
            });
            return;
        }

        // If we are here, the text is valid
        this.setState({ loading: true }, () => {
            $.get("/article", { field: 'search', value: this.state.searchText }).done((data) => {
                if (!data.sql) {
                    this.setState({ loading: false, notification: true, notificationMessage: "There was an error connecting to the server" });
                    return;
                }

                if (data.articles.length)
                    this.setState({ search: data.articles });
                else
                    this.setState({ search: [], notification: true, notificationMessage: "No articles were found" });
            }).fail(() => {
                this.setState({ search: [], notification: true, notificationMessage: "There was an error processing your request" });
            }).always(() => {
                this.setState({ loading: false });
            });
        });
    }

    componentDidMount() {
        // Step 1, check if the user is logged in
        this.setState({ loading: true }, () => {
            $.post("/checkUser", { field: 'loggedIn' }).done(
                data => {

                    if (!data.sql) {
                        this.setState({ loading: false, notification: true, notificationMessage: "There was an error connecting to the server" });
                        return;
                    }

                    data.status ? this.setState({ username: data.username, votes: data.votes }) : null;
                }).fail(() => (this.setState({ loading: false, notification: true, notificationMessage: "There was an error connecting to the server" }))).always(() => this.setState({ loading: false, active: this.props.active }, () => this.setActive(this.props.active)));
        });
    }

    /* Specific function */
    renderContent() {
        switch (this.state.active) {
            case "trending":
                return (
                    <section>
                        <h1 className="title has-text-centered">Recent Articles</h1>
                        {this.state.trending.map(item => (
                            <Article setParent={this.setParent} key={item.id} id={item.id} userLogged={this.state.username} item={item} />
                        ))}
                    </section>
                );
            case "search":
                return (
                    <section>
                        <h1 className="title has-text-centered">Search for an article</h1>

                        <div className="field is-horizontal">
                            <div className="field-body">
                                <div className="field">
                                    <div className="field has-addons">
                                        <p className="control is-expanded">
                                            <input className={`input ${this.state.searchState ? ("is-" + this.state.searchState) : ""}`} type="text" placeholder="Enter title of the article" value={this.state.searchText} onChange={this.handleSearchChange} />
                                        </p>
                                        <p className="control">
                                            <a className="button is-link" onClick={this.submitSearch}>
                                                <span className="icon"><i className="fas fa-search"></i></span>
                                            </a>
                                        </p>
                                    </div>
                                    <p className={`help ${this.state.searchState ? ("is-" + this.state.searchState) : ""}`}>&nbsp;{this.state.searchMessage}</p>
                                </div>
                            </div>
                        </div>
                        {this.state.search.map(item => (
                            <Article setParent={this.setParent} key={item.id} id={item.id} userLogged={this.state.username == null} item={item} />
                        ))}
                    </section>
                );
            case "submit":
                return (
                    <SubmitArticle setState={this.setParent} />
                );
        }
    }

    render() {
        return (
            <div className="app">
                <Notification message={this.state.notificationMessage} hidden={!this.state.notification} close={this.closeNotification} />
                <Preloader active={this.state.loading} />
                <Menu userLogged={this.state.username} title={this.state.username} subtitle={this.state.votes !== null ? ("Logged In") : ""} itemList={this.state.username ? [{ title: "Trending", icon: "chart-line", value: "trending" }, { title: "Search", icon: "search", value: "search" }, { title: "Submit Article", icon: "newspaper", value: "submit" }] : [{ title: "Trending", icon: "chart-line", value: "trending" }, { title: "Search", icon: "search", value: "search" }]}
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