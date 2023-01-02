import path from 'path';
const __dirname = path.resolve();
export const staticDir = path.join(__dirname, '/App');
export const PORT = process.env.PORT || 6502;
