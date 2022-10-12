import { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { AuthenticationComponent } from '../authentication/AuthenticationComponent';
import { ColorModeComponent } from '../setting/ColorModeComponent';

export const TopbarComponent = () => {
    const { styleService } = useContext(AppContext)
    return (
        <div 
            style={styleService.build({
                position: `relative`,
                height: `32px`,
                padding: `0 20px`,
                alignItems: `center`,
                justifyContent: `space-between`,
                backgroundColor: styleService.getColorMode().component.headLine
            })}
        >
            <div 
                className='topbar-left'
                style={styleService.build({
                    width: `185px`,
                    height: `100%`,
                    display: `flex`,
                    flexDirection: `row`,
                    justifyContent: `center`,
                    alignItems: `center`
                })}
            >
                <h1
                    style={styleService.build({
                        justifyContent: `left`,
                        alignItems: `center`,
                        color: styleService.getColorMode().text

                    })}
                >Data Explore</h1>
            </div>
            <div 
                className='topbar-right'
                style={styleService.build({
                    width: `100%`,
                    height: `100%`,
                    display: `flex`,
                    flexDirection: `row`,
                    justifyContent: `right`,
                    alignItems: `center`
                })}
            >
                <ColorModeComponent />
                <AuthenticationComponent />
            </div>
        </div>
    );
  };
  