import { ENVIRONEMNT_KEYS, ENVIRONEMNTS } from "./EnvironmentKeys"


const getEnv = () => {
    return process.env
}

const get = (key) => {
    return getEnv()[key]
}

const getCurrentEnvironment = () => {
    return get(ENVIRONEMNT_KEYS.ENV)
}

const isLocal = () => {
    return ENVIRONEMNTS.LOCAL === getCurrentEnvironment()
}

const isDevelopment = () => {
    return ENVIRONEMNTS.DEVELOPMENT === getCurrentEnvironment()
}

export const EnvironmnentUtil = {
    getEnv, 
    get,
    isLocal,
    isDevelopment,
    getCurrentEnvironment
}