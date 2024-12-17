const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const currentDate = new Date();

export function getCurrentMonth() {
    return months[currentDate.getMonth()] ?? 'Unknown';
}

export function getCurrentDay() {
    return currentDate.getDate();
}

export function getCurrentYear() {
    return currentDate.getFullYear();
}

export function getCurrentDate() {
    return `${getCurrentDay()} ${getCurrentMonth()} ${getCurrentYear()}`;
}

export function generateUID() {
    const timestamp = Date.now();
    const randomValue = Math.random().toString(36).substring(2, 10);
    return `order-${timestamp}-${randomValue}`;
}