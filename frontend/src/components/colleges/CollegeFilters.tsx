import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Slider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Checkbox,
  ListItemText,
} from '@mui/material';
import { CollegeFilters as ICollegeFilters } from '../../types/college';

interface FilterProps {
  filters: ICollegeFilters;
  onFilterChange: (filters: ICollegeFilters) => void;
}

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const courses = [
  'Computer Science',
  'Electronics',
  'Mechanical',
  'Civil',
  'Chemical',
  'Information Technology',
  'Electrical',
  'Biotechnology',
];

const facilities = [
  'Library',
  'Sports Complex',
  'Laboratory',
  'Cafeteria',
  'Wi-Fi Campus',
  'Hostel',
  'Gym',
  'Auditorium',
];

const states = [
  'Maharashtra',
  'Delhi',
  'Karnataka',
  'Tamil Nadu',
  'Uttar Pradesh',
  'Gujarat',
  // Add more states as needed
];

export const CollegeFilters = ({ filters, onFilterChange }: FilterProps) => {
  const [localFilters, setLocalFilters] = useState<ICollegeFilters>({
    ...filters,
    courses: filters.courses || [],
    facilities: filters.facilities || [],
    location: filters.location || {},
    fees: filters.fees || { min: 0, max: 1000000 },
    placements: filters.placements || { minPackage: 0 },
  });

  const handleChange = (key: keyof ICollegeFilters | 'location.state' | 'location.city' | 'placements.minPackage', value: any) => {
    const newFilters = { ...localFilters };
    if (key.includes('.')) {
      const [parent, child] = key.split('.') as [keyof ICollegeFilters, string];
      if (!newFilters[parent]) {
        newFilters[parent] = {} as any;
      }
      (newFilters[parent] as any)[child] = value;
    } else {
      newFilters[key as keyof ICollegeFilters] = value;
    }
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Filters
      </Typography>

      {/* Location Filter */}
      <Box mb={3}>
        <Typography variant="subtitle1" gutterBottom>
          Location
        </Typography>
        <FormControl fullWidth margin="normal">
          <InputLabel id="state-label">State</InputLabel>
          <Select<string>
            labelId="state-label"
            id="state"
            value={localFilters.location?.state ?? ''}
            label="State"
            onChange={(e) => handleChange('location.state', e.target.value)}
          >
            {states.map((state) => (
              <MenuItem key={state} value={state}>
                {state}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          fullWidth
          margin="normal"
          label="City"
          value={localFilters.location?.city || ''}
          onChange={(e) => handleChange('location.city', e.target.value)}
        />
      </Box>

      {/* Courses Filter */}
      <Box mb={3}>
        <Typography variant="subtitle1" gutterBottom>
          Courses
        </Typography>
        <FormControl fullWidth>
          <InputLabel id="courses-label">Select Courses</InputLabel>
          <Select<string[]>
            labelId="courses-label"
            id="courses"
            multiple
            value={localFilters.courses ?? []}
            onChange={(event) => {
              handleChange('courses', event.target.value);
            }}
            input={<OutlinedInput label="Select Courses" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {(selected as string[]).map((value) => (
                  <Chip key={value} label={value} />
                ))}
              </Box>
            )}
            MenuProps={MenuProps}
          >
            {courses.map((course) => (
              <MenuItem key={course} value={course}>
                <Checkbox
                  checked={
                    localFilters.courses?.includes(course) ?? false
                  }
                />
                <ListItemText primary={course} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Fees Range Filter */}
      <Box mb={3}>
        <Typography variant="subtitle1" gutterBottom>
          Annual Fees Range (in ₹)
        </Typography>
        <Slider
          value={[
            localFilters.fees?.min || 0,
            localFilters.fees?.max || 1000000,
          ]}
          onChange={(_, newValue) =>
            handleChange('fees', {
              min: (newValue as number[])[0],
              max: (newValue as number[])[1],
            })
          }
          valueLabelDisplay="auto"
          min={0}
          max={1000000}
          step={50000}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Typography variant="body2">₹0</Typography>
          <Typography variant="body2">₹10L</Typography>
        </Box>
      </Box>

      {/* Placement Filter */}
      <Box mb={3}>
        <Typography variant="subtitle1" gutterBottom>
          Minimum Placement Package (in LPA)
        </Typography>
        <Slider
          value={localFilters.placements?.minPackage || 0}
          onChange={(_, newValue) =>
            handleChange('placements.minPackage', newValue)
          }
          valueLabelDisplay="auto"
          min={0}
          max={50}
          step={1}
        />
      </Box>

      {/* Facilities Filter */}
      <Box mb={3}>
        <Typography variant="subtitle1" gutterBottom>
          Facilities
        </Typography>
        <FormControl fullWidth>
          <InputLabel id="facilities-label">Select Facilities</InputLabel>
          <Select<string[]>
            labelId="facilities-label"
            id="facilities"
            multiple
            value={localFilters.facilities ?? []}
            onChange={(event) => {
              handleChange('facilities', event.target.value);
            }}
            input={<OutlinedInput label="Select Facilities" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {(selected as string[]).map((value) => (
                  <Chip key={value} label={value} />
                ))}
              </Box>
            )}
            MenuProps={MenuProps}
          >
            {facilities.map((facility) => (
              <MenuItem key={facility} value={facility}>
                <Checkbox
                  checked={
                    localFilters.facilities?.includes(facility) ?? false
                  }
                />
                <ListItemText primary={facility} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Paper>
  );
};