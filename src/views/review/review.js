import { compose, withHandlers, lifecycle, withProps, withState } from 'recompose'
import viewarApi from 'viewar-api'
import { getUiConfigPath } from '../../utils'
import { withDialogControls } from '../../services/dialog'
import { withSetLoading } from '../../services/loading'
import withRouteParams from '../../services/route-params'
import annotationDb from '../../services/annotation-db'
import annotationManager from '../../services/annotation-manager'
import fakeData from '../../services/annotation-db/fake-data'
import { generateId } from '../../utils'

import Review from './review.jsx'

export const init = ({setLoading, annotationDb, setAnnotations}) => async () => {
  setLoading(true)
  // await annotationDb.load()
  setLoading(false)

  // const annotations = annotationManager.saved
  const annotations = fakeData.map(({pose, model}) => ({
    pose,
    model,
    freezeFrame: {
      thumbnailUrl: 'https://icdn3.digitaltrends.com/image/apple-iphone-7-plus-screenshot-0006-675x1200.png?ver=1'
      // thumbnailUrl: 'data:image/jpeg;base64,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'
    },
    id: generateId(),
  }))

  setAnnotations(annotations)
}

export const removeAnnotation = ({ annotations, setAnnotations }) => (annotation) => {
  const index = annotations.findIndex(entry => entry.id === annotation.id)
  if (index !== -1) {
    annotations.splice(index, 1)
    setAnnotations(annotations)
  }
}

export const createTag = ({tags, setTags, tag, setTag}) => () => {
  if (tags.indexOf(tag) === -1) {
    tags.push(tag)
    setTags(tags)
  }
  setTag('')
}

export const removeTag = ({setTags, tags}) => (tag) => {
  const index = tags.indexOf(tag)
  tags.splice(index, 1)
  setTags(tags)
}

export const updateAnnotation = ({ annotations, annotation, setAnnotation, setAnnotations }) => (details) => {
  window.annotations = annotations
  Object.assign(annotation, details)
  setAnnotation(undefined)
}

export const saveReview = ({ goToLastView, setLoading, showDialog, annotations }) => async() => {
  const unhandledAnnotations = annotations.some(annotation => !annotation.title)
  let save = true

  if (unhandledAnnotations) {
    const { confirmed } = await showDialog('ReviewContinueSaving', {
      confirmText: 'Save',
      showCancel: true
    })

    save = confirmed
  }

  if (save) {
    setLoading(true)
    // TODO: Save review
    setLoading(false)

    goToLastView()
  }
}

export default compose(
  withDialogControls,
  withSetLoading,
  withRouteParams(),
  withState('annotations', 'setAnnotations', []),
  withState('tag', 'setTag', ''),
  withState('tags', 'setTags', []),
  withState('annotation', 'setAnnotation', null),
  withProps({
    viewarApi,
    getUiConfigPath,
    annotationDb,
    annotationManager,
  }),
  withHandlers({
    init,
    removeAnnotation,
    createTag,
    saveReview,
    removeTag,
    updateAnnotation,
  }),
  lifecycle({
    componentDidMount () {
      this.props.init()
    }
  }),
)(Review)
