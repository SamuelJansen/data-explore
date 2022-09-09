const set = (key, data) => {
    localStorage.removeItem(key);
    localStorage.setItem(key, JSON.stringify(data));
} 

const get = (key, orDefault) => {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : !!orDefault ? orDefault : null
}

export const StorageUtil = {
    set,
    get
}