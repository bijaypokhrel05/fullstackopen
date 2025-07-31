const App = () => {
  const courses = {
    name: 'Half Stack application development',
    parts: [
      {
        name: 'Fundamental of React',
        exercises: 10
      },
      {
        name: 'Using props to pass data',
        exercises: 7
      },

      {
        name: 'State of component',
        exercises: 14
      }
    ]
  };

  const Header = (props) => {
    return (
      <>
        <h1>{props.course}</h1>
      </>
    )
  };

  const Content = ({ parts }) => {
    return (
      <>
        <Part part={parts[0]} />
        <Part part={parts[1]} />
        <Part part={parts[2]} />
      </>
    )
  };

  const Part = ({ part }) => {
    return (
      <>
        <p>{part.name} {part.exercises}</p>
      </>
    )
  }

  const Total = ({ parts }) => {
    return (
      <p>Number of exercises {parts[0].exercises + parts[1].exercises + parts[2].exercises}</p>
    )
  };

  return (
    <div>
      <Header course={courses.name} />
      <Content parts={courses.parts} />
      <Total parts={courses.parts} />
    </div>
  )
};

export default App;