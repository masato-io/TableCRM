// react & redux
import React from 'react';
import { connect } from 'react-redux';
import { Link, Switch, Route } from 'react-router-dom';
import RightPanelLead from './RightPanelLead.jsx';
// styled-component
import styled from 'styled-components';
import { getLeadById } from '../actions/leadsActions';

const RightPanelWrap = styled.div`
	overflow-x: hidden;
	overflow-y: scroll;
	height: calc(100vh - 65px);
	position: fixed;
	background-color: #fff;
	z-index: 1000000000;
	width: 800px;
	right: -800px;
	bottom: 0;
	box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.24);
	border-radius: 2px;
	transition: transform 0.3s ease;
`;

const RightPanelInner = styled.div`
	padding: 28px;
`;

const HidePanelButton = styled.div`
	cursor: pointer;
`;

const InputWrap = styled.div`
	/*
	position: relative;
	display: -webkit-box;
	display: -ms-flexbox;
	display: flex;
	-webkit-box-orient: horizontal;
	-webkit-box-direction: normal;
	-ms-flex-direction: row;
	flex-direction: row;
	width: 100%;
	max-width: 400px;
	margin: 0 auto;
	border-radius: 2px;
	padding: 1.4rem 2rem 1.6rem;
	background: rgba(57, 63, 84, 0.8);
  */
`;

const InputField = styled.input`
	/*
	-webkit-box-flex: 1;
	-ms-flex-positive: 1;
	flex-grow: 1;
	color: #bfd2ff;
	font-size: 1.8rem;
	line-height: 2.4rem;
	vertical-align: middle;
  */
`;

const Test = () => <div>test</div>;

class RightPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount() {
    if (!this.props.selectedLead) {
      const rowId = this.props.match.params.id;
      this.props.dispatch(getLeadById(rowId));
    }
    const rightPanel = document.getElementsByClassName('right_panel')[0];
    if (rightPanel.style.webkitTransform === '') {
      rightPanel.style.webkitTransform = 'translateX(-800px)';
    }
  }
  render() {
    return (
      <RightPanelWrap className="right_panel">
        <RightPanelInner>
          {/* <Route exact path="/leads/:id" component={RightPanelLead} /> */}
          <HidePanelButton>
            <i
              className="material-icons hide_panel"
              onClick={() => {
                this.props.history.push('/leads');
                const rightPanel = document.getElementsByClassName(
                  'right_panel'
                )[0];
                rightPanel.style.webkitTransform = 'translateX(800px)';
              }}
            >
							arrow_forward
            </i>
          </HidePanelButton>
          {this.props.selectedLead
            ? this.props.selectedLead.map(i => (
              <div key={Object.keys(i)[0]}>
                <p>{Object.keys(i)[0]}</p>
                <InputWrap>
                  <InputField
                    className="field_input"
                    type="field"
                    placeholder=""
                    defaultValue={i[Object.keys(i)[0]]}
                    key={i[Object.keys(i)[0]]}
                  />
                </InputWrap>
              </div>
            ))
            : null}
        </RightPanelInner>
      </RightPanelWrap>
    );
  }
}

const mapStateToProps = state => ({
  selectedLead: state.leadsReducer.selectedLead
});

export default connect(mapStateToProps, null)(RightPanel);
