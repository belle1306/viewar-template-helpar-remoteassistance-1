import { compose, withHandlers, lifecycle, withProps, withState } from 'recompose'
import withRouteParams from '../../services/route-params'
import viewarApi from 'viewar-api'
import withCallClient from '../../services/call-client'
import { getUiConfigPath } from '../../utils'
import { withDialogControls } from '../../services/dialog'
import { withSetLoading } from '../../services/loading'
import authManager from '../../services/auth-manager'

import UserSelection from './user-selection.jsx'

export const updateClientList = ({ setClients, callClient, selectedClient, setSelectedClient }) => async() => {
  const clients = callClient.clients.list().filter(client => !client.supportAgent && client.available)

  if (!clients.find(client => client === selectedClient)) {
    setSelectedClient(null)
  }

  setClients(clients)
}

export const call = ({ showDialog, setWaitingForUser, goTo, setLoading, callClient, selectedClient }) => async() => {
  const client = selectedClient

  callSubscription = callClient.acceptedCall.subscribe(() => {
    setWaitingForUser(false)
    goTo('/call-admin')
  })

  lineBusyCallSubscription = callClient.lineBusy.subscribe(() => {
    setWaitingForUser(false)
    showDialog('UserSelectionLineBusy', {
      confirmText: 'DialogOK'
    })
  })

  setLoading(true)
  await callClient.call({ id: client.id })
  setLoading(false)

  setWaitingForUser(client.id)
}

let clientSubscription
let callSubscription
let refusedCallSubscription
let lineBusyCallSubscription
export default compose(
  withCallClient,
  withDialogControls,
  withSetLoading,
  withRouteParams(),
  withState('selectedClient', 'setSelectedClient', null),
  withState('clients', 'setClients', []),
  withState('waitingForUser', 'setWaitingForUser', false),
  withProps({
    viewarApi,
    getUiConfigPath,
    authManager,
  }),
  withHandlers({
    updateClientList,
    call,
  }),
  lifecycle({
    async componentDidMount() {
      const { connect, callClient, updateClientList, viewarApi: { appConfig }, authManager } = this.props

      await connect({sessionId: appConfig.appId, user: authManager.user.username, userData: { supportAgent: true }})
      if (callClient.connected) {
        clientSubscription = callClient.clients.subscribe(updateClientList)
        updateClientList()
      }
    },
    componentWillUnmount() {
      if (clientSubscription) {
        clientSubscription.unsubscribe()
      }
      if (callSubscription) {
        callSubscription.unsubscribe()
      }
      if (refusedCallSubscription) {
        refusedCallSubscription.unsubscribe()
      }
      if (lineBusyCallSubscription) {
        lineBusyCallSubscription.unsubscribe()
      }
    },
  })
)(UserSelection)