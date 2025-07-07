import { InputLabel, InputLabelProps } from '@mui/material';

interface LabelWithAsteriskProps extends InputLabelProps {
  label: string;
  required?: boolean;
}

const LabelWithAsterisk = ({ label, required, ...props }: LabelWithAsteriskProps) => {
  return (
    <InputLabel {...props}>
      {label}
      {required && <span style={{ color: props.color === 'primary' ? '#1976d2' : '#f44336', marginLeft: 2 }}>*</span>}
    </InputLabel>
  );
};

export default LabelWithAsterisk;
