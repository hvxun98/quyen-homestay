import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BrandProps } from 'types/brands';
import { ProvinceProps } from 'types/province';

interface AppState {
  brands: BrandProps[];
  provinces: ProvinceProps[];
}

const initialState: AppState = {
  brands: [],
  provinces: []
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setStateBrands: (state, action: PayloadAction<BrandProps[]>) => {
      state.brands = action.payload;
    },
    setStateProvinces: (state, action: PayloadAction<ProvinceProps[]>) => {
      state.provinces = action.payload;
    }
  }
});

export const { setStateBrands, setStateProvinces } = appSlice.actions;
export default appSlice.reducer;
