export const toVND = (val: string | number) => new Intl.NumberFormat('vi-VN').format(Number(val || 0));
