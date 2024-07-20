import PropTypes from "prop-types";
import styled from "styled-components";

const Container = styled.section`
  position: relative;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

const VideoContainer = styled.div`
  position: relative;
  width: 640px;
  height: 360px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Main = ({ children }) => {
  return (
    <Container>
      <VideoContainer>{children}</VideoContainer>
    </Container>
  );
};

Main.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Main;
