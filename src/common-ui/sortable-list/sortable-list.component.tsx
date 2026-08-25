import {
  draggable,
  dropTargetForElements,
  monitorForElements,
} from '@atlaskit/pragmatic-drag-and-drop/adapter/element-adapter';
import React, {
  type ReactNode,
  type RefCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

export type SortableDragHandleRef = RefCallback<HTMLElement>;

interface SortableItemRenderProps {
  dragHandleRef: SortableDragHandleRef;
  isDragging: boolean;
}

interface SortableListProps<T> {
  items: T[];
  getItemId: (item: T) => string;
  onReorder: (sourceIndex: number, destinationIndex: number) => void;
  children: (
    item: T,
    index: number,
    renderProps: SortableItemRenderProps,
  ) => ReactNode;
  disabled?: boolean;
  className?: string;
}

interface SortableItemProps<T> {
  item: T;
  index: number;
  itemId: string;
  listId: string;
  disabled: boolean;
  children: SortableListProps<T>['children'];
}

type ClosestEdge = 'top' | 'bottom';

interface SortableItemData {
  sortableListId: string;
  sortableItemId: string;
  sortableItemIndex: number;
  closestEdge?: ClosestEdge;
}

let sortableListIdCounter = 0;

const getSortableItemData = (
  data: Record<string | symbol, unknown>,
): SortableItemData | undefined => {
  if (
    typeof data.sortableListId !== 'string' ||
    typeof data.sortableItemId !== 'string' ||
    typeof data.sortableItemIndex !== 'number'
  ) {
    return undefined;
  }

  return data as unknown as SortableItemData;
};

const getClosestEdge = (
  element: Element,
  clientY: number,
): ClosestEdge => {
  const rect = element.getBoundingClientRect();
  return clientY < rect.top + rect.height / 2 ? 'top' : 'bottom';
};

const getDestinationIndex = (
  sourceIndex: number,
  targetIndex: number,
  closestEdge: ClosestEdge,
) => {
  if (sourceIndex === targetIndex) {
    return sourceIndex;
  }

  if (sourceIndex < targetIndex) {
    return closestEdge === 'bottom' ? targetIndex : targetIndex - 1;
  }

  return closestEdge === 'top' ? targetIndex : targetIndex + 1;
};

const applyRoundedDragPreviewClip = (element: HTMLElement) => {
  const previewContent = element.firstElementChild;
  if (!previewContent) {
    return;
  }

  const borderRadius = window.getComputedStyle(previewContent).borderRadius;
  if (!borderRadius || borderRadius === '0px') {
    return;
  }

  const previousClipPath = element.style.clipPath;
  const previousOverflow = element.style.overflow;
  element.style.clipPath = `inset(0 round ${borderRadius})`;
  element.style.overflow = 'hidden';

  return () => {
    element.style.clipPath = previousClipPath;
    element.style.overflow = previousOverflow;
  };
};

const SortableItem = <T,>({
  item,
  index,
  itemId,
  listId,
  disabled,
  children,
}: SortableItemProps<T>) => {
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  const [dragHandle, setDragHandle] = useState<HTMLElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const previousTopRef = useRef<number>();
  const moveAnimationRef = useRef<Animation>();
  const restoreDragPreviewStylesRef = useRef<() => void>();

  useLayoutEffect(() => {
    if (!element) {
      return;
    }

    const currentTop = element.getBoundingClientRect().top;
    const previousTop = previousTopRef.current;
    previousTopRef.current = currentTop;

    if (
      previousTop === undefined ||
      previousTop === currentTop ||
      isDragging ||
      typeof element.animate !== 'function'
    ) {
      return;
    }

    moveAnimationRef.current?.cancel();
    moveAnimationRef.current = element.animate(
      [
        { transform: `translateY(${previousTop - currentTop}px)` },
        { transform: 'translateY(0)' },
      ],
      {
        duration: 160,
        easing: 'ease-out',
      },
    );

    return () => moveAnimationRef.current?.cancel();
  }, [element, index, isDragging]);

  useEffect(() => {
    if (disabled || !element || !dragHandle) {
      return;
    }

    const cleanupDraggable = draggable({
      element,
      dragHandle,
      getInitialData: () => ({
        sortableListId: listId,
        sortableItemId: itemId,
        sortableItemIndex: index,
      }),
      onGenerateDragPreview: () => {
        restoreDragPreviewStylesRef.current?.();
        restoreDragPreviewStylesRef.current =
          applyRoundedDragPreviewClip(element);
      },
      onDragStart: () => {
        restoreDragPreviewStylesRef.current?.();
        restoreDragPreviewStylesRef.current = undefined;
        setIsDragging(true);
      },
      onDrop: () => {
        restoreDragPreviewStylesRef.current?.();
        restoreDragPreviewStylesRef.current = undefined;
        const activeElement = document.activeElement;
        if (
          activeElement instanceof HTMLElement &&
          element.contains(activeElement)
        ) {
          activeElement.blur();
        }
        setIsDragging(false);
      },
    });

    return () => {
      restoreDragPreviewStylesRef.current?.();
      restoreDragPreviewStylesRef.current = undefined;
      cleanupDraggable();
    };
  }, [disabled, dragHandle, element, index, itemId, listId]);

  useEffect(() => {
    if (disabled || !element) {
      return;
    }

    return dropTargetForElements({
      element,
      canDrop: ({ source }) => source.data.sortableListId === listId,
      getData: ({ input }) => ({
        sortableListId: listId,
        sortableItemId: itemId,
        sortableItemIndex: index,
        closestEdge: getClosestEdge(element, input.clientY),
      }),
    });
  }, [disabled, element, index, itemId, listId]);

  const classNames = ['sortable-list-item'];
  if (isDragging) {
    classNames.push('sortable-list-item--dragging');
  }

  return (
    <div
      className={classNames.join(' ')}
      data-sortable-item-id={itemId}
      ref={setElement}>
      {children(item, index, {
        dragHandleRef: setDragHandle,
        isDragging,
      })}
    </div>
  );
};

export const SortableListComponent = <T,>({
  items,
  getItemId,
  onReorder,
  children,
  disabled = false,
  className,
}: SortableListProps<T>) => {
  const [listId] = useState(
    () => `keychain-sortable-list-${++sortableListIdCounter}`,
  );
  const itemsRef = useRef(items);
  const getItemIdRef = useRef(getItemId);
  const onReorderRef = useRef(onReorder);
  const dragStartItemsRef = useRef<T[]>();
  const previewItemsRef = useRef<T[]>();
  const [previewItems, setPreviewItems] = useState<T[]>();

  useEffect(() => {
    itemsRef.current = items;
    getItemIdRef.current = getItemId;
    onReorderRef.current = onReorder;
  }, [getItemId, items, onReorder]);

  useEffect(() => {
    if (disabled) {
      return;
    }

    const updatePreviewOrder = (
      sourceData: SortableItemData,
      targetData: SortableItemData,
    ) => {
      if (!targetData.closestEdge) {
        return;
      }

      const currentItems = previewItemsRef.current ?? itemsRef.current;
      const sourceIndex = currentItems.findIndex(
        (item) =>
          getItemIdRef.current(item) === sourceData.sortableItemId,
      );
      const targetIndex = currentItems.findIndex(
        (item) =>
          getItemIdRef.current(item) === targetData.sortableItemId,
      );
      if (sourceIndex < 0 || targetIndex < 0) {
        return;
      }

      const destinationIndex = getDestinationIndex(
        sourceIndex,
        targetIndex,
        targetData.closestEdge,
      );
      if (destinationIndex === sourceIndex) {
        return;
      }

      const reorderedItems = Array.from(currentItems);
      const [movedItem] = reorderedItems.splice(sourceIndex, 1);
      reorderedItems.splice(destinationIndex, 0, movedItem);
      previewItemsRef.current = reorderedItems;
      setPreviewItems(reorderedItems);
    };

    return monitorForElements({
      canMonitor: ({ source }) => source.data.sortableListId === listId,
      onDragStart: () => {
        const initialItems = Array.from(itemsRef.current);
        dragStartItemsRef.current = initialItems;
        previewItemsRef.current = initialItems;
        setPreviewItems(initialItems);
      },
      onDrag: ({ location, source }) => {
        const sourceData = getSortableItemData(source.data);
        const targetData = getSortableItemData(
          location.current.dropTargets[0]?.data ?? {},
        );
        if (
          sourceData &&
          targetData &&
          targetData.sortableListId === listId
        ) {
          updatePreviewOrder(sourceData, targetData);
        }
      },
      onDrop: ({ location, source }) => {
        const sourceData = getSortableItemData(source.data);
        const targetData = getSortableItemData(
          location.current.dropTargets[0]?.data ?? {},
        );
        if (
          !sourceData ||
          !targetData ||
          sourceData.sortableListId !== listId ||
          targetData.sortableListId !== listId
        ) {
          dragStartItemsRef.current = undefined;
          previewItemsRef.current = undefined;
          setPreviewItems(undefined);
          return;
        }

        updatePreviewOrder(sourceData, targetData);

        const initialItems = dragStartItemsRef.current ?? itemsRef.current;
        const finalItems = previewItemsRef.current ?? initialItems;
        const sourceIndex = initialItems.findIndex(
          (item) =>
            getItemIdRef.current(item) === sourceData.sortableItemId,
        );
        const destinationIndex = finalItems.findIndex(
          (item) =>
            getItemIdRef.current(item) === sourceData.sortableItemId,
        );
        if (
          sourceIndex >= 0 &&
          destinationIndex >= 0 &&
          destinationIndex !== sourceIndex
        ) {
          onReorderRef.current(sourceIndex, destinationIndex);
        }

        dragStartItemsRef.current = undefined;
        previewItemsRef.current = undefined;
        setPreviewItems(undefined);
      },
    });
  }, [disabled, listId]);

  const displayedItems = previewItems ?? items;

  return (
    <div className={className}>
      {displayedItems.map((item, index) => {
        const itemId = getItemId(item);
        return (
          <SortableItem
            key={itemId}
            item={item}
            index={index}
            itemId={itemId}
            listId={listId}
            disabled={disabled}
            children={children}
          />
        );
      })}
    </div>
  );
};
