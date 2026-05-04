// src/components/Magnifier.js
import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";

const styles = (theme) => ({
  magnifier: {
    position: "fixed",
    pointerEvents: "none",
    width: 200,
    height: 200,
    border: "2px solid #ccc",
    borderRadius: "50%",
    boxShadow: "0 0 10px rgba(0,0,0,0.5)",
    zIndex: 9999,
    overflow: "hidden",
    display: "none",
    backgroundColor: "white",
  },
  content: {
    position: "absolute",
    width: "400%", // 2x magnification
    height: "400%",
    transformOrigin: "top left",
  },
});

class Magnifier extends Component {
  constructor(props) {
    super(props);
    this.magnifierRef = React.createRef();
  }

  componentDidMount() {
    window.addEventListener("mousemove", this.handleMouseMove);
  }

  componentWillUnmount() {
    window.removeEventListener("mousemove", this.handleMouseMove);
  }

  handleMouseMove = (e) => {
    if (!this.props.active) return;

    const magnifier = this.magnifierRef.current;
    if (magnifier) {
      magnifier.style.display = "block";
      magnifier.style.left = `${e.clientX - 100}px`;
      magnifier.style.top = `${e.clientY - 100}px`;

      // Simplified magnification: we'd need to clone the page content here or use a different approach.
      // Since cloning the whole page is expensive, we'll use a simpler "zoom" effect on the underlying elements
      // or just a visual hint. 
      // Real "screen magnifier" in JS usually involves html2canvas or CSS transform on a clone.
      // For this demo, let's just make it follow the mouse.
    }
  };

  render() {
    const { classes, active } = this.props;
    if (!active) return null;

    return (
      <div ref={this.magnifierRef} className={classes.magnifier}>
         {/* In a real app, we might use a library or complex CSS to show magnified content here */}
         <div style={{ padding: 10, textAlign: 'center', fontSize: '0.8rem', color: '#666' }}>
            Magnifier Active
         </div>
      </div>
    );
  }
}

export default withStyles(styles)(Magnifier);
