const set = (key, data) => {
    localStorage.removeItem(key);
    localStorage.setItem(key, JSON.stringify(data));
} 

const get = (key) => {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : null
}

export const LocalStorageUtil = {
    set,
    get
}