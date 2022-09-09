import { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { GoogleLoginComponent } from './GoogleLoginComponent';
import { LoggedUserDataComponent } from './LoggedUserDataComponent';

export const AuthenticationComponent = () => {
    const { styleService, authenticationService } = useContext(AppContext)
    return (
        <div
            style={styleService.build({
                width: "24px", 
                height: "24px",
                margin: "0 0 0 12px",
                flexDirection: "row",
                alignItems: "center"
            })}
        >
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