import { VaDatePickerView, VaDatePickerViewProp, VaDatePickerModelValue } from '../types'
import { computed, ref } from 'vue'
import isDate from 'lodash/isDate.js'

const JANUARY_MONTH_INDEX = 0
const DECEMBER_MONTH_INDEX = 11

const addMonth = (view: VaDatePickerView) => {
  if (view.month === DECEMBER_MONTH_INDEX) {
    return { ...view, year: view.year + 1, month: JANUARY_MONTH_INDEX }
  } else {
    return { ...view, month: view.month + 1 }
  }
}

const subMonth = (view: VaDatePickerView) => {
  if (view.month === JANUARY_MONTH_INDEX) {
    return { ...view, year: view.year - 1, month: DECEMBER_MONTH_INDEX }
  } else {
    return { ...view, month: view.month - 1 }
  }
}

const getDefaultDate = (modelValue: VaDatePickerModelValue): Date => {
  if (isDate(modelValue)) { return modelValue }
  if (isDate((modelValue as any)?.start)) { return (modelValue as any).start }
  if (Array.isArray(modelValue) && isDate(modelValue[0])) { return modelValue[0] }

  return new Date()
}

export const useView = (
  props: { [key: string]: any, 'view'?: VaDatePickerViewProp },
  emit: (event: any | 'update:view', newValue: VaDatePickerViewProp) => any,
  defaultOverride?: VaDatePickerViewProp,
) => {
  const defaultDate = getDefaultDate(props.modelValue)
  const defaultView: VaDatePickerView = {
    type: 'day',
    year: defaultDate.getFullYear(),
    month: defaultDate.getMonth(),
    ...defaultOverride,
  }

  const statefulView = ref(defaultView)

  const syncView = computed<VaDatePickerView>({
    get () {
      // Merge default view and user view prop
      return { ...statefulView.value, ...props.view }
    },
    set (view: VaDatePickerView) {
      statefulView.value = view

      emit('update:view', view)
    },
  })

  const next = () => {
    if (syncView.value.type === 'day') {
      syncView.value = addMonth(syncView.value)
    } else if (syncView.value.type === 'month') {
      syncView.value = { ...syncView.value, year: syncView.value.year + 1 }
    }
  }

  const prev = () => {
    if (syncView.value.type === 'day') {
      syncView.value = subMonth(syncView.value)
    } else if (syncView.value.type === 'month') {
      syncView.value = { ...syncView.value, year: syncView.value.year - 1 }
    }
  }

  return {
    syncView,
    next,
    prev,
  }
}
