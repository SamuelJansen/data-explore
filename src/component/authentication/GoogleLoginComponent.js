import { Google } from '@mui/icons-material';
import { Button } from '@mui/material';
import { useContext } from 'react';
import { AppContext } from '../../context/AppContext';

export const GoogleLoginComponent = () => {
  const { authenticationService } = useContext(AppContext)
  return (
    <Button
      variant="outlined"
      startIcon={<Google />}
      onClick={() => authenticationService.doLogin()}
    >
      Login with Google
    </Button>
  );
};
