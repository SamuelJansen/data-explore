import { ContexState } from '../../context-manager/ContextState';
import { LocalStorageUtil } from '../../util/local-storage/LocalStorageUtil';
import { LOCAL_STORAGE_KEYS } from '../../util/local-storage/LocalSotrageKeys';
import jwtDecode from 'jwt-decode';


class AuthenticationService extends ContexState {

    constructor() {
        super()
        this.state = {
            loginData: LocalStorageUtil.get(LOCAL_STORAGE_KEYS.LOGIN_DATA_KEY)
        }
    }

    setLoginData = (loginData) => {
        !!loginData ? this.setState({loginData: {...loginData}}) : this.setState({loginData: null})
    }
    
    setAuthentication = (loginData) => {
        this.setLoginData(loginData)
        LocalStorageUtil.set(LOCAL_STORAGE_KEYS.LOGIN_DATA_KEY, loginData)
    }
    
    getAuthentication = () => {
        const loginData = LocalStorageUtil.get(LOCAL_STORAGE_KEYS.LOGIN_DATA_KEY)
        this.setAuthentication(loginData)
        return loginData
    }

    doLogin = async () => {
        try {
            await window.google.accounts.id.initialize({
                client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
                callback: (res) => this._handleLogin(res),
            });
            await window.google.accounts.id.prompt((notification) => {
                console.log(notification)
                if (notification.isNotDisplayed()) {
                    throw new Error('Try to clear the cookies or try again later!');
                }
                if (
                    notification.isSkippedMoment() ||
                    notification.isDismissedMoment()
                ) {
                    throw new Error('Login dismissed by the client!');
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