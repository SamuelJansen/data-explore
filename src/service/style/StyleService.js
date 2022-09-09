import { ContexState } from "../../context-manager/ContextState";
import { StorageUtil } from '../../util/local-storage/StorageUtil';
import { STORAGE_KEYS } from '../../util/local-storage/SotrageKeys';


const DARK_MODE = `darkMode`
const LIGHT_MODE = `lightMode`

class StyleService extends ContexState {

    constructor() {
        super()
        this.state = {
            default: {
                width: `100%`,
                height: `100%`,
                display: `flex`
            },
            color: {
                mode: StorageUtil.get(STORAGE_KEYS.COLOR_MODE, DARK_MODE),
                dark: {
                    component: {
                        headLine: `#111111`,
                        base: `#191919`
                    },
                    text: `#FFFFFF`
                },
                light: {
                    component: {
                        headLine: `#CCCCCC`,
                        base: `#EFF1EE`
                    },
                    text: `#000000`
                }
            }
        }
    }

    setColorMode = (nextMode) => {
        StorageUtil.set(STORAGE_KEYS.COLOR_MODE, nextMode)
    }

    getColorMode = () => {
        return this.isDarkMode() ? {...this.state.color.dark} : {...this.state.color.light}
    }

    reloadColorMode = () => {
        const nextMode = StorageUtil.get(STORAGE_KEYS.COLOR_MODE, DARK_MODE)
        this.setColorMode(nextMode)
        return nextMode
    }

    isDarkMode = () => {
        return DARK_MODE === this.state.color.mode
    }

    switchMode = () => {
        const nextMode = this.isDarkMode() ? LIGHT_MODE : DARK_MODE
        StorageUtil.set(STORAGE_KEYS.COLOR_MODE, nextMode)
        this.setState({color: {mode: nextMode}})
    }

    build = (style, props={default:true}) => {
        return !!style ? {...(props.default? this.state.default : {}), ...style} : {...(props.default ? this.state.default : {})}
    }
    
}

export const StyleServiceProvider = () => new StyleService()