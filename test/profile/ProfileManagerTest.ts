import { KeyPairFactory } from '../../src/utils/keypair/KeyPairFactory';
import { KeyPairHelper } from '../../src/utils/keypair/KeyPairHelper';
import { BehaviorSubject } from 'rxjs/Rx';
import Account from '../../src/repository/models/Account';
import { ProfileManager } from '../../src/manager/ProfileManager';
import ClientDataRepositoryImplMock from './ClientDataRepositoryImplMock';
import { CryptoUtils } from '../../src/utils/CryptoUtils';
import { RpcTransport } from '../../src/repository/source/rpc/RpcTransport';
import { EthWalletVerificationCodes } from '../../src/utils/types/BaseEthUtils';
import { EthAddrRecord, EthWallets } from '../../src/utils/types/BaseTypes';
import { TransportFactory } from '../../src/repository/source/TransportFactory';
import AuthenticatorHelper from '../AuthenticatorHelper';
import { RemoteSigner } from '../../src/utils/keypair/RemoteSigner';

const should = require('chai')
    .use(require('chai-as-promised'))
    .should();

describe('Profile Manager', async () => {
    const passPhraseAlisa: string = 'I\'m Alisa. This is my secret password';
    const passPhraseBob: string = 'I\'m Bob. This is my secret password';

    const rpcSignerHost: string = 'http://localhost:3545';

    const rpcTransport: RpcTransport = TransportFactory.createJsonRpcHttpTransport(rpcSignerHost);
    const authenticatorHelper: AuthenticatorHelper = new AuthenticatorHelper(rpcTransport);

    const keyPairHelperAlisa: KeyPairHelper = KeyPairFactory.createRpcKeyPair(rpcTransport);
    const keyPairHelperBob: KeyPairHelper = KeyPairFactory.createRpcKeyPair(rpcTransport);

    const clientRepository: ClientDataRepositoryImplMock = new ClientDataRepositoryImplMock();

    const accountAlisa: Account;
    const authAccountBehaviorAlisa: BehaviorSubject<Account>;

    const profileManager: ProfileManager;

    before(async () => {
        const alisaAccessToken = await authenticatorHelper.generateAccessToken(passPhraseAlisa);
        const bobAccessToken = await authenticatorHelper.generateAccessToken(passPhraseBob);

        (keyPairHelperAlisa as RemoteSigner).setAccessToken(alisaAccessToken);
        (keyPairHelperBob as RemoteSigner).setAccessToken(bobAccessToken);

        await keyPairHelperAlisa.createKeyPair('');
        await keyPairHelperBob.createKeyPair('');

        accountAlisa = new Account((await keyPairHelperAlisa.createKeyPair('')).publicKey);
        authAccountBehaviorAlisa = new BehaviorSubject<Account>(accountAlisa);

        profileManager = new ProfileManager(
            clientRepository,
            authAccountBehaviorAlisa,
            keyPairHelperAlisa,
            keyPairHelperAlisa,
            keyPairHelperAlisa
        );
    });

    beforeEach(function (done) {
        clientRepository.clearData();
        done();
    });

    after(async () => {
        rpcTransport.disconnect();
    });

    it('update data and validate updated data', async () => {
        const origMockData: Map<string, string> = new Map();
        const mockData: Map<string, string> = new Map();

        origMockData.set('email', 'im@host.com');

        const data = await profileManager.updateData(origMockData);
        const savedData = await profileManager.getRawData(authAccountBehaviorAlisa.getValue().publicKey);
        const savedDecrypted = await profileManager.getData();

        savedData.should.be.deep.equal(data);
        savedDecrypted.should.be.deep.equal(origMockData);
    });

});
