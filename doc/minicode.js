const {default: ExampleDriver} = _ExampleDriver;

const code = `
const { Form, Input, Button, Space } = antd;
const { useState } = React;

const Component = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState([]);

  const onFinish = (values) => {
    setData([...data, values]);
    form.resetFields();
  };

  return (
    <div style={{ padding: '12px' }}>
      <Form form={form} onFinish={onFinish} layout="vertical">
        <Form.Item name="name" label="姓名" rules={[{ required: true }]}>
          <Input placeholder="输入姓名" />
        </Form.Item>
        <Form.Item name="email" label="邮箱" rules={[{ required: true, type: 'email' }]}>
          <Input placeholder="输入邮箱" />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">提交</Button>
            <Button onClick={() => form.resetFields()}>重置</Button>
          </Space>
        </Form.Item>
      </Form>

      {data.length > 0 && (
        <div style={{ marginTop: '12px' }}>
          <h4>已提交数据：</h4>
          {data.map((item, index) => (
            <p key={index}>{item.name} - {item.email}</p>
          ))}
        </div>
      )}
    </div>
  );
};

render(<Component />);
`;

render(<ExampleDriver list={[{
    title: 'MiniCode 模式',
    description: '二维码预览模式，通过 qrcodeUrl 属性添加二维码引导用户查看',
    code,
    qrcodeUrl: 'https://www.kne-union.top/static-data/mini-core/0.jpg',
    scope: [{
        name: 'antd', packageName: 'antd', component: antd
    }]
}]}/>);
