// Service to get user's IP address
let cachedIP = null;

export async function getUserIP() {
    if (cachedIP) {
        return cachedIP;
    }

    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        cachedIP = data.ip;
        return cachedIP;
    } catch (error) {
        console.error('Failed to get IP address:', error);
        // Fallback to a default IP if the service fails
        return 'unknown';
    }
}

export function clearIPCache() {
    cachedIP = null;
} 