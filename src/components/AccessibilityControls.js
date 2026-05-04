// src/components/AccessibilityControls.js
import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import { Box, IconButton, Tooltip, Divider } from "@material-ui/core";
import TextSizeControl from "./TextSizeControl";

import TextColorControl from "./TextColorControl";
import FormatLineSpacingIcon from "@material-ui/icons/FormatLineSpacing";
import InvertColorsIcon from "@material-ui/icons/InvertColors";
import SpellcheckIcon from "@material-ui/icons/Spellcheck";
import SearchIcon from "@material-ui/icons/Search";
import { Slider } from "@material-ui/core";

import { alpha } from "@material-ui/core/styles";

const styles = (theme) => ({
  accessibilityControls: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1), // Reduced from 2 to 1
    padding: "4px 8px", // More compact padding
    backgroundColor: alpha(theme.palette.background.paper, 0.8),
    borderRadius: theme.spacing(3), // More rounded for pill shape
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
    backdropFilter: "blur(5px)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
  },
  controlGroup: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
  },
  slider: {
    width: 40, // Reduced from 60 to 40
  },

  activeButton: {
    color: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
  },
});


class AccessibilityControls extends Component {
  render() {
    const { 
      classes, 
      textSize, 
      textColor, 
      lineHeight,
      highContrast,
      dyslexicFont,
      magnifierActive,
      onTextSizeChange, 
      onTextColorChange,
      onLineHeightChange,
      onToggleHighContrast,
      onToggleDyslexicFont,
      onToggleMagnifier
    } = this.props;

    return (
      <Box className={classes.accessibilityControls}>
        <TextSizeControl textSize={textSize} onTextSizeChange={onTextSizeChange} />
        
        <Divider orientation="vertical" flexItem style={{ margin: "4px 0" }} />
        
        <TextColorControl textColor={textColor} onTextColorChange={onTextColorChange} />

        <Divider orientation="vertical" flexItem style={{ margin: "4px 0" }} />

        <Box className={classes.controlGroup}>
          <Tooltip title="Line Height">
            <Box display="flex" alignItems="center" gap={0.5}>
              <FormatLineSpacingIcon fontSize="small" />
              <Slider
                value={lineHeight}
                onChange={onLineHeightChange}
                min={1}
                max={3}
                step={0.1}
                className={classes.slider}
              />
            </Box>
          </Tooltip>
        </Box>

        <Divider orientation="vertical" flexItem style={{ margin: "4px 0" }} />

        <Tooltip title="Toggle High Contrast">
          <IconButton 
            size="small" 
            onClick={onToggleHighContrast}
            className={highContrast ? classes.activeButton : ""}
          >
            <InvertColorsIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Dyslexic Friendly Font">
          <IconButton 
            size="small" 
            onClick={onToggleDyslexicFont}
            className={dyslexicFont ? classes.activeButton : ""}
          >
            <SpellcheckIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Toggle Magnifier">
          <IconButton 
            size="small" 
            onClick={onToggleMagnifier}
            className={magnifierActive ? classes.activeButton : ""}
          >
            <SearchIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    );
  }
}

export default withStyles(styles)(AccessibilityControls);