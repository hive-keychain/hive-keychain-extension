export interface PluginDefinition {
  title: string;
  description: string;
  generalSettings: PluginSetting[];
  userSettings: PluginSetting[];
}

export interface PluginSetting {
  key: string;
  title: string;
  hint: string;
  type: PluginSettingType;
  defaultValue?: string | DropdownSettingData;
  required?: boolean;
}

export interface InputSetting extends PluginSetting {
  inputType: string;
  min?: number;
  max?: number;
  step?: number;
  placeholder: string;
}

export interface CheckboxSetting extends PluginSetting {}

export interface DropdownSettingData {
  value: string;
  label: string;
}

export interface DropdownSetting extends PluginSetting {
  data: DropdownSettingData[];
}

export interface Plugin {
  extensionId: string;
  definition: PluginDefinition;
  data: PluginData[];
}

export interface PluginData {
  key: string;
  value: string;
}

export enum PluginSettingType {
  CHECKBOX = 'CHECKBOX',
  DROPDOWN = 'DROPDOWN',
  INPUT = 'INPUT',
}
