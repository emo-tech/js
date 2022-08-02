import React, { useState } from 'react';
import { TextArea } from 'antd-mobile'

function Input() {
  const [textAreaValue, setTextAreaValue] = useState('')

  return (
    <div className="App">
      <p>test input</p>
      <div>
        <input
          type="text"
          value={textAreaValue}
          onChange={e => {
            console.log('input onChange', e.target.value)
          }}
          onInput={e => {
            console.log(' input onInput', e.target.value)
          }}
        />
      </div>
      <div>
        <textarea
          value={textAreaValue}
          onChange={e => {
            setTextAreaValue(e.target.value)
            console.log('textarea onChange', '输入的值为: [' + e.target.value + ']')
          }}
          onInput={e => {
            console.log('textarea onInput', '输入的值为: [' + e.target.value + ']')
          }}
        />
      </div>
      <div style={{border: '1px solid black'}}>
        <TextArea
          value={textAreaValue}
          onChange={value => {
            setTextAreaValue(value)
            console.log('Ant TextArea onChange', '输入的值为: [' + value + ']')
          }}
          onInput={value => {
            console.log('Ant TextArea onInput', '输入的值为: [' + value + ']')
          }}
        />
      </div>
    </div>
  );
}

export default Input;
