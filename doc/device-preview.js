const {default: ExampleDriver} = _ExampleDriver;

const code = `
const { Button, Card, Space } = antd;
const { useState } = React;

const Component = () => {
  const [count, setCount] = useState(0);
  return (
    <div style={{ padding: '12px' }}>
      <Card size="small" title="设备预览示例">
        <Space>
          <Button onClick={() => setCount(count - 1)}>-</Button>
          <span style={{ fontSize: '18px' }}>{count}</span>
          <Button onClick={() => setCount(count + 1)}>+</Button>
        </Space>
      </Card>
    </div>
  );
};

render(<Component />);
`;

const scope = [{name: 'antd', packageName: 'antd', component: antd}];

render(<ExampleDriver list={[
    {
        title: '默认设备切换',
        description: '默认开启电脑 / 手机切换，手机模式下可切换 iPhone Pro Max / Pro / SE',
        code,
        scope
    },
    {
        title: '关闭设备切换',
        description: '设置 devicePreview: false 隐藏设备切换',
        code,
        scope,
        devicePreview: false
    }
]}/>);
