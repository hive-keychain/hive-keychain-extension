export interface ImportWarning {
  message: string;
  params?: string[];
}

export interface ImportCallbackPayload {
  success: boolean;
  message: string;
  warning?: ImportWarning | null;
  accounts?: any[];
}
