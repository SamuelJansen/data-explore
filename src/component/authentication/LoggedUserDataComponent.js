import { useContext } from 'react';
import { AppContext } from '../../context/AppContext';


export const LoggedUserDataComponent = () => {
  const { authenticationService } = useContext(AppContext)
  return (
    <div style={{display: "flex", flexDirection: "column", alignContent: "center", justifyContent: "center"}}>
        <h3>You logged in as {authenticationService.state.loginData.email}</h3>
        <div>
            <img src={authenticationService.state.loginData.picture} referrerPolicy={"no-referrer"} style={{maxWidth: "200px", maxHeight: "200px"}}/>
        </div>
        <div>
            <button onClick={() => authenticationService.doLogout()}>Logout</button>
        </div>
    </div>
  );
};
