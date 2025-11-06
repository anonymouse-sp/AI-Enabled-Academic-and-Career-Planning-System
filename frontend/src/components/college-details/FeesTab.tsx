import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { College } from '../../types/college';

interface FeesTabProps {
  college: College;
}

export const FeesTab = ({ college }: FeesTabProps) => {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const feesBreakdown = [
    { type: 'Tuition Fee', amount: college.fees.tuition },
    { type: 'Accommodation', amount: college.fees.accommodation },
    { type: 'Other Charges', amount: college.fees.other },
    {
      type: 'Total Annual Fee',
      amount: college.fees.tuition + college.fees.accommodation + college.fees.other,
    },
  ];

  return (
    <Box>
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Fee Structure (Annual)
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Fee Type</TableCell>
                <TableCell align="right">Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {feesBreakdown.map((row) => (
                <TableRow
                  key={row.type}
                  sx={{
                    '&:last-child td, &:last-child th': { fontWeight: 'bold' },
                  }}
                >
                  <TableCell component="th" scope="row">
                    {row.type}
                  </TableCell>
                  <TableCell align="right">{formatAmount(row.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Additional Information
        </Typography>
        <Typography variant="body1" paragraph>
          * The above fees are subject to change as per university guidelines.
        </Typography>
        <Typography variant="body1" paragraph>
          * Scholarships and financial aid may be available for eligible students.
        </Typography>
        <Typography variant="body1" paragraph>
          * Payment can be made in multiple installments as per university policy.
        </Typography>
        <Typography variant="body1">
          * Additional charges may apply for special courses or facilities.
        </Typography>
      </Paper>
    </Box>
  );
};