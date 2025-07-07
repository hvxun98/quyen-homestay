import React, { ReactNode, useEffect, useState } from 'react';

// material-ui
import { TreeItem } from '@mui/x-tree-view';
import { Checkbox, Typography } from '@mui/material';
import { Stack } from '@mui/material';

interface TreeItemProps {
  label: string | ReactNode;
  itemId: string;
  items?: TreeItemProps[];
  values?: any;
  functions?: any;
  children?: ReactNode;
  onChange?: (name: any, checked: boolean) => void;
}

const treeItemStyleCustom = {
  '& .MuiTreeItem-content.Mui-selected': {
    backgroundColor: 'transparent !important'
  },
  '& .MuiTreeItem-content.Mui-selected:hover': {
    backgroundColor: 'transparent !important'
  },
  '& .MuiTreeItem-content.Mui-selected:focus': {
    backgroundColor: 'transparent !important'
  },
  '& .MuiTreeItem-content.Mui-selected:active': {
    backgroundColor: 'transparent !important'
  },
  '& .MuiTreeItem-content': {
    backgroundColor: 'transparent !important',
    padding: 0
  },
  '& .MuiTreeItem-content:hover': {
    backgroundColor: 'transparent !important'
  },
  '& .MuiTreeItem-content:focus': {
    backgroundColor: 'transparent !important'
  },
  '& .MuiTreeItem-content:active': {
    backgroundColor: 'transparent !important'
  }
};

function TreeItemRole({ label, itemId, items, values, children, onChange = () => {} }: TreeItemProps) {
  const [isIndeterminate, setIsIndeterminate] = useState<boolean>(false);

  useEffect(() => {
    if (Boolean(items && items?.length > 0)) {
      const itemIds = items?.map((item: TreeItemProps) => item.itemId);
      const keysWithTrue = Object.keys(values).filter((key) => values[key] === true);

      const hasSome = itemIds?.some((item) => keysWithTrue.includes(item));
      const hasAll = itemIds?.every((item) => keysWithTrue.includes(item));
      setIsIndeterminate(Boolean(hasSome && !hasAll));
    }
  }, [values, items]);
  return (
    <TreeItem
      itemId={itemId}
      label={
        <Stack flexDirection={'row'} alignItems={'center'} onClick={(e) => e.stopPropagation()}>
          <Checkbox
            indeterminate={isIndeterminate}
            name={`${itemId}`}
            onChange={(e, checked) => onChange(itemId, checked)}
            checked={Boolean(values[itemId])}
          />
          <Typography whiteSpace={'nowrap'}>{label}</Typography>
        </Stack>
      }
      sx={treeItemStyleCustom}
    >
      {items?.map((item: TreeItemProps) => (
        <TreeItem
          key={item.itemId}
          itemId={item.itemId}
          label={
            <Stack flexDirection={'row'} alignItems={'center'} onClick={(e) => e.stopPropagation()}>
              <Checkbox
                name={`${item.itemId}`}
                checked={Boolean(values[item.itemId])}
                onChange={(e, checked) => {
                  if (!checked) setIsIndeterminate(false);
                  onChange(item.itemId, checked);
                }}
              />
              <Typography whiteSpace={'nowrap'}>{item.label}</Typography>
            </Stack>
          }
          sx={treeItemStyleCustom}
        />
      ))}
      {children}
    </TreeItem>
  );
}

export default TreeItemRole;
