const {default: ExampleDriver} = _ExampleDriver;

const exampleFull = `
const { Alert, Card } = antd;

const Component = () => {
  return (
    <Card size="small" title="全屏示例">
      <Alert message="该项设置了 isFull: true，在外层双列模式下置顶整行显示" type="info" showIcon />
    </Card>
  );
};

render(<Component />);
`;

const example1 = `
const { Button, Card } = antd;

const Component = () => {
  return (
    <Card size="small" title="示例 1">
      <Button type="primary">按钮 A</Button>
      <Button style={{ marginLeft: '8px' }}>按钮 B</Button>
    </Card>
  );
};

render(<Component />);
`;

const example2 = `
const { Input, Card, Space } = antd;
const { TextArea } = Input;

const Component = () => {
  return (
    <Card size="small" title="示例 2">
      <Space orientation="vertical" style={{ width: '100%' }}>
        <Input placeholder="输入内容..." />
        <TextArea rows={4} placeholder="多行输入..." />
      </Space>
    </Card>
  );
};

render(<Component />);
`;

const example3 = `
const { Select, Card } = antd;
const { Option } = Select;

const Component = () => {
  return (
    <Card size="small" title="示例 3">
      <Select placeholder="请选择" style={{ width: '100%' }}>
        <Option value="1">选项 1</Option>
        <Option value="2">选项 2</Option>
      </Select>
    </Card>
  );
};

render(<Component />);
`;

const example4 = `
const { Switch, Card } = antd;

const Component = () => {
  return (
    <Card size="small" title="示例 4">
      <Switch />
    </Card>
  );
};

render(<Component />);
`;

const scope = [{name: 'antd', packageName: 'antd', component: antd}];

// 双列瀑布流布局：isFull 项置顶整行，其余项按高度分配到两列
render(<ExampleDriver list={[{
    title: '按钮示例',
    description: '展示按钮组件',
    code: example1,
    scope
}, {
    title: '全屏示例',
    description: '设置 isFull: true 后在外层双列模式下置顶整行显示',
    code: exampleFull,
    scope,
    isFull: true
}, {
    title: '输入框示例',
    description: '展示输入框组件，高度较高以演示瀑布流分配',
    code: example2,
    scope
}, {
    title: '下拉框示例',
    description: '展示下拉选择组件',
    code: example3,
    scope
}, {
    title: '开关示例',
    description: '展示开关组件',
    code: example4,
    scope
}]}/>);
