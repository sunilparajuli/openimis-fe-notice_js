// src/components/NoticeCalendar.js
import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { Box, Typography } from "@material-ui/core";

const styles = (theme) => ({
  calendarBox: {
    width: 70,
    height: 80,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.spacing(1),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    overflow: "hidden",
    backgroundColor: theme.palette.background.paper,
    marginRight: theme.spacing(3),
    flexShrink: 0,
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  },
  calendarHeader: {
    width: "100%",
    backgroundColor: theme.palette.primary.main,
    color: "#ffffff",
    textAlign: "center",
    padding: "2px 0",
    fontSize: "0.75rem",
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  calendarBody: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    flexGrow: 1,
  },
  calendarDay: {
    fontSize: "1.5rem",
    fontWeight: 800,
    lineHeight: 1,
    color: theme.palette.text.primary,
  },
  calendarYear: {
    fontSize: "0.7rem",
    color: theme.palette.text.secondary,
    marginTop: 2,
  },
});


const NoticeCalendar = ({ classes, createdAt }) => {
  const date = new Date(createdAt);
  const day = date.getDate();
  const month = date.toLocaleString("default", { month: "short" });
  const year = date.getFullYear();

  return (
    <Box className={classes.calendarBox}>
      <Box className={classes.calendarHeader}>
        {month}
      </Box>
      <Box className={classes.calendarBody}>
        <Typography className={classes.calendarDay}>{day}</Typography>
        <Typography className={classes.calendarYear}>{year}</Typography>
      </Box>
    </Box>
  );
};

export default withStyles(styles)(NoticeCalendar);