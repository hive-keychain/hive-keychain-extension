export interface NoConfirm {
  [key: string]: NoConfirmWebsite;
}

export interface NoConfirmWebsite {
  [key: string]: NoConfirmWebsiteOperation;
}

export interface NoConfirmWebsiteOperation {
  [key: string]: boolean;
}
