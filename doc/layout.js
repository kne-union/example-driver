const {default: ExampleDriver} = _ExampleDriver;

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
const { Input, Card } = antd;

const Component = () => {
  return (
    <Card size="small" title="示例 2">
      <Input placeholder="输入内容..." />
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

// 默认双列布局
render(<ExampleDriver list={[{
    title: '按钮示例',
    description: '展示按钮组件',
    code: example1,
    scope: [{name: 'antd', packageName: 'antd', component: antd}]
}, {
    title: '输入框示例',
    description: '展示输入框组件',
    code: example2,
    scope: [{name: 'antd', packageName: 'antd', component: antd}]
}, {
    title: '下拉框示例',
    description: '展示下拉选择组件',
    code: example3,
    scope: [{name: 'antd', packageName: 'antd', component: antd}]
}, {
    title: '开关示例',
    description: '展示开关组件',
    code: example4,
    scope: [{name: 'antd', packageName: 'antd', component: antd}]
}]}/>);
