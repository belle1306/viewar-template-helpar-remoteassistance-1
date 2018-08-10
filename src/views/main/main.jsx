import React from 'react'
import cx from 'classnames'
import { translate } from '../../services'

import styles from './main.css'
import global from '../../../css/global.css'

import HeaderBar from '../../components/header-bar/header-bar'
import Button from '../../components/button/button'

const WaitForSupportAgentOverlay = ({visible}) => <div className={cx(styles.WaitForSupportAgentOverlay, !visible && styles.isHidden)}>
  {translate('MainWaitForSupportAgent')}
</div>

export default ({ waitingForSupportAgent, highlight, goBack }) =>
  <div className={cx(styles.Main)}>
    <HeaderBar goBack={goBack} />
    <WaitForSupportAgentOverlay visible={waitingForSupportAgent} />
    <Button medium onClick={highlight} icon="" className={styles.HighlightButton} />
  </div>
