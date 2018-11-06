const UUID_REGEX = /^UUID="([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})"$/m;

module.exports.uuidFromVMName = (execute, vmName, uuid, log) => {
    if (uuid) {
        return Promise.resolve(uuid);
    }

    log.info(`Running 'VBoxManage list vms' to locate installed VM named '${ vmName }'`);

    return execute(`VBoxManage showvminfo "${ vmName }" --machinereadable`, log)
        .then((result) => UUID_REGEX.exec(result))
        .then((result) => {
            if (result === null) {
                throw new Error(`The result returned from 'VBoxManage showvminfo "${ vmName }" --machinereadable' was not parseable.`);
            }

            return result[1];
        });
};
