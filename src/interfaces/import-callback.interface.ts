export interface ImportWarning {
  message: string;
  params?: string[];
}

export interface ImportCallbackPayload {
  success: boolean;
  message: string;
  warning?: ImportWarning | null;
  accountType?: 'hive' | 'evm' | 'all';
  accounts?: any[];
}
