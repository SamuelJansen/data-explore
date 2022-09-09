import { ContexState } from "../../context-manager/ContextState";
import { StorageUtil } from "../../util/local-storage/StorageUtil";
import { STORAGE_KEYS } from "../../util/local-storage/SotrageKeys";
import jwtDecode from "jwt-decode";


const AUTHORIZATION_HEADER_KEY = `Authorization`
const SCHEMA = `https`
const BASE_HOST = `data-explore.com`
const SITE_HOST = `${SCHEMA}://studies.${BASE_HOST}`
const API_HOST = `${SCHEMA}://api.${BASE_HOST}`
const API_BASE_URL = `${SCHEMA}://api.${BASE_HOST}/authentication-manager-api`

class AuthenticationService extends ContexState {

    constructor() {
        super()
        this.state = {
            loginData: StorageUtil.get(STORAGE_KEYS.LOGIN_DATA_KEY, null),
            authorization: StorageUtil.get(STORAGE_KEYS.AUTHORIZATION_DATA_KEY, null)
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
    
    setAuthorization = (authorization) => {
        !!authorization ? this.setState({authorization: {...authorization}}) : this.setState({authorization: null})
        StorageUtil.set(STORAGE_KEYS.AUTHORIZATION_DATA_KEY, authorization)
    }
    
    getAuthorization = () => {
        return this.authorization
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
                    throw new Error(`Try to clear the cookies or try again later!`);
                }
                if (
                    notification.isSkippedMoment() ||
                    notification.isDismissedMoment()
                ) {
                    // console.log(`logged or dismissed`);
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
        console.log(`Failure at login`);
        console.log(result);
        alert(result);
    };

    _handleLogin = async (googleData) => {
        const handleLoginResponse = await fetch(`${API_BASE_URL}/auth`, {
            method: `POST`,
            body: JSON.stringify({
                token: googleData.credential,
            }),
            headers: {
                "Accept": `application/json`,
                "Content-Type": `application/json`,
                "Access-Control-Allow-Origin": `${API_HOST} | ${SITE_HOST} | * | http://localhost:7888`,
                "Access-Control-Allow-Headers": `*`,
                "Access-Control-Expose-Headers": `*`,
                "Referrer-Policy": `*`,
                "Access-Control-Allow-Methods": "*",
                "Access-Control-Allow-Credentials": "true"
            },
        })
        this.setAuthorization(handleLoginResponse.headers.get(AUTHORIZATION_HEADER_KEY).split(` `)[1]);
        this.setAuthentication(await handleLoginResponse.json());
    }
    
    _handleLogout = async () => {
        const res = await fetch(`${API_BASE_URL}/auth`, {
            method: `DELETE`,
            body: JSON.stringify({
                [AUTHORIZATION_HEADER_KEY]: `Bearer ${this.getAuthorization()}`,
            }),
            headers: {
                "Content-Type": `application/json`,
                "Access-Control-Allow-Origin": `*`,
                "Sec-Fetch-Dest": `${API_BASE_URL}`
            },
        });
        this.getAuthorization(null);
        this.setAuthentication(null);
    };
    
}

export const AuthenticationServiceProvider = () => new AuthenticationService()