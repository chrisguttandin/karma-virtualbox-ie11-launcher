const { uuidFromVMName } = require('../../../src/functions/uuid-from-vm-name');
const { stub } = require('sinon');

describe('uuidFromVMName', () => {

    let execute;
    let log;

    beforeEach(() => {
        execute = stub();
        log = { info () { } };
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
                uuidFromVMName(execute, 'IE11 - Win81', null, log)
                    .catch((err) => {
                        expect(err).to.equal(error);
                        expect(execute).to.have.been.calledOnce;

                        done();
                    });
            });

        });

        describe('without an available VM with the given name', () => {

            beforeEach(() => {
                execute.resolves('"IE11 - Win81" {c9b3b190-bd7d-41ef-a788-787f5ebc9099}\n"MSEdge - Win10" {8c04d25b-53da-46db-9f91-5f6951bd6846}');
            });

            it('should throw an error', (done) => {
                uuidFromVMName(execute, 'pancakes', null, log)
                    .catch((err) => {
                        expect(err.message).to.equal("No virtual machine installed named 'pancakes'");
                        expect(execute).to.have.been.calledOnce;

                        done();
                    });
            });

        });

        describe('with one available VM with the given name', () => {

            let uuid;

            beforeEach(() => {
                uuid = 'c9b3b190-bd7d-41ef-a788-787f5ebc9099';

                execute.resolves(`"IE11 - Win81" {${ uuid }}\n"MSEdge - Win10" {8c04d25b-53da-46db-9f91-5f6951bd6846}`);
            });

            it('should return the uuid', async () => {
                expect(await uuidFromVMName(execute, 'IE11 - Win81', null, log)).to.equal(uuid);
                expect(execute).to.have.been.calledOnce;
            });

        });

        describe('with one available VM which partially matches the given name', () => {

            let uuid;

            beforeEach(() => {
                uuid = '8c04d25b-53da-46db-9f91-5f6951bd6846';

                execute.resolves(`"IE11 - Win81" {c9b3b190-bd7d-41ef-a788-787f5ebc9099}\n"MSEdge - Win10" {${ uuid }}`);
            });

            it('should throw an error', (done) => {
                uuidFromVMName(execute, 'Edge', null, log)
                    .catch((err) => {
                        expect(err.message).to.equal("No virtual machine installed named 'Edge'");
                        expect(execute).to.have.been.calledOnce;

                        done();
                    });
            });

        });

        describe('with multiple available VMs which partially match the given name', () => {

            let uuid;

            beforeEach(() => {
                uuid = 'c9b3b190-bd7d-41ef-a788-787f5ebc9099';

                execute.resolves(`"IE11 - Win81" {${ uuid }}\n"MSEdge - Win10" {8c04d25b-53da-46db-9f91-5f6951bd6846}`);
            });

            it('should throw an error', (done) => {
                uuidFromVMName(execute, 'Win', null, log)
                    .catch((err) => {
                        expect(err.message).to.equal("No virtual machine installed named 'Win'");
                        expect(execute).to.have.been.calledOnce;

                        done();
                    });
            });

        });

    });

});
