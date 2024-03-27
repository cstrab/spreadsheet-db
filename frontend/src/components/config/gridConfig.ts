import { CellChange, Id, MenuOption, SelectionMode, TextCell } from '@silevis/reactgrid';
import { DataItem, CustomColumn } from '../../interfaces/gridInterfaces';

export const handleCellsChanged = (setData: React.Dispatch<React.SetStateAction<DataItem[]>>) => (changes: CellChange[]) => {
  const textCellChanges = changes.filter(change => change.newCell.type === 'text') as CellChange<TextCell>[];

  setData((prevData: DataItem[]) => prevData.map((item: DataItem, idx: number) => {
    const change = textCellChanges.find(change => change.rowId === `item-${idx}`);
    if (change && change.newCell.type === 'text' && typeof item === 'object' && change.columnId !== 'id') {
      return { ...item, [change.columnId]: change.newCell.text };
    }
    return item;
  }));
};

export const handleColumnResize = (setColumns: React.Dispatch<React.SetStateAction<CustomColumn[]>>) => (columnId: Id, width: number) => {
  setColumns((prevColumns: CustomColumn[]) => {
    const columnIndex = prevColumns.findIndex(column => column.columnId === columnId);
    const updatedColumn = { ...prevColumns[columnIndex], width };
    return [...prevColumns.slice(0, columnIndex), updatedColumn, ...prevColumns.slice(columnIndex + 1)];
  });
};

export const handleContextMenu = (setData: React.Dispatch<React.SetStateAction<DataItem[]>>, setRemovedRowIds: React.Dispatch<React.SetStateAction<string[]>>) => (
  selectedRowIds: Id[],
  selectedColIds: Id[],
  selectionMode: SelectionMode,
  menuOptions: MenuOption[]
): MenuOption[] => {
    menuOptions = [
        ...menuOptions,
        {
          id: "addRow",
          label: "Add row",
          handler: () => {
            setData((prevData: DataItem[]) => {
              // Create a new row with default values
              const newRow = {}; // Adjust as needed
              return [...prevData, newRow];
            });
          }
        },
        {
          id: "removeRow",
          label: "Remove row",
          handler: () => {
            setData((prevData: DataItem[]) => {
              const updatedData = prevData.filter((_: any, idx: number) => !selectedRowIds.includes(`item-${idx}`));
              setRemovedRowIds((prevRemovedRowIds: string[]) => [...prevRemovedRowIds, ...selectedRowIds.map(String)]);
              return updatedData;
            });
          }
        }
      ];
  return menuOptions;
};
