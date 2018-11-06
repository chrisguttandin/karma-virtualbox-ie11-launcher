function escapeRegExp (string) {
    // $& means the whole matched string
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports.uuidFromVMName = (execute, vmName, uuid, log) => {
    return new Promise((resolve, reject) => {
        if (uuid) {
            return resolve(uuid);
        }

        log.info(`Running 'VBoxManage list vms' to locate installed VM named '${ vmName }'`);
        execute('VBoxManage list vms', log)
            .then((result) => {
                const escapedVmName = escapeRegExp(vmName);
                // eslint-disable-next-line no-useless-escape
                const regex = new RegExp(escapedVmName + '.*\{(.+?)\}', 'igm');
                const m = regex.exec(result);

                if (m && m.length === 2) {
                    const parsedUuid = m[1];

                    log.info(`Located VM UUID '${ parsedUuid }'`);

                    return resolve(parsedUuid);
                }

                return reject(new Error(`No virtual machine installed named '${ vmName }'`));
            })
            .catch((err) => {
                return reject(err);
            });
    });
};
