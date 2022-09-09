import { ContexState } from '../../context-manager/ContextState';
import { StorageUtil } from '../../util/local-storage/StorageUtil';
import { STORAGE_KEYS } from '../../util/local-storage/SotrageKeys';
import jwtDecode from 'jwt-decode';


class AuthenticationService extends ContexState {

    constructor() {
        super()
        this.state = {
            loginData: StorageUtil.get(STORAGE_KEYS.LOGIN_DATA_KEY, null)
        }
    }

    setLoginData = (loginData) => {
        !!loginData ? this.setState({loginData: {...loginData}}) : this.setState({loginData: null})
    }
    
    setAuthentication = (loginData) => {
        this.setLoginData(loginData)
        StorageUtil.set(STORAGE_KEYS.LOGIN_DATA_KEY, loginData)
    }
    
    getAuthentication = () => {
        return this.loginData
    }
    
    reloadAuthentication = () => {
        const loginData = StorageUtil.get(STORAGE_KEYS.LOGIN_DATA_KEY, null)
        this.set({loginData: loginData})
        return loginData
    }

    doLogin = async () => {
        try {
            await window.google.accounts.id.initialize({
                client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
                callback: (res) => this._handleLogin(res),
            });
            window.google.accounts.id.prompt((notification) => {
                if (notification.isNotDisplayed()) {
                    throw new Error('Try to clear the cookies or try again later!');
                }
                if (
                    notification.isSkippedMoment() ||
                    notification.isDismissedMoment()
                ) {
                    // console.log('logged or dismissed');
                }
            });
        } catch (error) {
            console.log(error);
        }
    }

    doLogout = async () => {
        await this._handleLogout()
    }

    handleFailure = async (result) => {
        console.log('Failure at login');
        console.log(result);
        alert(result);
    };

    _handleLogin = async (googleData) => {
        const res = await fetch('http://localhost:7889/auth', {
            method: 'POST',
            body: JSON.stringify({
                token: googleData.credential,
            }),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
        });
        this.setAuthentication(await res.json());
    }
    
    _handleLogout = async () => {
        this.setAuthentication(null);
    };
    
}

export const AuthenticationServiceProvider = () => new AuthenticationService()