import React, { BaseSyntheticEvent, useEffect, useState } from 'react';
import { FieldError } from 'react-hook-form';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { Separator } from 'src/common-ui/separator/separator.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { FormUtils } from 'src/utils/form.utils';

export interface TextAreaProps {
  value: any;
  logo?: string | SVGIcons;
  logoPosition?: 'left' | 'right';
  label?: string;
  placeholder?: string;
  skipLabelTranslation?: boolean;
  skipPlaceholderTranslation?: boolean;
  hint?: string;
  skipHintTranslation?: boolean;
  translateSimpleAutoCompleteValues?: boolean;
  required?: boolean;
  error?: FieldError;
  dataTestId?: string;
  disabled?: boolean;
  classname?: string;
  onChange: (value: any) => void;
  rightActionClicked?(): any;
  rightActionIcon?: SVGIcons;
  rightActionIconClassname?: string;
  rows?: number;
  useChips?: boolean;
  maxChips?: number;
}

const TextArea = React.forwardRef((props: TextAreaProps, ref: any) => {
  const [isFocused, setIsFocused] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [localValue, setLocalValue] = useState('');
  const [chips, setChips] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
    return function cleanup() {
      setMounted(false);
    };
  }, []);

  const addChips = () => {
    if (
      chips.includes(localValue) ||
      (props.maxChips && chips.length + 1 > props.maxChips)
    )
      return;
    const newChips = [...chips, localValue];
    setChips(newChips);
    setLocalValue('');
    props.onChange(newChips);
  };

  const deleteChip = (chip: string) => {
    const newChips = chips.filter((c) => c !== chip);
    setChips(newChips);
    props.onChange(newChips);
  };

  const handleOnBlur = () => {
    if (mounted) {
      setTimeout(() => setIsFocused(false), 200);
    }
  };
  const handleOnFocus = () => {
    setIsFocused(true);
  };

  const handlePaste = (event: BaseSyntheticEvent) => {
    event.stopPropagation();
    event.preventDefault();

    const pastedData = (event as any).nativeEvent.clipboardData
      .getData('Text')
      .trim();

    if (props.useChips) {
      const newChips = [...chips, ...pastedData.split(' ')];
      setChips(newChips);
      props.onChange(newChips);
    } else {
      props.onChange(event.target.value);
    }
  };

  return (
    <div className={`custom-input ${props.classname ?? ''}`}>
      {props.label && (
        <div className="label">
          {props.skipLabelTranslation
            ? props.label
            : chrome.i18n.getMessage(props.label)}{' '}
          {props.required ? '*' : ''}
          {props.hint && (
            <div className="hint">
              {props.skipHintTranslation
                ? props.hint
                : chrome.i18n.getMessage(props.hint)}
            </div>
          )}
        </div>
      )}
      <div className={`custom-input-content ${props.error ? 'has-error' : ''}`}>
        <div
          className={`input-container ${props.useChips ? 'use-chips' : ''} ${
            props.logo ? `has-${props.logoPosition ?? 'left'}-logo` : 'no-logo'
          }  ${isFocused ? 'focused' : ''}`}>
          {chips.map((chip) => (
            <div className="chip" key={`chip-${chip}`}>
              <div className="chip-label">{chip}</div>
              <SVGIcon
                icon={SVGIcons.GLOBAL_DELETE}
                className="chip-delete"
                onClick={() => deleteChip(chip)}
              />
            </div>
          ))}
          {
            <textarea
              disabled={props.disabled}
              data-testid={props.dataTestId}
              ref={ref}
              placeholder={`${
                props.placeholder
                  ? props.skipPlaceholderTranslation
                    ? props.placeholder
                    : chrome.i18n.getMessage(props.placeholder)
                  : ''
              } ${props.required ? '*' : ''}`}
              value={props.useChips ? localValue : props.value}
              onChange={(e) =>
                props.useChips
                  ? setLocalValue(e.target.value)
                  : props.onChange(e.target.value)
              }
              onKeyPress={(e) => {
                if (e.key === ' ' && props.useChips) {
                  addChips();
                }
              }}
              onFocus={() => handleOnFocus()}
              onBlur={() => handleOnBlur()}
              onPaste={($event) => handlePaste($event)}
              className={`${
                props.useChips &&
                props.maxChips &&
                chips.length >= props.maxChips
                  ? 'force-hide'
                  : ''
              }`}
            />
          }

          {!props.disabled && props.value && props.value.length > 0 && (
            <SVGIcon
              dataTestId="input-clear"
              icon={SVGIcons.INPUT_CLEAR}
              className={`input-img erase right ${
                props.logoPosition === 'right' ? 'has-right-logo' : ''
              }`}
              onClick={() => {
                props.onChange('');
                setLocalValue('');
                setChips([]);
              }}
            />
          )}

          {props.logo && (
            <SVGIcon
              icon={props.logo as SVGIcons}
              className={`input-img ${props.logoPosition ?? 'left'}`}
            />
          )}
        </div>

        {props.rightActionClicked && props.rightActionIcon && (
          <div className="right-action">
            <Separator type={'vertical'} />
            <SVGIcon
              className={`right-action-logo ${
                props.rightActionIconClassname ?? ''
              }`}
              data-testid="right-action"
              icon={props.rightActionIcon}
              onClick={props.rightActionClicked}
            />
          </div>
        )}
      </div>
      {props.error && (
        <div className="error">{FormUtils.parseJoiError(props.error)}</div>
      )}
    </div>
  );
});

export const TextAreaComponent = TextArea;
