import React from 'react';
import { Controller, FieldValues } from 'react-hook-form';
import CheckboxComponent, {
  CheckboxProps,
} from 'src/common-ui/checkbox/checkbox/checkbox.component';

interface FormInputProps<T extends FieldValues = FieldValues, TContext = any>
  extends Omit<CheckboxProps, 'onChange' | 'checked'> {
  name: string;
  control: any;
  //   control: Control<T>;
  rules?: any;
  errors?: any;
}

export const CheckboxFormComponent = (props: FormInputProps) => {
  return (
    <Controller
      name={props.name}
      control={props.control}
      rules={props.rules}
      render={({ field: { onChange, value } }) => (
        <CheckboxComponent {...props} checked={value} onChange={onChange} />
      )}
    />
  );
};
