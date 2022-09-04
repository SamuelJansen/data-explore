import { useState } from 'react';

class ContexState {
    
    constructor() {
        this.stateUpdateHandler = null
        this.state = {}
    }

    propagateState = () => {
        this.stateUpdateHandler({...this})
    }

    setState = (props) => { 
        if (!!props) {
            Object.keys(props).forEach((key, index) => {
                if (!!props[key]) {
                    if (this.state[key] != props[key]) {
                        this.state[key] = {...props[key]}
                    }
                } else {
                    this.state[key] = null
                }
            })
        }
        this.propagateState()
    }

    overrideUpdateHandler = (stateUpdateHandler) => {
        this.stateUpdateHandler = stateUpdateHandler
    }
}


const useContextState = (provider) => {
    const [provided, setProvided] = useState(provider)
    provided.overrideUpdateHandler(setProvided)
    return [
        provided
    ]
}

export {
    ContexState,
    useContextState
}