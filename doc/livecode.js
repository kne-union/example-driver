const {default: ExampleDriver} = _ExampleDriver;

const code = `
const { Button, Input, List, Space, Tag } = antd;
const { useState } = React;

const Component = () => {
  const [text, setText] = useState('');
  const [items, setItems] = useState(['学习 React', '编写组件']);

  const addItem = () => {
    if (text.trim()) {
      setItems([...items, text.trim()]);
      setText('');
    }
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  return (
    <div style={{ padding: '12px' }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Space.Compact style={{ width: '100%' }}>
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="输入事项..."
            onPressEnter={addItem}
          />
          <Button type="primary" onClick={addItem}>添加</Button>
        </Space.Compact>
        <List
          size="small"
          dataSource={items}
          renderItem={(item, index) => (
            <List.Item
              actions={[
                <Button type="link" size="small" onClick={() => removeItem(index)}>
                  删除
                </Button>
              ]}
            >
              <Tag>{item}</Tag>
            </List.Item>
          )}
        />
      </Space>
    </div>
  );
};

render(<Component />);
`;

render(<ExampleDriver list={[{
    title: 'LiveCode 模式', description: '支持实时代码编辑，可以在编辑器中修改代码并实时预览效果', code, scope: [{
        name: 'antd', packageName: 'antd', component: antd
    }]
}]}/>);
