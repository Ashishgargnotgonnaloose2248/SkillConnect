import React from 'react';

const TestComponent: React.FC = () => {
  console.log('TestComponent is rendering!');
  
  return (
    <div style={{ padding: '20px', backgroundColor: 'lightblue', margin: '20px' }}>
      <h1>Test Component</h1>
      <p>If you can see this, React is working!</p>
      <p>Current time: {new Date().toLocaleString()}</p>
    </div>
  );
};

export default TestComponent;

