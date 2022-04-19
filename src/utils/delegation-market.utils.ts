import {
  DelegationRequest,
  DelegationRequestStatus,
} from '@popup/pages/app-container/home/delegation-market/delegation-market.interface';

const downloadAllProposals = async (): Promise<DelegationRequest[]> => {
  return [
    {
      id: 'baf891a4-bf86-11ec-9d64-0242ac120002',
      creationDate: new Date('01/27/2022 02:00:54 AM'),
      creator: 'cedricguillas',
      days: 20,
      payAmount: 20,
      payCurrency: 'hive',
      status: DelegationRequestStatus.PENDING,
      value: 1000,
    },
    {
      id: 'baf891a4-bf86-11ec-9d64-0242ac120003',
      creationDate: new Date('03/28/2022 08:22:09 AM'),
      creator: 'stoodkev',
      days: 20,
      payAmount: 50,
      payCurrency: 'hive',
      status: DelegationRequestStatus.PENDING,
      value: 500,
    },
    {
      id: 'baf891a4-bf86-11ec-9d64-0242ac120004',
      creationDate: new Date('01/20/2022 12:22:34 PM'),
      activatedDate: new Date('04/13/2022 11:40:38 PM'),
      creator: 'apayo',
      days: 5,
      payAmount: 100,
      payCurrency: 'hbd',
      status: DelegationRequestStatus.ACTIVE,
      value: 1000,
      delegator: 'stoodkev',
    },
    {
      id: 'baf891a4-bf86-11ec-9d64-0242ac120005',
      creationDate: new Date('04/12/2022 02:57:31 PM'),
      creator: 'lecaillon',
      days: 20,
      payAmount: 20,
      payCurrency: 'hive',
      status: DelegationRequestStatus.FINISHED,
      value: 200,
      delegator: 'cedricguillas',
    },
    {
      id: 'baf891a4-bf86-11ec-9d64-0242ac120006',
      creationDate: new Date('04/12/2022 02:57:31 PM'),
      activatedDate: new Date('04/13/2022 11:40:38 PM'),
      creator: 'apayo',
      days: 20,
      payAmount: 20,
      payCurrency: 'hive',
      status: DelegationRequestStatus.ACTIVE,
      value: 200,
      delegator: 'cedricguillas',
    },
  ];
};

export const DelegationMarketUtils = {
  downloadAllProposals,
};
