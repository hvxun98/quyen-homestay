// next
import Link from 'next/link';

// material-ui
import ButtonBase from '@mui/material/ButtonBase';
import { SxProps } from '@mui/system';
import { Typography } from '@mui/material';

// third-party
import { To } from 'history';

// project-imports
// import Logo from './LogoMain';
// import LogoIcon from './LogoIcon';
import { APP_DEFAULT_PATH } from 'config';

// ==============================|| MAIN LOGO ||============================== //

interface Props {
  reverse?: boolean;
  isIcon?: boolean;
  sx?: SxProps;
  to?: To;
}

export default function LogoSection({ reverse, isIcon, sx, to }: Props) {
  return (
    <ButtonBase disableRipple component={Link} href={!to ? APP_DEFAULT_PATH : to} sx={sx}>
      {/* {isIcon ? <LogoIcon /> : <Logo reverse={reverse} />} */}
      <Typography fontSize={24}>1MT Homestay</Typography>
    </ButtonBase>
  );
}
