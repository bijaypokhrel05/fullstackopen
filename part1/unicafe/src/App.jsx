import { useState } from 'react'

function App() {
  const [good, setGood] = useState(0);
  const [neutral, setNeutral] = useState(0);
  const [bad, setBad] = useState(0);

  function Button ({onclickFunc, label}) {
    return (
      <button onClick = {onclickFunc}>{label}</button>
    );
  };

  function Statistics ({ label, noOfReview }) {
    return <tr>
      <td>{label}</td>
      <td>{noOfReview}</td>
    </tr>
  }
  return (
    <>
      <h1 id = "title">give feedback</h1>
      <Button onclickFunc = {() => setGood(good + 1)} label = 'good' />
      <Button onclickFunc = {() => setNeutral(neutral + 1)} label = 'neutral' />
      <Button onclickFunc = {() => setBad(bad + 1)} label = 'bad' />
      <h1 id = "subtitle">statistics</h1>
      {!(good + neutral + bad) ? (<p>No feedback given</p>) :(
        <table>
        <Statistics label = 'good' noOfReview = {good} />
        <Statistics label = 'neutral' noOfReview = {neutral} />
        <Statistics label = 'bad' noOfReview = {bad} />
        <Statistics label = 'all' noOfReview = {good + neutral + bad} />
        <Statistics label = 'average' noOfReview = {(good - bad) / (good + neutral + bad)} />
        <Statistics label = 'positive' noOfReview = {`${(good / (good + neutral + bad) * 100)} %`} />
      </table>
      )}
    </>
  )
}

export default App
