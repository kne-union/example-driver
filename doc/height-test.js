const {default: ExampleDriver} = _ExampleDriver;
const {useState} = React;
const {Button, Card, Space, Switch, Tag} = antd;

const code = `
const { Button, Card, Space } = antd;
const { useState } = React;

const Component = () => {
  const [count, setCount] = useState(0);
  return (
    <div style={{ padding: '20px' }}>
      <Card title="高度测试组件" style={{ minHeight: '200px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ fontSize: '32px', textAlign: 'center', padding: '20px 0' }}>
            {count}
          </div>
          <Space>
            <Button onClick={() => setCount(count - 1)}>-</Button>
            <Button onClick={() => setCount(count + 1)}>+</Button>
            <Button onClick={() => setCount(0)} danger>重置</Button>
          </Space>
        </Space>
      </Card>
    </div>
  );
};

render(<Component />);
`;

const HeightTestExample = () => {
    const [mounted, setMounted] = useState(true);

    const list = [{
        title: '高度稳定性测试',
        description: '通过开关控制组件挂载/卸载，观察卸载后占位高度与渲染高度是否一致',
        code,
        mounted,
        scope: [{
            name: 'antd', packageName: 'antd', component: antd
        }]
    }];

    return (
        <Space direction="vertical" style={{width: '100%'}} size="large">
            <Card size="small">
                <Space>
                    <Switch checked={mounted} onChange={setMounted} checkedChildren="挂载" unCheckedChildren="卸载"/>
                    <Tag color={mounted ? 'green' : 'red'}>{mounted ? '已挂载' : '已卸载'}</Tag>
                    <Button size="small" onClick={() => {
                        setMounted(false);
                        setTimeout(() => setMounted(true), 100);
                    }}>快速切换</Button>
                    <Button size="small" onClick={() => {
                        for (let i = 0; i < 3; i++) {
                            setTimeout(() => setMounted(prev => !prev), i * 200);
                        }
                    }}>连续切换3次</Button>
                    <span style={{color: '#999', fontSize: 12}}>
                        切换后观察页面是否抖动，占位高度是否与渲染高度一致
                    </span>
                </Space>
            </Card>
            <ExampleDriver isFull list={list}/>
        </Space>
    );
};

render(<HeightTestExample/>);
