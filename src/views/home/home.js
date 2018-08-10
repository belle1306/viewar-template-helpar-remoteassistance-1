import { withRouter } from 'react-router'
import { compose, withHandlers, lifecycle, withProps, withState } from 'recompose'

import viewarApi from 'viewar-api'
import { getUiConfigPath } from '../../utils'
import { withDialogControls } from '../../services/dialog'
import { withSetLoading } from '../../services/loading'
import withCallClient from '../../services/call-client'
import authManager from '../../services/auth-manager'
import highlightManager from '../../services/highlight-manager'

import Home from './home.jsx'

export const goTo = ({history}) => async (route) => {
  history.push(route)
}

export const init = ({viewarApi: { cameras }, disconnect, setLoadingDone, highlightManager, resetTrackers, authManager, updateProgress}) => async () => {
  setLoadingDone(false)

  disconnect()

  await cameras.perspectiveCamera.activate()
  await resetTrackers()
  await authManager.readPersisted()

  await highlightManager.init(updateProgress)
  setLoadingDone(true)
}

export const resetTrackers = ({viewarApi}) => async () => {
  for (let tracker of Object.values(viewarApi.trackers)) {
    await tracker.deactivate()
  }
}

export const goToMain = ({setLoading, viewarApi: { appConfig }, history}) => async() => {
  history.push('/calibration')
}

export const goToUserSelection = ({setLoading, authManager, showDialog, history}) => async() => {
  if (authManager.user) {
    history.push('/user-selection')
  } else {
    const {confirmed, input} = await showDialog('HomeUsername', {
      input: authManager.token || '',
      withInput: true,
      showCancel: true,
      confirmText: 'HomeLogin',
    })

    if (confirmed && input) {
      setLoading(true)
      const success = await authManager.login(input)
      setLoading(false)

      success && history.push('/user-selection')
    }
  }
}

export const updateProgress = ({ setProgress, setStatus }) => (count) => {
  const progress = ((count.current + count.currentProgress / 100) / count.total) * 100
  setProgress(progress)
}

export default compose(
  withCallClient,
  withRouter,
  withDialogControls,
  withSetLoading,
  withState('loadingDone', 'setLoadingDone', false),
  withState('progress', 'setProgress', 0),
  withProps({
    viewarApi,
    getUiConfigPath,
    authManager,
    highlightManager,
  }),
  withHandlers({
    resetTrackers,
    updateProgress,
  }),
  withHandlers({
    init,
    goTo,
    goToUserSelection,
    goToMain,
  }),
  lifecycle({
    componentDidMount () {
      this.props.init()
    }
  }),
)(Home)
