import { useReducer } from 'react'

function reducer(state, action) {
  switch (action.type) {
    case 'update': {
      const { id, field, value } = action
      return {
        ...state,
        [id]: {
          ...state[id],
          [field]: value,
        },
      }
    }
    case 'clear': {
      const { id } = action
      const next = { ...state }
      delete next[id]
      return next
    }
    default:
      return state
  }
}

export function useEditingState() {
  const [editing, dispatch] = useReducer(reducer, {})

  const updateField = (id, field, value) => {
    dispatch({ type: 'update', id, field, value })
  }

  const clear = (id) => {
    dispatch({ type: 'clear', id })
  }

  return { editing, updateField, clear }
}
