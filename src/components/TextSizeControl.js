// src/components/TextSizeControl.js
import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import { Slider, Typography } from "@material-ui/core";

const styles = (theme) => ({
  sliderContainer: {
    width: 60, // Reduced from 100
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  sliderLabel: {
    fontSize: "0.6rem", // Even smaller
    color: theme.palette.text.secondary,
    lineHeight: 1,
  },
  slider: {
    padding: "8px 0",
    "& .MuiSlider-thumb": {
      width: 8, // Smaller thumb
      height: 8,
    },

    "& .MuiSlider-rail": {
      height: 2, // Thinner rail
    },
    "& .MuiSlider-track": {
      height: 2, // Thinner track
    },
  },
});

class TextSizeControl extends Component {
  render() {
    const { classes, textSize, onTextSizeChange } = this.props;

    return (
      <div className={classes.sliderContainer}>
        <Typography className={classes.sliderLabel}>Text Size</Typography>
        <Slider
          value={textSize}
          onChange={onTextSizeChange}
          min={0}
          max={100}
          step={1}
          className={classes.slider}
        />
      </div>
    );
  }
}

export default withStyles(styles)(TextSizeControl);