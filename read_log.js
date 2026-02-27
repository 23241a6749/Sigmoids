const fs = require('fs');
try {
    const data = fs.readFileSync('build_output.log', 'utf8');
    console.log(data);
} catch (err) {
    try {
        const data = fs.readFileSync('build_output.log', 'utf16le');
        console.log(data);
    } catch (err2) {
        console.error('Failed to read log');
    }
}
