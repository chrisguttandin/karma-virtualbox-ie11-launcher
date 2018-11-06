const { execute } = require('./functions/execute');
const { uuidFromVMName } = require('./functions/uuid-from-vm-name');

function VirtualBoxIE11Browser (args, baseBrowserDecorator, logger) {
    baseBrowserDecorator(this);

    const kill = !args.keepAlive;
    const log = logger.create('launcher');
    const snapshot = args.snapshot;

    // Just override this method to prevent the inherited one to be executed.
    this._start = () => {};

    if (!args.uuid && !args.vmName) {
        log.error('Please specify the UUID or name of the virtual machine to use.');

        return;
    }

    this
        .on('kill', (done) => {
            if (kill) {
                uuidFromVMName(execute, args.vmName, args.uuid, log)
                    .then((uuid) => {
                        return execute(`VBoxManage controlvm {${ uuid }} acpipowerbutton`, log)
                            .then(() => done())
                            .catch(() => {
                                log.error('Failed to turn of the vitual machine.');

                                done();
                            });
                    })
                    .catch((err) => {
                        log.error(err);
                    });
            }

            done();
        })
        .on('start', (url) => {
            uuidFromVMName(execute, args.vmName, args.uuid, log)
                .then((uuid) => {
                    return execute('VBoxManage list runningvms', log)
                        .then((result) => {
                            if (!result.includes(`{${ uuid }}`)) {
                                let queue;

                                if (snapshot === undefined) {
                                    queue = Promise.resolve();
                                } else {
                                    queue = execute(`VBoxManage snapshot {${ uuid }} restore "${ snapshot }"`, log);
                                }

                                return queue
                                    .then(() => execute(`VBoxManage startvm {${ uuid }}`, log))
                                    // Wait for the LoggedInUsers to become 0.
                                    .then(() => execute(`VBoxManage guestproperty wait {${ uuid }} /VirtualBox/GuestInfo/OS/LoggedInUsers --timeout 1800000`, log))
                                    // Wait for the LoggedInUsers to become 1.
                                    .then(() => execute(`VBoxManage guestproperty wait {${ uuid }} /VirtualBox/GuestInfo/OS/LoggedInUsers --timeout 1800000`, log))
                                    .then(() => new Promise((resolve) => {
                                        // Wait one more minute to be sure that Windows is up and running.
                                        setTimeout(resolve, 60e3);
                                    }));
                            }

                            log.info('The virtual machine is already running.');
                        })
                        .then(() => {
                            return execute(`VBoxManage guestcontrol ${ uuid } --password Passw0rd! --username IEUser run --exe "C:\\Program Files\\Internet Explorer\\iexplore.exe" --wait-stderr --wait-stdout -- -extoff -private ${ url.replace(/localhost:/, '10.0.2.2:') }`, log);
                        })
                        .catch((err) => {
                            if (err === 1) {
                                log.error('Failed to start Microsoft Internet Explorer.');
                            } else {
                                log.error(err);
                            }
                        });
                })
                .catch((err) => {
                    log.error(err);
                });
        });

}

VirtualBoxIE11Browser.prototype.name = 'VirtualBoxIE11';

VirtualBoxIE11Browser.$inject = [ 'args', 'baseBrowserDecorator', 'logger' ];

module.exports = {
    'launcher:VirtualBoxIE11': [ 'type', VirtualBoxIE11Browser ]
};
