const {default: ExampleDriver} = _ExampleDriver;

// 示例代码字符串
const code = `
const { Button, Card, Space } = antd;
const { useState } = React;

const Component = () => {
  const [count, setCount] = useState(0);
  return (
    <div style={{ padding: '12px' }}>
      <Card>
        <h4 style={{ marginBottom: '12px' }}>计数器示例</h4>
        <Space>
          <Button onClick={() => setCount(count - 1)}>-</Button>
          <span style={{ fontSize: '18px' }}>{count}</span>
          <Button onClick={() => setCount(count + 1)}>+</Button>
          <Button onClick={() => setCount(0)} danger>重置</Button>
        </Space>
      </Card>
    </div>
  );
};

render(<Component />);
`;

render(<ExampleDriver list={[{
    title: '基本使用', description: 'ExampleDriver 的基础用法，展示简单的计数器示例', code, scope: [{
        name: 'antd', packageName: 'antd', component: antd
    }]
}]}/>);
