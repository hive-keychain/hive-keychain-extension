import FlatList from 'flatlist-react';
import React, { useEffect, useRef, useState } from 'react';
import type { SelectMethods } from 'react-dropdown-select';
import Select, { SelectRenderer } from 'react-dropdown-select';
import { ChainLogo } from 'src/common-ui/chain-logo/chain-logo.component';
import { CustomSelectItemComponent } from 'src/common-ui/custom-select/custom-select-item.component';
import { SVGIcons } from 'src/common-ui/icons.enum';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { PreloadedImage } from 'src/common-ui/preloaded-image/preloaded-image.component';
import {
  SortableDragHandleRef,
  SortableListComponent,
} from 'src/common-ui/sortable-list/sortable-list.component';
import { SVGIcon } from 'src/common-ui/svg-icon/svg-icon.component';
import { ColorsUtils } from 'src/utils/colors.utils';
import { EnumUtils } from 'src/utils/enum.utils';

import { I18nUtils } from 'src/utils/i18n.utils';
export interface OptionItem {
  label: string;
  value: any;
  canDelete?: boolean;
  subLabel?: string;
  subLabelHover?: string;
  img?: string;
  /** When set, `img` uses the shared chain logo fallback if the URL is empty or fails to load. */
  imgChainName?: string;
  imgChip?: SVGIcons | string;
  /** When `imgChip` is a chain logo URL, used for initials if the URL is empty or fails to load. */
  imgChipChainName?: string;
  imgBackup?: string;
  key?: string;
}

export interface CustomSelectProps<T> {
  label?: string;
  skipLabelTranslation?: boolean;
  options: T[];
  selectedItem: T;
  setSelectedItem: (item: T) => void;
  background?: 'white';
  onDelete?: (...params: any) => void;
  filterable?: boolean;
  additionalClassname?: string;
  footer?: JSX.Element;
  formatSelectedItem?: (...params: any) => string;
  renderOnlyIcon?: boolean;
  rightActionIcon?: boolean;
  rightActionClicked?: () => void;
  generateImageIfNull?: boolean;
  skipImageGenerationForFirstItem?: boolean;
  minFilterLength?: number;
  customFilter?: JSX.Element;
  /** For tests / automation: identifies the dropdown arrow control. */
  selectHandleDataTestId?: string;
  showOverlay?: boolean;
  ariaLabel?: string;
  enableDragAndDrop?: boolean;
  onOptionsReorder?: (options: T[]) => void;
  droppableId?: string;
  placeholder?: string;
  skipPlaceholderTranslation?: boolean;
}

let customSelectIdCounter = 0;

export function ComplexeCustomSelect<T extends OptionItem>(
  itemProps: CustomSelectProps<T>,
) {
  const ref = useRef<HTMLInputElement>(null);
  const methodsRef = useRef<SelectMethods<T> | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const [filteredOptions, setFilteredOptions] = useState(itemProps.options);
  const [query, setQuery] = useState('');
  const [isOpened, setIsOpened] = useState(false);
  const [activeOptionIndex, setActiveOptionIndex] = useState<number>();
  const [selectId] = useState(
    () => `keychain-custom-select-${++customSelectIdCounter}`,
  );
  const optionsId = `${selectId}-options`;
  const hasSelectedLabel = Boolean(itemProps.selectedItem?.label);
  const placeholderLabel = itemProps.placeholder
    ? itemProps.skipPlaceholderTranslation
      ? itemProps.placeholder
      : I18nUtils.getMessage(itemProps.placeholder)
    : '';
  const accessibleLabel =
    itemProps.ariaLabel ??
    (itemProps.label
      ? itemProps.skipLabelTranslation
        ? itemProps.label
        : I18nUtils.getMessage(itemProps.label)
      : itemProps.selectedItem.label || placeholderLabel || 'Dropdown select');

  useEffect(() => {
    setFilteredOptions(filter(query));
  }, [query, itemProps.options]);

  useEffect(() => {
    if (!isOpened || activeOptionIndex === undefined) {
      return;
    }

    requestAnimationFrame(() => {
      dropdownRef.current
        ?.querySelector<HTMLElement>(
          `#${optionsId}-option-${activeOptionIndex}`,
        )
        ?.scrollIntoView({ block: 'nearest' });
    });
  }, [activeOptionIndex, isOpened, optionsId]);

  const filter = (query: string) => {
    if (itemProps.minFilterLength && query.length < itemProps.minFilterLength) {
      return [];
    }
    return itemProps.options.filter(
      (option) =>
        option.label?.toLowerCase().includes(query.toLowerCase()) ||
        option.subLabel?.toLowerCase().includes(query.toLowerCase()),
    );
  };

  const isFirstSelectOption = (item: T): boolean => {
    const firstOption = itemProps.options[0];
    if (!firstOption) {
      return false;
    }

    return item.value === firstOption.value;
  };

  const shouldGenerateImageForItem = (item: T): boolean => {
    if (!itemProps.generateImageIfNull || item.img) {
      return false;
    }

    if (
      itemProps.skipImageGenerationForFirstItem &&
      isFirstSelectOption(item)
    ) {
      return false;
    }

    return Boolean(item.label);
  };

  const closeDropdown = (restoreFocus: boolean) => {
    methodsRef.current?.dropDown('close');
    setActiveOptionIndex(undefined);

    if (restoreFocus) {
      setTimeout(() => methodsRef.current?.getSelectRef().focus());
    }
  };

  const openDropdown = (initialOptionIndex = 0) => {
    methodsRef.current?.dropDown('open');
    setActiveOptionIndex(initialOptionIndex);
  };

  const handleSelectKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const isFilterInput = event.target instanceof HTMLInputElement;
    const footer = dropdownRef.current?.querySelector<HTMLElement>(
      '.custom-select-footer button, .custom-select-footer [href], .custom-select-footer [tabindex]:not([tabindex="-1"])',
    );
    const isFooterFocused = !!footer?.contains(event.target as Node);

    if (!isOpened) {
      if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(event.key)) {
        event.preventDefault();
        openDropdown(event.key === 'ArrowUp' ? filteredOptions.length - 1 : 0);
      }
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      closeDropdown(true);
      return;
    }

    if (event.key === 'Tab') {
      if (isFooterFocused && event.shiftKey) {
        event.preventDefault();
        methodsRef.current?.getSelectRef().focus();
        return;
      }

      if (!isFooterFocused && !event.shiftKey && footer) {
        event.preventDefault();
        footer.focus();
        return;
      }

      closeDropdown(false);
      return;
    }

    if (isFooterFocused) {
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      setActiveOptionIndex((currentIndex) => {
        const nextIndex =
          (currentIndex ?? (direction > 0 ? -1 : 0)) + direction;
        return Math.min(
          Math.max(nextIndex, 0),
          Math.max(filteredOptions.length - 1, 0),
        );
      });
      return;
    }

    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      setActiveOptionIndex(
        event.key === 'Home' ? 0 : Math.max(filteredOptions.length - 1, 0),
      );
      return;
    }

    if (
      (event.key === 'Enter' || (event.key === ' ' && !isFilterInput)) &&
      activeOptionIndex !== undefined
    ) {
      const option = filteredOptions[activeOptionIndex];
      if (option) {
        event.preventDefault();
        itemProps.setSelectedItem(option);
        closeDropdown(true);
      }
    }
  };

  const customLabelRender = (selectProps: SelectRenderer<T>) => {
    methodsRef.current = selectProps.methods;
    const selectedLabel = itemProps.formatSelectedItem
      ? itemProps.formatSelectedItem(itemProps.selectedItem.label)
      : itemProps.selectedItem.label;
    const displayLabel = hasSelectedLabel ? selectedLabel : placeholderLabel;

    return (
      <div
        className={`selected-item ${itemProps.selectedItem?.imgChip ? 'has-img-chip' : ''} ${
          !hasSelectedLabel && placeholderLabel ? 'is-placeholder' : ''
        }`}
        onClick={() => {
          selectProps.methods.dropDown('close');
        }}>
        {(itemProps.selectedItem.img ||
          shouldGenerateImageForItem(itemProps.selectedItem) ||
          itemProps.selectedItem.imgChip) && (
          <>
            {itemProps.selectedItem.img &&
              EnumUtils.isValueOf(itemProps.selectedItem.img, SVGIcons) && (
                <SVGIcon
                  className="left-svg"
                  icon={itemProps.selectedItem.img as SVGIcons}
                />
              )}
            {itemProps.selectedItem.img &&
              itemProps.selectedItem.imgChainName &&
              !EnumUtils.isValueOf(itemProps.selectedItem.img, SVGIcons) && (
                <ChainLogo
                  className="left-image"
                  logoUri={itemProps.selectedItem.img}
                  chainName={itemProps.selectedItem.imgChainName}
                />
              )}
            {itemProps.selectedItem.img &&
              !itemProps.selectedItem.imgChainName &&
              !EnumUtils.isValueOf(itemProps.selectedItem.img, SVGIcons) && (
                <PreloadedImage
                  className="left-image"
                  src={itemProps.selectedItem.img}
                />
              )}
            {!itemProps.selectedItem.img &&
              shouldGenerateImageForItem(itemProps.selectedItem) && (
                <div
                  className="left-image chain-logo-initials"
                  style={{
                    backgroundColor: `${ColorsUtils.stringToColor(itemProps.selectedItem.label)}2b`,
                    color: ColorsUtils.stringToColor(
                      itemProps.selectedItem.label,
                    ),
                  }}>
                  {itemProps.selectedItem.label.slice(0, 2)}
                </div>
              )}
            {itemProps.selectedItem.imgChip && (
              <>
                {EnumUtils.isValueOf(
                  itemProps.selectedItem.imgChip,
                  SVGIcons,
                ) && (
                  <SVGIcon
                    className="left-svg-chip"
                    icon={itemProps.selectedItem.imgChip as SVGIcons}
                  />
                )}
                {!EnumUtils.isValueOf(
                  itemProps.selectedItem.imgChip,
                  SVGIcons,
                ) &&
                  itemProps.selectedItem.imgChipChainName && (
                    <ChainLogo
                      className="left-svg-chip"
                      logoUri={itemProps.selectedItem.imgChip as string}
                      chainName={itemProps.selectedItem.imgChipChainName}
                    />
                  )}
                {!EnumUtils.isValueOf(
                  itemProps.selectedItem.imgChip,
                  SVGIcons,
                ) &&
                  !itemProps.selectedItem.imgChipChainName && (
                    <PreloadedImage
                      className="left-svg-chip"
                      src={itemProps.selectedItem.imgChip as string}
                    />
                  )}
              </>
            )}
          </>
        )}
        {!itemProps.renderOnlyIcon && <span>{displayLabel}</span>}
      </div>
    );
  };

  const customHandleRenderer = ({
    props,
    state,
    methods,
  }: SelectRenderer<T>) => {
    methodsRef.current = methods;
    return (
      <SVGIcon
        className="custom-select-handle"
        dataTestId={itemProps.selectHandleDataTestId}
        icon={
          state.dropdown ? SVGIcons.SELECT_ARROW_UP : SVGIcons.SELECT_ARROW_DOWN
        }
      />
    );
  };

  const isDragAndDropEnabled =
    !!itemProps.enableDragAndDrop &&
    !!itemProps.onOptionsReorder &&
    !(itemProps.filterable && query.length > 0) &&
    !process.env.IS_FIREFOX;

  const getOptionDraggableId = (option: T) => {
    return option.key ?? `option-${option.label}`;
  };

  const renderSelectOption = (
    option: T,
    index: number,
    optionsLength: number,
    closeOptionsDropdown: () => void,
    dragHandleRef?: SortableDragHandleRef,
    isDragging = false,
  ) => (
    <CustomSelectItemComponent
      key={getOptionDraggableId(option)}
      isLast={index === optionsLength - 1}
      item={option}
      isSelected={option.value === itemProps.selectedItem.value}
      isKeyboardActive={index === activeOptionIndex}
      id={`${optionsId}-option-${index}`}
      handleItemClicked={() => {
        itemProps.setSelectedItem(option);
      }}
      closeDropdown={closeOptionsDropdown}
      onDelete={itemProps.onDelete}
      canDelete={
        option.canDelete && itemProps.selectedItem.value !== option.value
      }
      generateImageIfNull={shouldGenerateImageForItem(option)}
      enableDragAndDrop={isDragAndDropEnabled}
      dragHandleRef={dragHandleRef}
      isDragging={isDragging}
    />
  );

  const reorderOptions = (sourceIndex: number, destinationIndex: number) => {
    if (!itemProps.onOptionsReorder || destinationIndex === sourceIndex) return;

    const list = Array.from(filteredOptions);
    const [removed] = list.splice(sourceIndex, 1);
    list.splice(destinationIndex, 0, removed);
    itemProps.onOptionsReorder(list);
  };

  const renderOptionsList = (closeDropdown: () => void) => {
    if (!isDragAndDropEnabled) {
      return (
        <FlatList
          list={filteredOptions}
          renderItem={(option: T, index: number) =>
            renderSelectOption(
              option,
              index,
              filteredOptions.length,
              closeDropdown,
            )
          }
        />
      );
    }

    return (
      <SortableListComponent
        items={filteredOptions}
        getItemId={getOptionDraggableId}
        onReorder={reorderOptions}>
        {(option, index, { dragHandleRef, isDragging }) =>
          renderSelectOption(
            option,
            index,
            filteredOptions.length,
            closeDropdown,
            dragHandleRef,
            isDragging,
          )
        }
      </SortableListComponent>
    );
  };

  const customDropdownRenderer = ({ methods }: SelectRenderer<T>) => {
    methodsRef.current = methods;
    setTimeout(() => {
      ref.current?.focus();
    }, 200);
    return (
      <div ref={dropdownRef} className="custom-select-dropdown">
        {itemProps.filterable && !itemProps.customFilter && (
          <InputComponent
            onChange={setQuery}
            value={query}
            placeholder={''}
            type={InputType.TEXT}
            ref={ref}
            classname="filter-input"
            rightActionIcon={
              itemProps.rightActionIcon ? SVGIcons.WALLET_SEARCH : undefined
            }
            rightActionClicked={itemProps.rightActionClicked ?? undefined}
          />
        )}
        {itemProps.filterable &&
          !!itemProps.customFilter &&
          itemProps.customFilter}

        <div id={optionsId} className="custom-select-options" role="listbox">
          {renderOptionsList(() => closeDropdown(true))}
        </div>
        {itemProps.footer && (
          <div className="custom-select-footer">{itemProps.footer}</div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`custom-select-container ${
        itemProps.additionalClassname ?? ''
      } ${isOpened ? 'opened' : 'closed'}`}>
      {itemProps.label && (
        <div className="label">
          {itemProps.skipLabelTranslation
            ? itemProps.label
            : I18nUtils.getMessage(itemProps.label)}
        </div>
      )}
      <Select
        options={itemProps.options}
        onChange={() => undefined}
        dropdownHandleRenderer={customHandleRenderer}
        contentRenderer={customLabelRender}
        dropdownRenderer={customDropdownRenderer}
        additionalProps={{
          id: selectId,
          role: 'combobox',
          'aria-label': accessibleLabel,
          'aria-haspopup': 'listbox',
          'aria-controls': isOpened ? optionsId : undefined,
          'aria-expanded': isOpened,
          'aria-activedescendant':
            isOpened && activeOptionIndex !== undefined
              ? `${optionsId}-option-${activeOptionIndex}`
              : undefined,
          onKeyDown: handleSelectKeyDown,
        }}
        className={`custom-select ${
          itemProps.background ? itemProps.background : ''
        }`}
        values={[]}
        onDropdownOpen={() => {
          setIsOpened(true);
          setActiveOptionIndex(
            Math.max(
              filteredOptions.findIndex(
                (option) => option.value === itemProps.selectedItem.value,
              ),
              0,
            ),
          );
        }}
        onDropdownClose={() => {
          setIsOpened(false);
          setActiveOptionIndex(undefined);
        }}
      />
      {itemProps.showOverlay && (
        <div
          className={`overlay ${isOpened ? 'opened' : 'closed'}`}
          onClick={() => methodsRef.current?.dropDown('close')}
        />
      )}
    </div>
  );
}
