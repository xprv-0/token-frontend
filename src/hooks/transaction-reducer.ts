export enum TxStatus {
  Default,
  Requested,
  Pending,
  Complete,
  Error,
}

export interface TransactionState {
  // claim form state
  txState: TxStatus;
  txData: {
    hash: string | null;
    receipt: object | null;
    error: Error | null;
    userFacingError?: Error | null;
  };
}

export const initialState: TransactionState = {
  // claim tx
  txState: TxStatus.Default,
  txData: {
    hash: null,
    receipt: null,
    error: null,
    userFacingError: null,
  },
};

const substituteErrorMessage = (
  errMessage: string,
  errorSubstitutions: { [errMessage: string]: string }
): Error => {
  let newErrorMessage = errorSubstitutions.unknown;

  Object.keys(errorSubstitutions).forEach((errorSubstitutionKey) => {
    if (errMessage.includes(errorSubstitutionKey)) {
      newErrorMessage = errorSubstitutions[errorSubstitutionKey];
    }
  });
  return new Error(newErrorMessage);
};

export type TransactionAction =
  | {
      type: "TX_RESET";
    }
  | {
      type: "TX_REQUESTED";
    }
  | {
      type: "TX_SUBMITTED";
      txHash: string;
    }
  | {
      type: "TX_COMPLETE";
      receipt: any;
    }
  | {
      type: "TX_ERROR";
      error: Error;
      errorSubstitutions: { [errMessage: string]: string };
    }
  | {
      type: "ERROR";
      error: Error;
    };

export function transactionReducer(
  state: TransactionState,
  action: TransactionAction
) {
  switch (action.type) {
    case "TX_RESET":
      return {
        ...state,
        txState: TxStatus.Default,
        txData: {
          hash: null,
          receipt: null,
          error: null,
        },
      };
    case "TX_REQUESTED":
      return {
        ...state,
        txState: TxStatus.Requested,
      };
    case "TX_SUBMITTED": {
      return {
        ...state,
        txState: TxStatus.Pending,
        txData: {
          ...state.txData,
          hash: action.txHash,
        },
      };
    }
    case "TX_COMPLETE":
      return {
        ...state,
        txState: TxStatus.Complete,
        txData: {
          ...state.txData,
          receipt: action.receipt,
        },
      };
    case "TX_ERROR":
      return {
        ...state,
        txState: TxStatus.Error,
        txData: {
          ...state.txData,
          userFacingError: substituteErrorMessage(
            action.error.message,
            action.errorSubstitutions
          ),
          error: action.error,
        },
      };
    case "ERROR":
      return {
        ...state,
        error: action.error,
      };
    default:
      return state;
  }
}
