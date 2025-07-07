'use client';
import { Box, Grid, List, ListItemButton, ListItemText } from '@mui/material';
import { ROUTES } from 'constants/routes';
import { useRouter } from 'next/navigation';
import { FormattedMessage } from 'react-intl';

type SettingItem = {
  value: string;
  labelId: string;
  url: string;
};

const settingsList: SettingItem[] = [
  { value: 'normTable', labelId: 'normTable', url: ROUTES.SETTING_NORM_TABLE },
  { value: 'priceTable', labelId: 'priceTable', url: ROUTES.SETTING_PRICE_TABLE },
  { value: 'preservation', labelId: 'preservation', url: ROUTES.SETTING_PRESERVATION },
  { value: 'testReport', labelId: 'testReport', url: ROUTES.SETTING_TEST_REPORT },
  { value: 'formula', labelId: 'formula', url: ROUTES.SETTING_FORMULA },
  { value: 'standardColumns', labelId: 'standardColumns', url: ROUTES.SETTING_STANDARD_COLUMNS },
  { value: 'analysisCriteria', labelId: 'analysisCriteria', url: ROUTES.SETTING_ANALYSIS_CRITERIA },
  { value: 'subCriteria', labelId: 'subCriteria', url: ROUTES.SETTING_SUB_CRITERIA },
  { value: 'equipmentList', labelId: 'equipmentList', url: ROUTES.SETTING_EQUIPMENT_LIST },
  { value: 'resetPassword', labelId: 'resetPassword', url: ROUTES.SETTING_RESET_PASSWORD },
  { value: 'standardUnit', labelId: 'standardUnit', url: ROUTES.SETTING_STANDARD_UNIT },
  { value: 'chemical', labelId: 'chemical', url: ROUTES.SETTING_CHEMICAL },
  { value: 'sampleToolType', labelId: 'sampleToolType', url: ROUTES.SETTING_SAMPLE_TOOL_TYPE },
  { value: 'planType', labelId: 'planType', url: ROUTES.SETTING_PLAN_TYPE },
  { value: 'sampleTypes', labelId: 'sampleTypes', url: ROUTES.SAMPLE_TYPES },
  { value: 'equipmentCode', labelId: 'equipmentCode', url: ROUTES.SETTING_EQUIPMENT_CODE },
  { value: 'priorityLevel', labelId: 'priorityLevel', url: ROUTES.SETTING_PRIORITY_LEVEL },
  { value: 'industry', labelId: 'industry', url: ROUTES.SETTING_INDUSTRY },
  { value: 'supplier', labelId: 'supplier', url: ROUTES.SETTING_SUPPLIER },
  { value: 'manufacturer', labelId: 'manufacturer', url: ROUTES.SETTING_MANUFACTURER },
  { value: 'employee', labelId: 'employee', url: ROUTES.SETTING_EMPLOYEE },
  { value: 'environmentalGroup', labelId: 'environmentalGroup', url: ROUTES.SETTING_ENVIRONMENTAL_GROUP },
  { value: 'analysisGroup', labelId: 'analysisGroup', url: ROUTES.SETTING_ANALYSIS_GROUP },
  { value: 'sampleToolGroup', labelId: 'sampleToolGroup', url: ROUTES.SETTING_SAMPLE_TOOL_GROUP },
  { value: 'analysisToolGroup', labelId: 'analysisToolGroup', url: ROUTES.SETTING_ANALYSIS_TOOL_GROUP },
  { value: 'branch', labelId: 'branch', url: ROUTES.SETTING_BRANCH },
  { value: 'analysisMethod', labelId: 'analysisMethod', url: ROUTES.SETTING_ANALYSIS_METHOD },
  { value: 'regulation', labelId: 'regulation', url: ROUTES.SETTING_REGULATION },
  { value: 'templateBreakdown', labelId: 'templateBreakdown', url: ROUTES.SETTING_TEMPLATE_BREAKDOWN },
  { value: 'templateTest', labelId: 'templateTest', url: ROUTES.SETTING_TEMPLATE_TEST },
  { value: 'subcontractor', labelId: 'subcontractor', url: ROUTES.SETTING_SUBCONTRACTOR },
  { value: 'companyInfo', labelId: 'companyInfo', url: ROUTES.SETTING_COMPANY_INFO }
];

function SettingView() {
  const router = useRouter();

  const columns = [0, 1, 2].map((colIndex) => settingsList.slice(colIndex * 11, colIndex * 11 + 11));

  return (
    <Box p={2} mt={6} sx={{ backgroundColor: '#fff', borderRadius: '8px' }}>
      <Grid container spacing={2}>
        {columns.map((items, colIndex) => (
          <Grid item xs={12} md={4} key={colIndex}>
            <List dense>
              {items.map((item, itemIndex) => {
                const displayIndex = colIndex * 11 + itemIndex + 1;
                return (
                  <ListItemButton
                    key={item.value}
                    onClick={() => router.push(item.url)}
                    sx={{
                      '&:hover': {
                        backgroundColor: '#f0f0f0'
                      }
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box fontSize={14}>
                          {displayIndex}. <FormattedMessage id={item.labelId} />
                        </Box>
                      }
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default SettingView;
