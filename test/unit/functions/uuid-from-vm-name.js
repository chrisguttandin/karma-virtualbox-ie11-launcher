const { uuidFromVMName } = require('../../../src/functions/uuid-from-vm-name');
const { stub } = require('sinon');

describe('uuidFromVMName', () => {
    let execute;
    let log;

    beforeEach(() => {
        execute = stub();
        log = { info() {} };
    });

    describe('with a provided uuid', () => {
        let uuid;

        beforeEach(() => {
            uuid = 'c9b3b190-bd7d-41ef-a788-787f5ebc9099';
        });

        it('should return the uuid', async () => {
            expect(await uuidFromVMName(execute, 'IE11 - Win81', uuid, log)).to.equal(uuid);
            expect(execute).to.have.not.been.called;
        });
    });

    describe('without a provided uuid', () => {
        describe('with an error thrown from execute', () => {
            let error;

            beforeEach(() => {
                error = new Error('a fake error');

                execute.rejects(error);
            });

            it('should rethrow the error', (done) => {
                uuidFromVMName(execute, 'IE11 - Win81', null, log).catch((err) => {
                    expect(err).to.equal(error);
                    expect(execute).to.have.been.calledOnce;

                    done();
                });
            });
        });

        describe('with an unparseable response from execute', () => {
            beforeEach(() => {
                execute.resolves('an unparseable response');
            });

            it('should throw an error', (done) => {
                uuidFromVMName(execute, 'IE11 - Win81', null, log).catch((err) => {
                    expect(err.message).to.equal(
                        'The result returned from \'VBoxManage showvminfo "IE11 - Win81" --machinereadable\' was not parseable.'
                    );
                    expect(execute).to.have.been.calledOnce;

                    done();
                });
            });
        });

        describe('with a successful response from execute', () => {
            let uuid;

            beforeEach(() => {
                uuid = 'c9b3b190-bd7d-41ef-a788-787f5ebc9099';

                execute.resolves(`name="An Existing VM"
groups="/"
ostype="IE11 - Win81"
UUID="${uuid}"
CfgFile="/a/fake/directory/An Existing VM/An Existing VM.vbox"
SnapFldr="/a/fake/directory/An Existing VM/Snapshots"
LogFldr="/a/fake/directory/An Existing VM/Logs"
hardwareuuid="${uuid}"
memory=2048
...`);
            });

            it('should return the uuid', async () => {
                expect(await uuidFromVMName(execute, 'IE11 - Win81', null, log)).to.equal(uuid);
                expect(execute).to.have.been.calledOnce;
            });
        });
    });
});
