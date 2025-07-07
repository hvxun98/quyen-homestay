import { ButtonProps } from '@mui/material';
import { Button, Popover } from '@mui/material';
import React from 'react';

interface CustomPopoverProps {
  children: React.ReactNode;
  button?: React.ReactNode;
  buttonText?: string;
  buttonProps?: ButtonProps;
}

const CustomPopover = ({ children, button, buttonText = 'Open', buttonProps }: CustomPopoverProps) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <>
      {button ? (
        <Button onClick={handleClick} {...buttonProps}>
          {button}
        </Button>
      ) : (
        <Button aria-describedby={id} variant="contained" onClick={handleClick} {...buttonProps}>
          {buttonText}
        </Button>
      )}

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
      >
        <div onClick={() => setAnchorEl(null)}>{children}</div>
      </Popover>
    </>
  );
};

export default CustomPopover;
