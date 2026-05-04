// src/components/TextColorControl.js
import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import { TextField, Typography, Box, IconButton, Tooltip } from "@material-ui/core";

const styles = (theme) => ({
  colorPickerContainer: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
  },
  colorPickerLabel: {
    display: "none", // Hide label for compactness
  },
  colorPicker: {
    width: 24, // Smaller
    height: 24,
    padding: 0,
    "& .MuiInputBase-input": {
      padding: 0,
      width: "100%",
      height: "100%",
      cursor: "pointer",
      borderRadius: "50%", // Circular for dots look
    },
  },
  presets: {
    display: "flex",
    gap: 2,
  },
  preset: {
    width: 12, // Smaller
    height: 12,
    borderRadius: "50%",
    cursor: "pointer",
    border: "1px solid rgba(0,0,0,0.1)",
    "&:hover": {
      transform: "scale(1.2)",
    },
  },
});


const PRESET_COLORS = ["#000000", "#7C3E8C", "#1B5E20", "#0D47A1", "#B71C1C"];

class TextColorControl extends Component {
  render() {
    const { classes, textColor, onTextColorChange } = this.props;

    const handlePresetClick = (color) => {
      onTextColorChange({ target: { value: color } });
    };

    return (
      <div className={classes.colorPickerContainer}>
        <Box display="flex" alignItems="center" gap={0.5}>
          <TextField
            type="color"
            value={textColor}
            onChange={onTextColorChange}
            className={classes.colorPicker}
            variant="outlined"
            InputProps={{ style: { padding: 0 } }}
          />
          <Box className={classes.presets}>
            {PRESET_COLORS.map((color) => (
              <Tooltip key={color} title={color}>
                <div
                  className={classes.preset}
                  style={{ backgroundColor: color, border: textColor === color ? "2px solid #000" : "1px solid rgba(0,0,0,0.1)" }}
                  onClick={() => handlePresetClick(color)}
                />
              </Tooltip>
            ))}
          </Box>
        </Box>
      </div>
    );
  }
}

export default withStyles(styles)(TextColorControl);