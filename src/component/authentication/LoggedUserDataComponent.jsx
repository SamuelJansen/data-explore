import { useContext } from 'react';
import { AppContext } from '../../context/AppContext';

export const LoggedUserDataComponent = () => {
  const { styleService, authenticationService } = useContext(AppContext)
  return (
    <div style={styleService.build({})}>
        {/* <h3>You logged in as {authenticationService.state.loginData.email}</h3> */}
        <div 
          style={styleService.build({})}
          onClick={() => authenticationService.doLogout()}
        >
            <img
              src={authenticationService.state.loginData.picture} 
              referrerPolicy={"no-referrer"} 
              style={styleService.build({
                  height: "24px", 
                  borderRadius: "50%"
              })}
            />
        </div>
        {/* <div>
            <button onClick={() => authenticationService.doLogout()}>Logout</button>
        </div> */}
    </div>
  );
};
