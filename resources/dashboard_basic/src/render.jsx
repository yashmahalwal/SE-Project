import React from "react";
import ReactDOM from "react-dom";


// To prevent default action
function prevent(event) {
    event.preventDefault();
}

let serialize = function (obj, prefix) {
    var str = [],
        p;
    for (p in obj) {
        if (obj.hasOwnProperty(p)) {
            var k = prefix ? prefix + "[" + p + "]" : p,
                v = obj[p];
            str.push((v !== null && typeof v === "object") ?
                serialize(v, k) :
                encodeURIComponent(k) + "=" + encodeURIComponent(v));
        }
    }
    return str.join("&");
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

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
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
                    ajax(`http://127.0.0.1:3000/article?field=${value}`, (data) => {
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

            ajax("http://127.0.0.1:3000/article?" + serialize({ field: 'search', value: this.state.searchText }), (data) => {
                this.setState({ loading: false, search: data.articles })
            }, () => {
                this.setState({ loading: false, notification: true, notificationMessage: "There was an error processing your request" });
            }, "GET");
        });
    }

    componentDidMount() {
        this.setActive(this.props.active);
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
    ReactDOM.render(<App active="search" />, node);

}