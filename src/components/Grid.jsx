import { forwardRef } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

const GridContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: grid;
  pointer-events: none;

  & div {
    background: ${(props) => props.$initialColor};
    border: 1px solid rgba(0, 0, 0, 0.1);
  }
`;

const createGridStyle = (numCols, numRows) => ({
  gridTemplateColumns: `repeat(${numCols}, 1fr)`,
  gridTemplateRows: `repeat(${numRows}, 1fr)`,
});

const Grid = forwardRef(({ numCols, numRows, initialColor }, ref) => (
  <GridContainer
    style={createGridStyle(numCols, numRows)}
    $initialColor={initialColor}
  >
    {[...Array(numCols * numRows)].map((_, idx) => (
      <div key={idx} ref={(el) => (ref.current[idx] = el)}></div>
    ))}
  </GridContainer>
));

Grid.displayName = "Grid";

Grid.propTypes = {
  numCols: PropTypes.number.isRequired,
  numRows: PropTypes.number.isRequired,
  initialColor: PropTypes.string.isRequired,
};

export default Grid;
