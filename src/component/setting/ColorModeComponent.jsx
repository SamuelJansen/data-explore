import { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

export const ColorModeComponent = () => {
    const { styleService } = useContext(AppContext)
    return (
        <div 
            style={styleService.build({
                width: `24px`, 
                height: `24px`,
                margin: `0 0 0 12px`,
                flexDirection: `row`,
                alignItems: `center`
            })}
            onClick={() => null}
        >
            {styleService.isDarkMode() ? (
                <DarkModeIcon
                    onClick={() => styleService.switchMode()}
                    sx={{
                        color: styleService.getColorMode().text
                    }}
                />
            ) : (
                <LightModeIcon
                    onClick={() => styleService.switchMode()}
                    sx={{
                        color: styleService.getColorMode().text
                    }}
                /> 
            )}
        </div>
    )
}