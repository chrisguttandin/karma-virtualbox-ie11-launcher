const UUID_REGEX = /^UUID="(?<uuid>[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12})"$/m;

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

            return result.groups.uuid;
        });
};
