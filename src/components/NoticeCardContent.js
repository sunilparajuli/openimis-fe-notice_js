// src/components/NoticeCardContent.js
import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
} from "@material-ui/core";
import NotificationImportantIcon from "@material-ui/icons/NotificationImportant";
import LocalHospitalIcon from "@material-ui/icons/LocalHospital";
import PriorityHighIcon from "@material-ui/icons/PriorityHigh";
import PriorityChip from "./PriorityChip";

const styles = (theme) => ({
  card: {
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.spacing(1),
    // padding: theme.spacing(2),
    width: "100%",
    minWidth: 0,
    flexGrow: 1,
  },
  cardContent: {
    padding: theme.spacing(2), // Default padding, adjustable
    "&:last-child": {
      paddingBottom: theme.spacing(2), // Ensures consistent spacing
    },
  },
  title: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(2),
  },
  description: {
    marginBottom: theme.spacing(2),
  },
  metadata: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: theme.spacing(2),
  },
  chip: {
    margin: theme.spacing(0.5),
  },
});

class NoticeCardContent extends Component {
  render() {
    const { classes, notice, textSize, textColor, lineHeight, highContrast, dyslexicFont } = this.props;

    const getTextStyles = (size) => {
      if (size <= 33) {
        return { title: { variant: "h6", fontSize: "1rem" }, description: { variant: "body2", fontSize: "0.875rem" }, metadata: { variant: "caption", fontSize: "0.75rem" } };
      } else if (size <= 66) {
        return { title: { variant: "h5", fontSize: "1.25rem" }, description: { variant: "h6", fontSize: "1rem" }, metadata: { variant: "body2", fontSize: "0.875rem" } };
      } else {
        return { title: { variant: "h4", fontSize: "1.5rem" }, description: { variant: "h5", fontSize: "1.25rem" }, metadata: { variant: "body1", fontSize: "1rem" } };
      }
    };

    const sizes = getTextStyles(textSize);
    const fontStyle = dyslexicFont ? { fontFamily: "OpenDyslexic, 'Comic Sans MS', cursive" } : {};
    const contrastColor = highContrast ? "#ffffff" : (textColor || "#000000");

    return (
      <Card elevation={0} className={classes.card} style={{ backgroundColor: highContrast ? "#000000" : "inherit" }}>
        <CardContent className={classes.cardContent}>
          <Box className={classes.title}>
            <NotificationImportantIcon style={{ marginRight: 8, color: contrastColor }} />
            <Typography
              variant={sizes.title.variant}
              component={sizes.title.variant}
              style={{ 
                color: contrastColor, 
                fontWeight: 500, 
                fontSize: sizes.title.fontSize,
                lineHeight: lineHeight,
                ...fontStyle
              }}
            >
              {notice.title}
            </Typography>
          </Box>
          <Typography
            variant={sizes.description.variant}
            style={{ 
              color: contrastColor, 
              fontSize: sizes.description.fontSize,
              lineHeight: lineHeight,
              ...fontStyle
            }}
          >
            {notice.description}
          </Typography>
          <Box className={classes.metadata}>
            <Box display="flex" alignItems="center">
              <LocalHospitalIcon fontSize="small" style={{ marginRight: 8, color: contrastColor }} />
              <Typography 
                variant={sizes.metadata.variant} 
                style={{ 
                  color: highContrast ? "#ffffff" : "#616161", 
                  fontSize: sizes.metadata.fontSize,
                  lineHeight: lineHeight,
                  ...fontStyle
                }}
              >
                {notice.healthFacility?.name || "No Facility"}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center">
              <PriorityHighIcon fontSize="small" style={{ marginRight: 8, color: contrastColor }} />
              <PriorityChip priority={notice.priority} />
            </Box>
            {notice.attachmentCount > 0 && (
              <Chip
                label={`${notice.attachmentCount} Attachment${notice.attachmentCount > 1 ? "s" : ""}`}
                size="small"
                className={classes.chip}
                style={highContrast ? { border: "1px solid #ffffff", color: "#ffffff", backgroundColor: "#000000" } : {}}
              />
            )}
          </Box>
        </CardContent>
      </Card>
    );
  }
}

export default withStyles(styles)(NoticeCardContent);