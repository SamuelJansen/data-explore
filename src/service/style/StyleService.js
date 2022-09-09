import { ContexState } from "../../context-manager/ContextState";
import { StorageUtil } from '../../util/local-storage/StorageUtil';
import { STORAGE_KEYS } from '../../util/local-storage/SotrageKeys';


const DARK_MODE = `dark`
const LIGHT_MODE = `light`

class StyleService extends ContexState {

    constructor() {
        super()
        this.state = {
            default: {
                width: `100%`,
                height: `100%`,
                display: `flex`
            },
            colorMode: StorageUtil.get(STORAGE_KEYS.COLOR_MODE, DARK_MODE),
            darkColorMode: {
                component: {
                    headLine: `#111111`,
                    base: `#191919`
                },
                text: `#FFFFFF`
            },
            lightColorMode: {
                component: {
                    headLine: `#CCCCCC`,
                    base: `#EFF1EE`
                },
                text: `#000000`
            }
        }
    }

    setColorMode = (nextMode) => {
        StorageUtil.set(STORAGE_KEYS.COLOR_MODE, nextMode)
        this.setState({...this.state, ...{colorMode: nextMode}})
    }

    getColorMode = () => {
        const currentColorMode = this.isDarkMode() ? {...this.state.darkColorMode} : {...this.state.lightColorMode}
        return currentColorMode
    }

    reloadColorMode = () => {
        const nextColorMode = StorageUtil.get(STORAGE_KEYS.COLOR_MODE, DARK_MODE)
        this.setColorMode(nextColorMode)
        return nextColorMode
    }

    isDarkMode = () => {
        return DARK_MODE === this.state.colorMode
    }

    switchMode = () => {
        const nextColorMode = this.isDarkMode() ? LIGHT_MODE : DARK_MODE
        this.setColorMode(nextColorMode)
    }

    build = (style, props={default:true}) => {
        return !!style ? {...(props.default? this.state.default : {}), ...style} : {...(props.default ? this.state.default : {})}
    }
    
}

export const StyleServiceProvider = () => new StyleService()