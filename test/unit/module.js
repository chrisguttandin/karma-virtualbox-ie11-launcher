const chai = require('chai'),
    rewire = require('rewire'),
    spies = require('chai-spies');

chai.use(spies);
const expect = chai.expect;
const virtualBoxIE11Launcher = require('../../src/module.js');
const rewiredLauncher = rewire('../../src/module.js');

describe('karma-virtualbox-ie11-launcher', () => {

    it('should export the launcher', () => {
        expect(virtualBoxIE11Launcher['launcher:VirtualBoxIE11']).to.not.be.undefined;
    });

    describe('#uuidFromVMName', () => {
        const uuidFromVMName = rewiredLauncher.__get__('uuidFromVMName');
        const execute = rewiredLauncher.__get__('execute');
        const log = {
            error: () => {},
            info: () => {},
            warn: () => {}
        };

        it('should return the uuid when uuid already provided', (done) => {
            const executeSpy = chai.spy(execute);

            uuidFromVMName('IE11 - Win81', 'c9b3b190-bd7d-41ef-a788-787f5ebc9099', null)
                .then((result) => {
                    expect(result).to.eq('c9b3b190-bd7d-41ef-a788-787f5ebc9099');
                    expect(executeSpy).to.not.have.been.called();
                    done();
                })
                .catch((err) => done(new Error(err)));
        });

        it('should fail when VirtualBox is not installed', (done) => {
            rewiredLauncher.__set__('execute', (command, logger) => {
                return execute('xxxVBoxManage list vms', logger);
            });
            uuidFromVMName('IE11 - Win81', null, log)
                .then((result) => {
                    done(new Error('uuidFromVMName should have failed, but it returned ' + result));
                })
                .catch((err) => {
                    expect(err).to.not.be.null;
                    rewiredLauncher.__set__('execute', execute);
                    done();
                });
        });

        it('should fail when no VM available by given name', (done) => {
            rewiredLauncher.__set__('execute', () => {
                return new Promise((resolve) => {
                    resolve('"IE11 - Win81" {c9b3b190-bd7d-41ef-a788-787f5ebc9099}\n"MSEdge - Win10" {8c04d25b-53da-46db-9f91-5f6951bd6846}');
                });
            });
            uuidFromVMName('pancakes', null, log)
                .then((result) => {
                    done(new Error('uuidFromVMName should not have returned ' + result));
                })
                .catch((err) => {
                    expect(err).to.not.be.null;
                    rewiredLauncher.__set__('execute', execute);
                    done();
                });
        });

        it('should succed when VM available by given name', (done) => {
            rewiredLauncher.__set__('execute', () => {
                return new Promise((resolve) => {
                    resolve('"IE11 - Win81" {c9b3b190-bd7d-41ef-a788-787f5ebc9099}\n"MSEdge - Win10" {8c04d25b-53da-46db-9f91-5f6951bd6846}');
                });
            });
            uuidFromVMName('IE11 - Win81', null, log)
                .then((result) => {
                    expect(result).to.eq('c9b3b190-bd7d-41ef-a788-787f5ebc9099');
                    rewiredLauncher.__set__('execute', execute);
                    done();
                })
                .catch((err) => done(new Error(err)));
        });

        it('should succed when VM available by partial match of given name', (done) => {
            rewiredLauncher.__set__('execute', () => {
                return new Promise((resolve) => {
                    resolve('"IE11 - Win81" {c9b3b190-bd7d-41ef-a788-787f5ebc9099}\n"MSEdge - Win10" {8c04d25b-53da-46db-9f91-5f6951bd6846}');
                });
            });
            uuidFromVMName('Edge', null, log)
                .then((result) => {
                    expect(result).to.eq('8c04d25b-53da-46db-9f91-5f6951bd6846');
                    rewiredLauncher.__set__('execute', execute);
                    done();
                })
                .catch((err) => done(new Error(err)));
        });

        it('should return first VM when multiple matches found', (done) => {
            rewiredLauncher.__set__('execute', () => {
                return new Promise((resolve) => {
                    resolve('"IE11 - Win81" {c9b3b190-bd7d-41ef-a788-787f5ebc9099}\n"MSEdge - Win10" {8c04d25b-53da-46db-9f91-5f6951bd6846}');
                });
            });
            uuidFromVMName('Win', null, log)
                .then((result) => {
                    expect(result).to.eq('c9b3b190-bd7d-41ef-a788-787f5ebc9099');
                    rewiredLauncher.__set__('execute', execute);
                    done();
                })
                .catch((err) => done(new Error(err)));
        });

    });
});
