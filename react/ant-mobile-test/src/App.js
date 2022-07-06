import React, { useState, useCallback } from 'react'
import { Button, DatePicker, Space, Toast, DatePickerView, DatePickerFilter } from 'antd-mobile'

function App() {
  const [visible, setVisible] = useState(false)
  const now = new Date()

  const filter: DatePickerFilter = {
    month: (val: number) => {
      // 只显示双数月份
      if (val % 2 !== 0) {
        return false
      }
      return true
    },
    day: (val, { date }) => {
      // 去除所有周末
      if (date.getDay() > 5 || date.getDay() === 0) {
        return false
      }
      return true
    }
  }

  const dateFilter: DatePickerFilter = {
    day: (val, { date }) => {
      // 去除所有周末
      if (date.getDay() > 5 || date.getDay() === 0) {
        return false
      }
      return true
    },
    hour: (val: number) => {
      // 只保留每天的14点到18点
      if (val < 14 || val > 18) {
        return false
      }
      return true
    },
  }

  const labelRenderer = (type: string, data: number) => {
    switch (type) {
      case 'year':
        return data + '年'
      case 'month':
        return data + '月'
      case 'day':
        return data + '日'
      case 'hour':
        return data + '时'
      case 'minute':
        return data + '分'
      case 'second':
        return data + '秒'
      default:
        return data
    }
  }

  return (
    <div className="App">
      <p>test date-picker</p>
      DatePicker:
      <Button
        onClick={() => {
          setVisible(true)
        }}
      >
        选择
      </Button>
      <DatePicker
        title='时间选择'
        visible={visible}
        onClose={() => {
          setVisible(false)
        }}
        renderLabel={labelRenderer}
        onConfirm={val => {
          Toast.show(val.toLocaleString())
        }}
        defaultValue={now}
        precision='day'
        // filter={filter}
        filter={filter}
      />

      <DatePickerView
        defaultValue={now}
        precision='hour'
        renderLabel={labelRenderer}
        filter={dateFilter}
      />
    </div>
  );
}

export default App;
