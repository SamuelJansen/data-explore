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
                height: `36px`,
                backgroundColor: styleService.getColorMode().component.headLine
            })}
        >
            <div 
                style={styleService.build({
                    margin: `0 40px`,
                    alignItems: `center`,
                    justifyContent: `space-between`
                })}
            >
                <div 
                    className='topbar-left'
                    style={styleService.build({
                        width: `20%`,
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
                        width: `60%`,
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
        </div>
    );
  };
  