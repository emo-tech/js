import React, { useState, useCallback } from 'react'
import { Button, DatePicker, Space, Toast, DatePickerView, DatePickerFilter } from 'antd-mobile'
import moment from "moment";
import _ from 'lodash'


function App() {
  const [visible, setVisible] = useState(false)
  const now = new Date()
  const dateRange:Array<any> = [['1995-10-04', '1997-10-04'], ['2013-10-04', '2015-10-04']].flat().map(x => moment(x))


  const filter: DatePickerFilter = {
    year: (val: number) => {
      if ((val >= dateRange[0].year() && val <= dateRange[1].year()) || (val >= dateRange[2].year() && val <= dateRange[3].year())) {
        return true;
      }
      return false;
    },
    month: (val: number, { date }) => {
      return ((moment(date).isSameOrAfter(dateRange[0], 'month') &&  moment(date).isSameOrBefore(dateRange[1], 'month'))
          || (moment(date).isSameOrAfter(dateRange[2], 'month') &&  moment(date).isSameOrBefore(dateRange[3], 'month')))

    },
    day: (val, { date }) => {
      return ((date.getTime() >= dateRange[0].toDate().getTime() && date.getTime() <= dateRange[1].toDate().getTime())
          || (date.getTime() >= dateRange[2].toDate().getTime() && date.getTime() <= dateRange[3].toDate().getTime()))
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
        min={dateRange[0].toDate()}
        max={dateRange[3].toDate()}
        visible={visible}
        onClose={() => {
          setVisible(false)
        }}
        renderLabel={labelRenderer}
        onConfirm={val => {
          Toast.show(val.toLocaleString())
        }}
        // defaultValue={now}
        precision='day'
        filter={filter}
      />
    </div>
  );
}

export default App;
