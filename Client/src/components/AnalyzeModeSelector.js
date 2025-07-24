import React, { useState } from 'react';
import { Button, ButtonGroup, Menu, MenuItem, Box } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

const AnalyzeModeSelector = ({ onModeSelect, currentMode, currentSubMode }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [subMenuAnchor, setSubMenuAnchor] = useState(null);
  const open = Boolean(anchorEl);
  const subMenuOpen = Boolean(subMenuAnchor);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSubMenuOpen = (event) => {
    event.stopPropagation();
    setSubMenuAnchor(event.currentTarget);
  };

  const handleSubMenuClose = () => {
    setSubMenuAnchor(null);
  };

  const handleModeSelect = (mode, subMode = null) => {
    onModeSelect(mode, subMode);
    handleClose();
    if (subMenuAnchor) {
      handleSubMenuClose();
    }
  };

  const getButtonText = () => {
    if (currentMode === 'manual') {
      return `Manual Mode${currentSubMode ? `: ${currentSubMode}` : ''}`;
    }
    return currentMode === 'ai' ? 'AI Mode' : 'Select Mode';
  };

  return (
    <Box>
      <ButtonGroup
        variant="contained"
        aria-label="Analyze mode selector"
        sx={{ mr: 1 }}
      >
        <Button
          onClick={handleClick}
          endIcon={<ArrowDropDownIcon />}
          sx={{
            backgroundColor: currentMode ? 'primary.main' : 'grey.400',
            '&:hover': {
              backgroundColor: currentMode ? 'primary.dark' : 'grey.500',
            },
          }}
        >
          {getButtonText()}
        </Button>
      </ButtonGroup>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <MenuItem 
          onClick={() => handleModeSelect('ai')}
          selected={currentMode === 'ai'}
        >
          AI Mode
        </MenuItem>
        <MenuItem 
          onClick={(e) => {
            if (currentMode === 'manual') {
              handleModeSelect('manual');
            } else {
              handleSubMenuOpen(e);
            }
          }}
          selected={currentMode === 'manual'}
        >
          Manual Mode
          {currentMode === 'manual' && <ArrowDropDownIcon sx={{ ml: 1 }} />}
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={subMenuAnchor}
        open={subMenuOpen}
        onClose={handleSubMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <MenuItem 
          onClick={() => handleModeSelect('manual', 'Analyze')}
          selected={currentMode === 'manual' && currentSubMode === 'Analyze'}
        >
          Analyze
        </MenuItem>
        <MenuItem 
          onClick={() => handleModeSelect('manual', 'Dry Run')}
          selected={currentMode === 'manual' && currentSubMode === 'Dry Run'}
        >
          Dry Run
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default AnalyzeModeSelector;
