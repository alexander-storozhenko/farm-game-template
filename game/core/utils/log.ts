export const info = (...messages: any[]) => {
    console.log('🔵', ...messages)
}

export const error = (...messages: any[]) => {
    console.trace('🔴', ...messages)
}

export const debug = (...messages: any[]) => {
    console.log('🟣', ...messages)
}