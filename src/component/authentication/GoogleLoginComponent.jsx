import { Google } from '@mui/icons-material';
import { Button } from '@mui/material';
import { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

export const GoogleLoginComponent = () => {
  const { styleService, authenticationService } = useContext(AppContext)
  return (
    // <h1
    //   style={styleService.build({})}
    // >
    <AccountCircleIcon
      variant="outlined"
      onClick={() => authenticationService.doLogin()}
      sx={{
        color: styleService.getColorMode().text
      }}
    />
    // </h1>
    // <Button
    //   variant="outlined"
    //   startIcon={<AccountCircleIcon />}
    //   onClick={() => authenticationService.doLogin()}
    // >
    //   Login with Google
    // </Button>
  );
};
