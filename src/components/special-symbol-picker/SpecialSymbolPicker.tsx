import { Box, Button, ClickAwayListener, IconButton, Paper, Popper, Tooltip } from '@mui/material';
import React, { useRef, useState } from 'react';
import { SPECIAL_SYMBOLS } from '../../constants/specialSymbols';
import FunctionsIcon from '@mui/icons-material/Functions';
interface SpecialSymbolPickerProps {
  onSelect: (symbol: string) => void;
  icon?: React.ReactNode;
}

const SpecialSymbolPicker: React.FC<SpecialSymbolPickerProps> = ({ onSelect, icon = <FunctionsIcon /> }) => {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement | null>(null);

  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Box>
      <Tooltip title="Chèn ký hiệu">
        <IconButton size="small" ref={anchorRef} onClick={handleToggle}>
          {icon}
        </IconButton>
      </Tooltip>

      <Popper
        open={open}
        anchorEl={anchorRef.current}
        placement="bottom-end"
        modifiers={[
          {
            name: 'offset',
            options: {
              offset: [0, 8]
            }
          }
        ]}
        style={{ zIndex: 2000 }}
      >
        <ClickAwayListener onClickAway={handleClose}>
          <Paper
            sx={{
              mt: 1,
              p: 1,
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 32px)',
              gap: 1,
              borderRadius: 1,
              boxShadow: 3
            }}
          >
            {SPECIAL_SYMBOLS.map((symbol) => (
              <Button
                key={symbol}
                onClick={() => {
                  onSelect(symbol);
                  handleClose();
                }}
                size="small"
                sx={{
                  minWidth: 0,
                  width: 32,
                  height: 32,
                  fontSize: 16,
                  textTransform: 'none',
                  padding: 0
                }}
              >
                {symbol}
              </Button>
            ))}
          </Paper>
        </ClickAwayListener>
      </Popper>
    </Box>
  );
};

export default SpecialSymbolPicker;
