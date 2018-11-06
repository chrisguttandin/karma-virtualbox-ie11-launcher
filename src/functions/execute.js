const { spawn } = require('child_process');
const spawnargs = require('spawn-args');

module.exports.execute = (command, log) => {
    const chunks = [];
    const tokens = command.split(/\s/);
    const shell = spawn(tokens.shift(), spawnargs(tokens.join(' '), { removequotes: 'always' }));

    shell.stderr.on('readable', () => {
        const chunk = shell.stderr.read();

        if (chunk !== null) {
            log.warn(chunk.toString());
        }
    });

    shell.stdout.on('readable', () => {
        const chunk = shell.stdout.read();

        if (chunk !== null) {
            chunks.push(chunk.toString());
        }
    });

    return new Promise((resolve, reject) => {
        shell.on('error', (err) => {
            reject(err);
        });

        shell.on('exit', (code) => {
            if (code === 0) {
                resolve(chunks.join(''));
            } else {
                reject(code);
            }
        });
    });
};
