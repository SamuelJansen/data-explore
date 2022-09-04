import { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { GoogleLoginComponent } from './GoogleLoginComponent';
import { LoggedUserDataComponent } from './LoggedUserDataComponent';

export const AuthenticationComponent = () => {
    const { authenticationService } = useContext(AppContext)
    return (
        <div>
            {
                authenticationService.state.loginData ? (
                    <LoggedUserDataComponent></LoggedUserDataComponent>
                ) : (
                    <GoogleLoginComponent></GoogleLoginComponent>
                )
            }
        </div>
    );
}