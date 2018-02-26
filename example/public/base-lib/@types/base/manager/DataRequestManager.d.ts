import { DataRequestRepository } from '../repository/requests/DataRequestRepository';
import { MessageEncrypt } from '../utils/keypair/MessageEncrypt';
import { MessageDecrypt } from '../utils/keypair/MessageDecrypt';
import DataRequest from '../repository/models/DataRequest';
import { DataRequestState } from '../repository/models/DataRequestState';
export default class DataRequestManager {
    private dataRequestRepository;
    private encrypt;
    private decrypt;
    constructor(dataRequestRepository: DataRequestRepository, encrypt: MessageEncrypt, decrypt: MessageDecrypt);
    createRequest(recipientPk: string, fields: Array<string>): Promise<string>;
    responseToRequest(requestId: number, senderPk: string, fields?: Array<string>): Promise<DataRequestState>;
    getRequests(fromPk: string | undefined, toPk: string | undefined, state: DataRequestState): Promise<Array<DataRequest>>;
    decryptMessage<T>(senderPk: string, encrypted: string): T;
}