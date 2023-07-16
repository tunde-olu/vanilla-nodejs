const link = 'https://localhost:5000';

const parseUrl = new URL(link);

console.log(parseUrl.origin);
console.log(parseUrl.hostname);
console.log(parseUrl.host);
console.log(parseUrl.pathname);
