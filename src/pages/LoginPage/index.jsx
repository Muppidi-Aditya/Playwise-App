import { Component } from "react";
import './style.css'

import GoogleLogo from '../../assets/google-logo.webp'

class LoginPage extends Component {

    state = {
        presentSlide: 'getStarted'
    }

    getStarted = () => {
        this.setState({
            presentSlide: 'login',
        })
    }

    openRegisterTab = () => {
        this.setState({
            presentSlide: 'temp',
        })

        setTimeout(() => {
            this.setState({
                presentSlide: 'register'
            })
        }, 600);
    }

    openLoginBlock = () => {
        this.setState({
            presentSlide: 'temp',
        })

        setTimeout(() => {
            this.setState({
                presentSlide: 'login'
            })
        }, 600);
    }

    getStartedBlock = () => {
        const {presentSlide} = this.state
        return (
            <div className="get-started-block" style = {{visibility : presentSlide != 'getStarted' ? 'hidden' : 'visible'}}>
                <h1> Enjoy hear the best music with us </h1>
                <p> What do you want to hear, enjoy hear the best music with us </p>
                <button onClick = {this.getStarted}> Get Started </button>
            </div>
        )
    }

    loginBlock = () => {
        const {presentSlide} = this.state
        return (
            <div className="login-block" style = {{bottom : presentSlide == 'login' ? '0' : '-430px'}}>
                <h1> Login </h1>
                <form>
                    <input type = "email" placeholder = "Enter Email" />
                    <input type = "password" placeholder = "Enter password" />
                    <input className="login-btn" type="submit" value="Login" style={{color: 'white'}} />
                </form>

                <div className="or-block">
                    <hr />
                    <p> Or Sign in with</p>
                    <hr />
                </div>
                <div className="google-logo-block">
                    <img src = {GoogleLogo} />
                </div>
                <p> Don't have an account?<span onClick={this.openRegisterTab}>Register Here...</span> </p>
            </div>
        )
    }

    registerBlock = () => {
        const {presentSlide} = this.state
        return (
            <div className="register-block" style = {{bottom : presentSlide == 'register' ? '0' : '-500px'}}>
                <h1> Register </h1>
                <form>
                    <input type = "email" placeholder="Enter Email" />
                    <input type = "password" placeholder="Enter Password" />
                    <input type = "password" placeholder="Confirm Password" />
                    <input type = "submit" value="Register" className="register-btn" style = {{color: 'white'}} />
                </form>
                <div className="or-block">
                    <hr />
                    <p> Or Sign up with</p>
                    <hr />
                </div>
                <div className="google-logo-block">
                    <img src = {GoogleLogo} />
                </div>
                <p> Already have an account?<span onClick={this.openLoginBlock}>Login Here...</span> </p>
            </div>
        )
    }

    render () {
        return (
            <div className="login-page-background">
                {this.getStartedBlock()}
                {this.loginBlock()}
                {this.registerBlock()}
            </div>
        )
    }
}

export default LoginPage